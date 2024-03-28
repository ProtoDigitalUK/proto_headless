import T from "../../translations/index.js";
import {
	type Dialect,
	Migration,
	Kysely,
	Migrator,
	KyselyPlugin,
} from "kysely";
import { InternalError } from "../../utils/error-handler.js";
import type { DB as DBSchema } from "kysely-codegen";
import { AdapterType } from "./types.js";
import serviceWrapper from "../../utils/service-wrapper.js";
// Seeds
import seedDefaultUser from "./seed/seed-default-user.js";
import seedDefaultLanguages from "./seed/seed-default-language.js";
import seedDefaultRoles from "./seed/seed-default-roles.js";
// Migrations
import Migration00000001 from "./migrations/00000001-languages.js";
import Migration00000002 from "./migrations/00000002-translations.js";
import Migration00000003 from "./migrations/00000003-options.js";
import Migration00000004 from "./migrations/00000004-users-and-permissions.js";
import Migration00000005 from "./migrations/00000005-emails.js";
import Migration00000006 from "./migrations/00000006-media.js";
import Migration00000007 from "./migrations/00000007-collections.js";

export default class DatabaseAdapter {
	db: Kysely<DBSchema> | undefined;
	adapter: AdapterType;
	constructor(config: {
		adapter: AdapterType;
		dialect: Dialect;
		plugins?: Array<KyselyPlugin>;
	}) {
		this.adapter = config.adapter;
		this.db = new Kysely<DBSchema>({
			dialect: config.dialect,
			plugins: config.plugins,
		});
	}
	// Public methods
	async migrateToLatest() {
		const migrator = this.migrator;

		const { error, results } = await migrator.migrateToLatest();

		if (results) {
			for (const it of results) {
				if (it.status === "Success") {
					console.log(
						`migration "${it.migrationName}" was executed successfully`,
					);
				} else if (it.status === "Error") {
					console.error(
						`failed to execute migration "${it.migrationName}"`,
					);
				}
			}
		}

		if (error) {
			console.error("failed to migrate");
			console.error(error);
			process.exit(1);
		}
	}
	async seed() {
		const seedData = async (serviceConfig: ServiceConfigT) => {
			await Promise.allSettled([
				seedDefaultUser(serviceConfig),
				seedDefaultLanguages(serviceConfig),
				seedDefaultRoles(serviceConfig),
			]);
		};

		await serviceWrapper(
			seedData,
			true,
		)({
			db: this.database,
		});
	}
	// getters
	get database() {
		if (!this.db) {
			throw new InternalError(T("db_connection_error"));
		}
		return this.db;
	}
	private get migrations(): Record<string, Migration> {
		return {
			"00000001-languages": Migration00000001(this.adapter),
			"00000002-translations": Migration00000002(this.adapter),
			"00000003-options": Migration00000003(this.adapter),
			"00000004-users-and-permissions": Migration00000004(this.adapter),
			"00000005-emails": Migration00000005(this.adapter),
			"00000006-media": Migration00000006(this.adapter),
			"00000007-collections": Migration00000007(this.adapter),
		};
	}
	private get migrator() {
		const m = this.migrations;
		return new Migrator({
			db: this.database,
			provider: {
				async getMigrations() {
					return m;
				},
			},
		});
	}
}

export type DatabaseAdapterT = InstanceType<typeof DatabaseAdapter>;
