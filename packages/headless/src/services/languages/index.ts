import checks from "./checks/index.js";

import createSingle from "./create-single.js";
import getSingle from "./get-single.js";
import getMultiple from "./get-multiple.js";
import deleteSingle from "./delete-single.js";
import updateSingle from "./update-single.js";
import getSingleFallback from "./get-single-fallback.js";

export default {
	checks,

	createSingle,
	getSingle,
	getMultiple,
	deleteSingle,
	updateSingle,
	getSingleFallback,
};