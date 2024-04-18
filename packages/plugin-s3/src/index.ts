import type { Config } from "@protoheadless/core/types";
import type { PluginOptions } from "./types/types.js";
import plugin from "./plugin.js";

const headlessS3Plugin = (pluginOptions: PluginOptions) => (config: Config) =>
	plugin(config, pluginOptions);

export default headlessS3Plugin;
