import type {
	HeadlessCollectionDocumentBricks,
	Select,
} from "../libs/db/types.js";
import {
	deleteQB,
	selectQB,
	type QueryBuilderWhereT,
} from "../libs/db/query-builder.js";
import type { Config } from "../libs/config/config-schema.js";
import type { BrickSchemaT } from "../schemas/collection-bricks.js";

export default class CollectionDocumentBricksRepo {
	constructor(private db: DB) {}

	// ----------------------------------------
	// select
	selectSingle = async <
		K extends keyof Select<HeadlessCollectionDocumentBricks>,
	>(props: {
		select: K[];
		where: QueryBuilderWhereT<"headless_collection_document_bricks">;
	}) => {
		let query = this.db
			.selectFrom("headless_collection_document_bricks")
			.select(props.select);

		query = selectQB(query, props.where);

		return query.executeTakeFirst() as Promise<
			Pick<Select<HeadlessCollectionDocumentBricks>, K> | undefined
		>;
	};
	selectMultipleByDocumentId = async (props: {
		documentId: number;
		config: Config;
	}) => {
		return this.db
			.selectFrom("headless_collection_document_bricks")
			.select((eb) => [
				"headless_collection_document_bricks.id",
				"headless_collection_document_bricks.brick_type",
				"headless_collection_document_bricks.brick_key",
				"headless_collection_document_bricks.collection_document_id",
				"headless_collection_document_bricks.brick_order",
				props.config.db
					.jsonArrayFrom(
						eb
							.selectFrom("headless_collection_document_groups")
							.select([
								"headless_collection_document_groups.group_id",
								"headless_collection_document_groups.collection_document_id",
								"headless_collection_document_groups.collection_brick_id",
								"headless_collection_document_groups.parent_group_id",
								"headless_collection_document_groups.language_id",
								"headless_collection_document_groups.repeater_key",
								"headless_collection_document_groups.group_order",
								"headless_collection_document_groups.ref",
							])
							.whereRef(
								"headless_collection_document_groups.collection_brick_id",
								"=",
								"headless_collection_document_bricks.id",
							),
					)
					.as("groups"),
				props.config.db
					.jsonArrayFrom(
						eb
							.selectFrom("headless_collection_document_fields")
							.leftJoin("headless_collection_documents", (join) =>
								join.onRef(
									"headless_collection_documents.id",
									"=",
									"headless_collection_document_fields.page_link_id",
								),
							)
							.leftJoin("headless_media", (join) =>
								join.onRef(
									"headless_media.id",
									"=",
									"headless_collection_document_fields.media_id",
								),
							)
							.select((eb) => [
								"headless_collection_document_fields.fields_id",
								"headless_collection_document_fields.collection_brick_id",
								"headless_collection_document_fields.group_id",
								"headless_collection_document_fields.language_id",
								"headless_collection_document_fields.key",
								"headless_collection_document_fields.type",
								"headless_collection_document_fields.text_value",
								"headless_collection_document_fields.int_value",
								"headless_collection_document_fields.bool_value",
								"headless_collection_document_fields.json_value",
								"headless_collection_document_fields.page_link_id",
								"headless_collection_document_fields.media_id",
								"headless_collection_document_fields.collection_document_id",
								// Page fields
								"headless_collection_documents.id as page_id",
								// Media fields
								"headless_media.key as media_key",
								"headless_media.mime_type as media_mime_type",
								"headless_media.file_extension as media_file_extension",
								"headless_media.file_size as media_file_size",
								"headless_media.width as media_width",
								"headless_media.height as media_height",
								"headless_media.type as media_type",
								props.config.db
									.jsonArrayFrom(
										eb
											.selectFrom("headless_translations")
											.select([
												"headless_translations.value",
												"headless_translations.language_id",
											])
											.where(
												"headless_translations.value",
												"is not",
												null,
											)
											.whereRef(
												"headless_translations.translation_key_id",
												"=",
												"headless_media.title_translation_key_id",
											),
									)
									.as("media_title_translations"),
								props.config.db
									.jsonArrayFrom(
										eb
											.selectFrom("headless_translations")
											.select([
												"headless_translations.value",
												"headless_translations.language_id",
											])
											.where(
												"headless_translations.value",
												"is not",
												null,
											)
											.whereRef(
												"headless_translations.translation_key_id",
												"=",
												"headless_media.alt_translation_key_id",
											),
									)
									.as("media_alt_translations"),
							])
							.whereRef(
								"headless_collection_document_fields.collection_brick_id",
								"=",
								"headless_collection_document_bricks.id",
							),
					)
					.as("fields"),
			])
			.orderBy("headless_collection_document_bricks.brick_order", "asc")
			.where(
				"headless_collection_document_bricks.collection_document_id",
				"=",
				props.documentId,
			)
			.execute();
	};
	// ----------------------------------------
	// upsert
	upsertMultiple = async (props: {
		items: Array<{
			id?: number;
			brickType: BrickSchemaT["type"];
			brickKey?: string;
			brickOrder?: number;
			collectionDocumentId: number;
		}>;
	}) => {
		return this.db
			.insertInto("headless_collection_document_bricks")
			.values(
				props.items.map((b) => {
					return {
						id: b.id,
						brick_type: b.brickType,
						brick_key: b.brickKey,
						brick_order: b.brickOrder,
						collection_document_id: b.collectionDocumentId,
					};
				}),
			)
			.onConflict((oc) =>
				oc.column("id").doUpdateSet((eb) => ({
					brick_order: eb.ref("excluded.brick_order"),
				})),
			)
			.returning(["id", "brick_order", "brick_key", "brick_type"])
			.execute();
	};
	// ----------------------------------------
	// delete
	deleteMultiple = async (props: {
		where: QueryBuilderWhereT<"headless_collection_document_bricks">;
	}) => {
		let query = this.db
			.deleteFrom("headless_collection_document_bricks")
			.returning(["id"]);

		query = deleteQB(query, props.where);

		return query.executeTakeFirst();
	};
}