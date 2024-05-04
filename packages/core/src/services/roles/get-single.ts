import T from "../../translations/index.js";
import { LucidAPIError } from "../../utils/error-handler.js";
import Repository from "../../libs/repositories/index.js";
import Formatter from "../../libs/formatters/index.js";
import type { ServiceConfig } from "../../utils/service-wrapper.js";

export interface ServiceData {
	id: number;
}

const getSingle = async (serviceConfig: ServiceConfig, data: ServiceData) => {
	const RolesRepo = Repository.get("roles", serviceConfig.db);
	const RolesFormatter = Formatter.get("roles");

	const role = await RolesRepo.selectSingleById({
		id: data.id,
		config: serviceConfig.config,
	});

	if (role === undefined) {
		throw new LucidAPIError({
			type: "basic",
			name: T("error_not_found_name", {
				name: T("role"),
			}),
			message: T("error_not_found_message", {
				name: T("role"),
			}),
			status: 404,
		});
	}

	return RolesFormatter.formatSingle({
		role: role,
	});
};

export default getSingle;
