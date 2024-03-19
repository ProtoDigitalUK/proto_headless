import usersServices from "./index.js";
import serviceWrapper from "../../utils/app/service-wrapper.js";

export interface ServiceData {
	user_id: number;
	role_ids?: number[];
}

const updateMultipleRoles = async (
	serviceConfig: ServiceConfigT,
	data: ServiceData,
) => {
	if (data.role_ids === undefined) return;

	await Promise.all([
		serviceWrapper(usersServices.checks.checkRolesExist, false)(
			{
				db: serviceConfig.db,
			},
			{
				role_ids: data.role_ids || [],
				is_create: true,
			},
		),
		serviceConfig.db
			.deleteFrom("headless_user_roles")
			.where("user_id", "=", data.user_id)
			.execute(),
	]);

	if (data.role_ids.length === 0) return;

	await serviceConfig.db
		.insertInto("headless_user_roles")
		.values(
			data.role_ids.map((roleId) => ({
				user_id: data.user_id,
				role_id: roleId,
			})),
		)
		.execute();
};

export default updateMultipleRoles;