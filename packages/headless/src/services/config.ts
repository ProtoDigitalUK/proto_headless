import path from "path";
import { pathToFileURL } from "url";
import fs from "fs-extra";
import merge from "lodash.merge";
import {
	type HeadlessConfigT,
	headlessConfigSchema,
} from "../schemas/config.js";
import constants from "../constants.js";

let config: HeadlessConfigT | undefined = undefined;

const findConfigPath = (cwd: string): string => {
	let configPath: string | undefined = undefined;
	const root = path.parse(cwd).root;
	const configFileName = "headless.config";
	const configExtensions = [".ts", ".js"];

	const search = (cwd: string): void => {
		const files = fs.readdirSync(cwd);
		const configFiles = files.filter((file) => {
			const { name, ext } = path.parse(file);
			return name === configFileName && configExtensions.includes(ext);
		});

		if (configFiles.length > 0) {
			configPath = path.resolve(cwd, configFiles[0]);
			return;
		}

		const parent = path.resolve(cwd, "..");
		if (parent === cwd || parent === root) {
			return;
		}

		search(parent);
	};
	search(cwd);

	if (!configPath) {
		throw new Error(
			"Cannot find the headless.config.ts or headless.config.js file at the root of your project.",
		);
	}

	return configPath;
};

export const headlessConfig = (config: HeadlessConfigT) => {
	try {
		// TODO: Improve validation and error handling

		headlessConfigSchema.parse(config);
		return merge(
			{
				media: {
					storageLimit: constants.media.storageLimit,
					maxFileSize: constants.media.maxFileSize,
					processedImages: {
						store: constants.media.processedImages.store,
						limit: constants.media.processedImages.limit,
					},
				},
			},
			config,
		);
	} catch (error) {
		console.error(error);
	}
};

export const getConfig = async () => {
	if (config) {
		return config;
	}

	const configPath = findConfigPath(process.cwd());
	const configUrl = pathToFileURL(configPath).href;
	const configModule = await import(configUrl);

	config = configModule.default as HeadlessConfigT;

	// TODO: Merge config object with default config values

	return config;
};

export default getConfig;