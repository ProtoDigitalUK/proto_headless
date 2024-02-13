import("dotenv/config.js");
import headless from "./headless.js";
import { headlessConfig } from "./services/config.js";
import BrickBuilder from "./builders/brick-builder/index.js";
import CollectionBuilder from "./builders/collection-builder/index.js";

export { headless, headlessConfig, BrickBuilder, CollectionBuilder };
export type { EmailStrategyT } from "./schemas/config.js";

export default headless;
