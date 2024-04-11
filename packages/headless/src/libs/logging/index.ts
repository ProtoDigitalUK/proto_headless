import logger from "./logger.js";

export type LogLevel = "error" | "warn" | "info" | "debug";

const headlessLogger = (
	level: LogLevel,
	data: {
		message: string;
		scope?: string;
		data?: Record<string, unknown>;
	},
) => {
	let logLevelFn = logger.error;

	switch (level) {
		case "error":
			logLevelFn = logger.error;
			break;
		case "warn":
			logLevelFn = logger.warn;
			break;
		case "info":
			logLevelFn = logger.info;
			break;
		case "debug":
			logLevelFn = logger.debug;
			break;
		default:
			logLevelFn = logger.error;
			break;
	}

	if (data.scope) {
		logLevelFn(`[${data.scope}]: ${data.message}`, data.data);
	} else {
		logLevelFn(data.message, data.data);
	}
};

export default headlessLogger;
