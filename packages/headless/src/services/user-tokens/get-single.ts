import T from "../../translations/index.js";
import { HeadlessAPIError } from "../../utils/error-handler.js";
import Repository from "../../libs/repositories/index.js";
import type { ServiceConfig } from "../../utils/service-wrapper.js";

export interface ServiceData {
	tokenType: "password_reset";
	token: string;
}

const getSingle = async (serviceConfig: ServiceConfig, data: ServiceData) => {
	const UserTokensRepo = Repository.get("user-tokens", serviceConfig.db);

	const userToken = await UserTokensRepo.selectSingle({
		select: ["id", "user_id"],
		where: [
			{
				key: "token",
				operator: "=",
				value: data.token,
			},
			{
				key: "token_type",
				operator: "=",
				value: data.tokenType,
			},
			{
				key: "expiry_date",
				operator: ">",
				value: new Date().toISOString(),
			},
		],
	});

	if (userToken === undefined) {
		throw new HeadlessAPIError({
			type: "basic",
			name: T("error_not_found_name", {
				name: T("token"),
			}),
			message: T("error_not_found_message", {
				name: T("token"),
			}),
			status: 404,
		});
	}

	return userToken;
};

export default getSingle;
