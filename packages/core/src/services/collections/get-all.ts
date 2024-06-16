import Repository from "../../libs/repositories/index.js";
import Formatter from "../../libs/formatters/index.js";
import type { ServiceFn } from "../../libs/services/types.js";
import type { CollectionResponse } from "../../types/response.js";

const getAll: ServiceFn<
	[
		{
			includeDocumentId?: boolean;
		},
	],
	CollectionResponse[]
> = async (service, data) => {
	const collections = service.config.collections ?? [];

	const CollectionsFormatter = Formatter.get("collections");

	if (data.includeDocumentId === true) {
		const singleCollections = collections.filter(
			(collection) => collection.data.mode === "single",
		);

		const CollectionDocumentsRepo = Repository.get(
			"collection-documents",
			service.db,
		);

		const documents = await CollectionDocumentsRepo.selectMultiple({
			select: ["collection_key", "id"],
			where: [
				{
					key: "is_deleted",
					operator: "=",
					value: 0,
				},
				{
					key: "collection_key",
					operator: "in",
					value: singleCollections.map((c) => c.key),
				},
			],
		});

		return {
			error: undefined,
			data: CollectionsFormatter.formatMultiple({
				collections: collections,
				include: {
					bricks: false,
					fields: false,
					document_id: true,
				},
				documents: documents,
			}),
		};
	}

	return {
		error: undefined,
		data: CollectionsFormatter.formatMultiple({
			collections: collections,
			include: {
				bricks: false,
				fields: false,
				document_id: false,
			},
		}),
	};
};

export default getAll;
