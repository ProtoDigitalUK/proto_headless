import("dotenv/config.js");
import packageJson from "../package.json" assert { type: "json" };
import path from "node:path";
import T from "./translations/index.js";
import constants from "./constants/constants.js";
import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fs from "fs-extra";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import getConfig from "./libs/config/get-config.js";
import routes from "./routes/index.js";
import { getDirName } from "./utils/helpers/index.js";
import { decodeError } from "./utils/errors/index.js";
import logger from "./utils/logging/index.js";
import lucidServices from "./services/index.js";
import executeStartTasks from "./actions/execute-start-tasks.js";
import { LucidError } from "./utils/errors/index.js";
import type { FastifyInstance } from "fastify";

const currentDir = getDirName(import.meta.url);

const lucidPlugin = async (fastify: FastifyInstance) => {
	try {
		const [config, cmsEntryFile, landingPageFile] = await Promise.all([
			getConfig(),
			fs.readFile(path.resolve(currentDir, "../cms/index.html")),
			fs.readFile(path.resolve(currentDir, "../assets/landing.html")),
		]);
		await executeStartTasks({
			db: config.db.client,
			config: config,
			services: lucidServices,
		});

		fastify.decorate("config", config);
		fastify.decorate("logger", logger);
		fastify.decorate("services", lucidServices);

		// ------------------------------------
		// Swagger
		fastify.register(fastifySwagger, {
			swagger: {
				info: {
					title: "Lucid CMS",
					description: "Lucid CMS",
					version: packageJson.version,
				},
				host: config.host
					.replace("http://", "")
					.replace("https://", ""),
				schemes: ["http"],
				consumes: ["application/json", "multipart/form-data"],
				produces: ["application/json"],
			},
		});
		if (config.disableSwagger === false) {
			fastify.register(fastifySwaggerUi, {
				routePrefix: "/documentation",
			});
		}
		fastify.setValidatorCompiler(() => {
			return () => ({ value: false });
		});

		// ------------------------------------
		// Server wide middleware
		fastify.register(cors, {
			origin: [config.host, "http://localhost:3000"],
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
			allowedHeaders: [
				"Content-Type",
				"Authorization",
				"Content-Length",
				...Object.values(constants.headers),
			],
			credentials: true,
		});
		fastify.register(fastifyCookie, {
			secret: config.keys.cookieSecret,
		});
		fastify.register(fastifyMultipart, {
			limits: {
				fileSize: config.media.maxSize,
			},
		});

		// ------------------------------------
		// Routes
		fastify.register(routes);

		fastify.register(fastifyStatic, {
			root: path.resolve("public"),
			wildcard: false,
		});

		// Serve CMS
		fastify.register(fastifyStatic, {
			root: path.join(currentDir, "../cms"),
			prefix: "/admin",
			wildcard: false,
			decorateReply: false,
		});
		fastify.get("/admin", async (_, reply) => {
			reply.type("text/html").send(cmsEntryFile);
		});
		fastify.get("/admin/*", async (_, reply) => {
			reply.type("text/html").send(cmsEntryFile);
		});

		// Serve landing page
		fastify.get("/", async (_, reply) => {
			reply.type("text/html").send(landingPageFile);
		});

		//
		fastify.setNotFoundHandler((request, reply) => {
			if (request.url.startsWith("/api")) {
				reply.code(404).send("API route not found");
			} else {
				reply.code(404).send("Page not found");
			}
		});

		// ------------------------------------
		// Error handling
		fastify.setErrorHandler((error, request, reply) => {
			const { name, message, status, errorResponse, code } =
				decodeError(error);

			logger("error", {
				message: message,
				scope: status?.toString() ?? "500",
			});

			if (reply.sent) {
				logger("error", {
					message: T("headers_already_sent"),
				});
				return;
			}

			const response = Object.fromEntries(
				Object.entries({
					status,
					code,
					name,
					message,
					errors: errorResponse,
				}).filter(([_, value]) => value !== null),
			);

			reply.status(status ?? 500).send(response);
		});
	} catch (error) {
		throw new LucidError({
			scope: "lucid",
			message:
				// @ts-expect-error
				error?.message || T("lucid_server_unknow_error"),
			kill: true,
		});
	}
};

export default fp(lucidPlugin, {
	name: "lucid",
	fastify: "4.x",
});
