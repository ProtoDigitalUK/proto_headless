import type { HeadlessUserTokens, Select } from "../libs/db/types.js";
import {
	deleteQB,
	selectQB,
	type QueryBuilderWhereT,
} from "../libs/db/query-builder.js";

export default class UserTokens {
	constructor(private db: DB) {}

	getSingle = async <K extends keyof Select<HeadlessUserTokens>>(props: {
		select: K[];
		where: QueryBuilderWhereT<"headless_user_tokens">;
	}) => {
		let query = this.db
			.selectFrom("headless_user_tokens")
			.select<K>(props.select);

		query = selectQB(query, props.where);

		return query.executeTakeFirst() as Promise<
			Pick<Select<HeadlessUserTokens>, K> | undefined
		>;
	};
	delete = async (props: {
		where: QueryBuilderWhereT<"headless_user_tokens">;
	}) => {
		let query = this.db.deleteFrom("headless_user_tokens");

		query = deleteQB(query, props.where);

		return query.execute();
	};
	createSingle = async (props: {
		userId: number;
		tokenType: HeadlessUserTokens["token_type"];
		expiryDate: string;
		token: string;
	}) => {
		return this.db
			.insertInto("headless_user_tokens")
			.values({
				user_id: props.userId,
				token: props.token,
				token_type: props.tokenType,
				expiry_date: props.expiryDate,
			})
			.returning("token")
			.executeTakeFirst();
	};
}
