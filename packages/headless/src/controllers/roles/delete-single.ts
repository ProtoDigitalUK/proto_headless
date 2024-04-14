import T from "../../translations/index.js";
import rolesSchema from "../../schemas/roles.js";
import {
	swaggerResponse,
	swaggerHeaders,
} from "../../utils/swagger-helpers.js";
import rolesServices from "../../services/roles/index.js";
import serviceWrapper from "../../utils/service-wrapper.js";
import { ensureThrowAPIError } from "../../utils/error-helpers.js";

const deleteSingleController: ControllerT<
	typeof rolesSchema.deleteSingle.params,
	typeof rolesSchema.deleteSingle.body,
	typeof rolesSchema.deleteSingle.query
> = async (request, reply) => {
	try {
		await serviceWrapper(rolesServices.deleteSingle, true)(
			{
				db: request.server.config.db.client,
				config: request.server.config,
			},
			{
				id: Number.parseInt(request.params.id),
			},
		);

		reply.status(204).send();
	} catch (error) {
		ensureThrowAPIError(error, {
			type: "basic",
			name: T("method_error_name", {
				name: T("role"),
				method: T("delete"),
			}),
			message: T("deletion_error_message", {
				name: T("role").toLowerCase(),
			}),
			status: 500,
		});
	}
};

export default {
	controller: deleteSingleController,
	zodSchema: rolesSchema.deleteSingle,
	swaggerSchema: {
		description: "Delete a single role based on the given role id.",
		tags: ["roles"],
		summary: "Delete a single role",
		response: {
			204: swaggerResponse({
				type: 204,
				noPropertise: true,
			}),
		},
		headers: swaggerHeaders({
			csrf: true,
		}),
	},
};
