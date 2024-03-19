import z from "zod";

export default {
	getCSRF: {
		body: undefined,
		query: undefined,
		params: undefined,
	},
	login: {
		body: z.object({
			username_or_email: z.string(),
			password: z.string(),
		}),
		query: undefined,
		params: undefined,
	},
	token: {
		body: undefined,
		query: undefined,
		params: undefined,
	},
	logout: {
		body: undefined,
		query: undefined,
		params: undefined,
	},
};