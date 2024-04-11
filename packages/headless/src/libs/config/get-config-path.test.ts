import { expect, test } from "vitest";
import path from "node:path";
import getConfigPath from "./get-config-path.js";

test("finds headless.config.ts file", async () => {
	const configPath = getConfigPath(path.resolve(__dirname, "./mock-config"));
	expect(configPath).toContain("headless.config.ts");
});

test("throws on missing file", async () => {
	expect(() => getConfigPath(process.cwd(), "test.cfdonfig")).toThrowError(
		/^Cannot find the headless.config.ts or headless.config.js file at the root of your project.$/,
	);
});
