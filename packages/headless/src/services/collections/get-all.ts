import formatCollection from "../../format/format-collection.js";
import getConfig from "../../libs/config/get-config.js";

const getAll = async () => {
	const config = await getConfig();

	return (
		config.collections?.map((collection) =>
			formatCollection(collection, false),
		) ?? []
	);
};

export default getAll;
