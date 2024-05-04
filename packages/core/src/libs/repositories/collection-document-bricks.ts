import type {
	HeadlessCollectionDocumentBricks,
	Select,
	KyselyDB,
} from "../db/types.js";
import {
	deleteQB,
	selectQB,
	type QueryBuilderWhereT,
} from "../db/query-builder.js";
import type { Config } from "../../types/config.js";
import type { BrickSchema } from "../../schemas/collection-bricks.js";

export default class CollectionDocumentBricksRepo {
	constructor(private db: KyselyDB) {}

	// ----------------------------------------
	// select
	selectSingle = async <
		K extends keyof Select<HeadlessCollectionDocumentBricks>,
	>(props: {
		select: K[];
		where: QueryBuilderWhereT<"lucid_collection_document_bricks">;
	}) => {
		let query = this.db
			.selectFrom("lucid_collection_document_bricks")
			.select(props.select);

		query = selectQB(query, props.where);

		return query.executeTakeFirst() as Promise<
			Pick<Select<HeadlessCollectionDocumentBricks>, K> | undefined
		>;
	};
	selectMultipleByDocumentId = async (props: {
		documentId: number;
		languageId: number;
		config: Config;
	}) => {
		return this.db
			.selectFrom("lucid_collection_document_bricks")
			.select((eb) => [
				"lucid_collection_document_bricks.id",
				"lucid_collection_document_bricks.brick_type",
				"lucid_collection_document_bricks.brick_key",
				"lucid_collection_document_bricks.collection_document_id",
				"lucid_collection_document_bricks.brick_order",
				props.config.db
					.jsonArrayFrom(
						eb
							.selectFrom("lucid_collection_document_groups")
							.select([
								"lucid_collection_document_groups.group_id",
								"lucid_collection_document_groups.collection_document_id",
								"lucid_collection_document_groups.collection_brick_id",
								"lucid_collection_document_groups.parent_group_id",
								"lucid_collection_document_groups.repeater_key",
								"lucid_collection_document_groups.group_order",
								"lucid_collection_document_groups.ref",
							])
							.whereRef(
								"lucid_collection_document_groups.collection_brick_id",
								"=",
								"lucid_collection_document_bricks.id",
							),
					)
					.as("groups"),
				props.config.db
					.jsonArrayFrom(
						eb
							.selectFrom("lucid_collection_document_fields")
							.leftJoin("lucid_media", (join) =>
								join.onRef(
									"lucid_media.id",
									"=",
									"lucid_collection_document_fields.media_id",
								),
							)
							.leftJoin("lucid_users", (join) =>
								join.onRef(
									"lucid_users.id",
									"=",
									"lucid_collection_document_fields.user_id",
								),
							)
							.select((eb) => [
								"lucid_collection_document_fields.fields_id",
								"lucid_collection_document_fields.collection_brick_id",
								"lucid_collection_document_fields.group_id",
								"lucid_collection_document_fields.language_id",
								"lucid_collection_document_fields.key",
								"lucid_collection_document_fields.type",
								"lucid_collection_document_fields.text_value",
								"lucid_collection_document_fields.int_value",
								"lucid_collection_document_fields.bool_value",
								"lucid_collection_document_fields.json_value",
								"lucid_collection_document_fields.media_id",
								"lucid_collection_document_fields.collection_document_id",
								// User fields
								"lucid_users.id as user_id",
								"lucid_users.email as user_email",
								"lucid_users.first_name as user_first_name",
								"lucid_users.last_name as user_last_name",
								"lucid_users.email as user_email",
								"lucid_users.username as user_username",
								// Media fields
								"lucid_media.key as media_key",
								"lucid_media.mime_type as media_mime_type",
								"lucid_media.file_extension as media_file_extension",
								"lucid_media.file_size as media_file_size",
								"lucid_media.width as media_width",
								"lucid_media.height as media_height",
								"lucid_media.type as media_type",
								props.config.db
									.jsonArrayFrom(
										eb
											.selectFrom("lucid_translations")
											.select([
												"lucid_translations.value",
												"lucid_translations.language_id",
											])
											.where(
												"lucid_translations.value",
												"is not",
												null,
											)
											.whereRef(
												"lucid_translations.translation_key_id",
												"=",
												"lucid_media.title_translation_key_id",
											),
									)
									.as("media_title_translations"),
								props.config.db
									.jsonArrayFrom(
										eb
											.selectFrom("lucid_translations")
											.select([
												"lucid_translations.value",
												"lucid_translations.language_id",
											])
											.where(
												"lucid_translations.value",
												"is not",
												null,
											)
											.whereRef(
												"lucid_translations.translation_key_id",
												"=",
												"lucid_media.alt_translation_key_id",
											),
									)
									.as("media_alt_translations"),
							])
							.whereRef(
								"lucid_collection_document_fields.collection_brick_id",
								"=",
								"lucid_collection_document_bricks.id",
							)
							.where(
								"lucid_collection_document_fields.language_id",
								"=",
								props.languageId,
							),
					)
					.as("fields"),
			])
			.orderBy("lucid_collection_document_bricks.brick_order", "asc")
			.where(
				"lucid_collection_document_bricks.collection_document_id",
				"=",
				props.documentId,
			)
			.execute();
	};
	// ----------------------------------------
	// create
	createMultiple = async (props: {
		items: Array<{
			id?: number;
			brickType: BrickSchema["type"];
			brickKey?: string;
			brickOrder?: number;
			collectionDocumentId: number;
		}>;
	}) => {
		return this.db
			.insertInto("lucid_collection_document_bricks")
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
			.returning(["id", "brick_order", "brick_key", "brick_type"])
			.execute();
	};
	// ----------------------------------------
	// delete
	deleteMultiple = async (props: {
		where: QueryBuilderWhereT<"lucid_collection_document_bricks">;
	}) => {
		let query = this.db.deleteFrom("lucid_collection_document_bricks");

		query = deleteQB(query, props.where);

		return query.execute();
	};
}
