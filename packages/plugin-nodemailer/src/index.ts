import type { Config } from "@protodigital/headless";
import plugin from "./plugin.js";

const headlessNodemailerPlugin =
	(pluginOptions: PluginOptions) =>
	(config: Config): Config =>
		plugin(config, pluginOptions);

export default headlessNodemailerPlugin;
