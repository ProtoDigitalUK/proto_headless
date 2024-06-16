import T from "../../translations/index.js";
import argon2 from "argon2";
import Repository from "../../libs/repositories/index.js";
import type { ServiceFn } from "../../libs/services/types.js";

const login: ServiceFn<
	[
		{
			usernameOrEmail: string;
			password: string;
		},
	],
	{
		id: number;
	}
> = async (serviceConfig, data) => {
	const UsersRepo = Repository.get("users", serviceConfig.db);

	const user = await UsersRepo.selectSingleByEmailUsername({
		select: ["id", "password", "is_deleted"],
		data: {
			username: data.usernameOrEmail,
			email: data.usernameOrEmail,
		},
	});

	if (!user || !user.password) {
		return {
			error: {
				type: "authorisation",
				name: T("login_error_name"),
				message: T("login_error_message"),
				status: 401,
			},
			data: undefined,
		};
	}

	if (user !== undefined && user.is_deleted === 1) {
		return {
			error: {
				type: "authorisation",
				name: T("login_error_name"),
				message: T("login_suspended_error_message"),
				status: 401,
			},
			data: undefined,
		};
	}

	const valid = await argon2.verify(user.password, data.password);
	if (!valid)
		return {
			error: {
				type: "authorisation",
				name: T("login_error_name"),
				message: T("login_error_message"),
				status: 401,
			},
			data: undefined,
		};

	return {
		error: undefined,
		data: {
			id: user.id,
		},
	};
};

export default login;
