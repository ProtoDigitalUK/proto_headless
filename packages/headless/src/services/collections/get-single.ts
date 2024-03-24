import T from "../../translations/index.js";
import { APIError } from "../../utils/error-handler.js";
import formatCollection from "../../format/format-collection.js";
import getConfig from "../../libs/config/get-config.js";

export interface ServiceData {
	key: string;
	include?: {
		bricks?: boolean;
		fields?: boolean;
		document_id?: boolean;
	};
}

const getSingle = async (serviceConfig: ServiceConfigT, data: ServiceData) => {
	const config = await getConfig();

	const collection = config.collections?.find((c) => c.key === data.key);

	if (collection === undefined) {
		throw new APIError({
			type: "basic",
			name: T("error_not_found_name", {
				name: T("collection"),
			}),
			message: T("collection_not_found_message", {
				collectionKey: data.key,
			}),
			status: 404,
		});
	}

	if (
		data.include?.document_id === true &&
		collection.data.mode === "single"
	) {
		const document = await serviceConfig.db
			.selectFrom("headless_collection_documents")
			.select("id")
			.where("collection_key", "=", collection.key)
			.where("is_deleted", "=", false)
			.limit(1)
			.executeTakeFirst();

		return formatCollection(collection, data.include, [
			{
				id: document?.id,
				collection_key: collection.key,
			},
		]);
	}

	return formatCollection(collection, data.include);
};

export default getSingle;
