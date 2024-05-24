import lucid, { SQLiteAdapter } from "../../../index.js";
import Database from "better-sqlite3";

export default lucid.config({
	mode: "development",
	host: "http://localhost:8393",
	db: new SQLiteAdapter({
		database: async () => new Database("db.sqlite"),
	}),
	keys: {
		cookieSecret: "cookieSecret",
		refreshTokenSecret: "refreshTokenSecret",
		accessTokenSecret: "accessTokenSecret",
	},
	collections: [],
	plugins: [],
});
