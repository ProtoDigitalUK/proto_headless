import projectPackage from "../../../package.json";

const bgYellow = "\x1b[43m";
const textYellow = "\x1b[33m";
const textGreen = "\x1b[32m";
const textBlue = "\x1b[34m";
const reset = "\x1b[0m";

const serverStartLog = (address: string, start: [number, number]) => {
	const loadTime = Math.round(process.hrtime(start)[1] / 1000000);

	console.log("");
	console.log(
		`${bgYellow} PROTO HEADLESS ${reset} ${textYellow}v${projectPackage.version}${reset} ready in ${textGreen}${loadTime} ms\n${reset}`,
	);

	console.log(`┃ API ${textBlue}${address}${reset}`);

	console.log("");
};

export default serverStartLog;