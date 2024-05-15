import type { BrickSchema } from "../../schemas/collection-bricks.js";
import type { FieldSchemaType } from "../../schemas/collection-fields.js";
import type { ServiceConfig } from "../../utils/service-wrapper.js";
import Repository from "../../libs/repositories/index.js";
import formatInsertBricks from "./helpers/format-insert-bricks.js";
import formatPostInsertBricks from "./helpers/format-post-insert-bricks.js";
import formatInsertFields from "./helpers/format-insert-fields.js";
import collectionBricksServices from "./index.js";
import serviceWrapper from "../../utils/service-wrapper.js";

export interface ServiceData {
	documentId: number;
	bricks?: Array<BrickSchema>;
	fields?: Array<FieldSchemaType>;
	collectionKey: string;
}

const createMultiple = async (
	serviceConfig: ServiceConfig,
	data: ServiceData,
) => {
	const CollectionDocumentBricksRepo = Repository.get(
		"collection-document-bricks",
		serviceConfig.db,
	);

	// -------------------------------------------------------------------------------
	// set bricks
	const bricks = formatInsertBricks({
		bricks: data.bricks,
		fields: data.fields,
		documentId: data.documentId,
		localisation: serviceConfig.config.localisation,
	});
	if (bricks.length === 0) return;

	// -------------------------------------------------------------------------------
	// validation
	collectionBricksServices.checks.checkDuplicateOrder(bricks);
	await collectionBricksServices.checks.checkValidateBricks(serviceConfig, {
		collectionKey: data.collectionKey,
		bricks: bricks,
	});

	// -------------------------------------------------------------------------------
	// delete all bricks
	await serviceWrapper(collectionBricksServices.deleteMultipleBricks, false)(
		serviceConfig,
		{
			documentId: data.documentId,
			apply: {
				bricks: data.bricks !== undefined,
				collectionFields: data.fields !== undefined,
			},
		},
	);

	// -------------------------------------------------------------------------------
	// insert bricks
	const bricksRes = await CollectionDocumentBricksRepo.createMultiple({
		items: bricks.map((b) => ({
			brickType: b.type,
			brickKey: b.key,
			brickOrder: b.order,
			brickOpen: b.open,
			collectionDocumentId: data.documentId,
		})),
	});

	const postInsertBricks = formatPostInsertBricks(bricks, bricksRes);

	// -------------------------------------------------------------------------------
	// create groups
	const groups = await serviceWrapper(
		collectionBricksServices.createMultipleGroups,
		false,
	)(serviceConfig, {
		documentId: data.documentId,
		brickGroups: postInsertBricks.map((b) => ({
			brickId: b.id,
			groups: b.groups,
		})),
	});

	// -------------------------------------------------------------------------------
	// create fields
	await serviceWrapper(collectionBricksServices.createMultipleFields, false)(
		serviceConfig,
		{
			documentId: data.documentId,
			fields: postInsertBricks.flatMap((b) =>
				formatInsertFields({
					groups: groups,
					brickId: b.id,
					fields: b.fields,
				}),
			),
		},
	);
};

export default createMultiple;
