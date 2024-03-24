import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type z from "zod";
import type { PermissionT } from "@headless/types/src/permissions.js";
import validateBody from "../middleware/validate-body.js";
import validateParams from "../middleware/validate-params.js";
import validateQuery from "../middleware/validate-query.js";
import authenticate from "../middleware/authenticate.js";
import validateCSRF from "../middleware/validate-csrf.js";
import permissions from "../middleware/permissions.js";
import contentLanguage from "../middleware/content-language.js";

type RouteT = <
	ParamsT extends z.ZodTypeAny | undefined,
	BodyT extends z.ZodTypeAny | undefined,
	QueryT extends z.ZodTypeAny | undefined,
>(
	fastify: FastifyInstance,
	opts: {
		method: "get" | "post" | "put" | "delete" | "patch";
		url: string;
		permissions?: PermissionT[];
		middleware?: {
			authenticate?: boolean;
			validateCSRF?: boolean;
			contentLanguage?: boolean;
		};
		isMultipart?: boolean;
		zodSchema?: {
			params?: ParamsT;
			body?: BodyT;
			query?: QueryT;
		};
		swaggerSchema?: {
			description?: string;
			tags?: string[];
			summary?: string;
			response?: Record<
				string | number,
				{
					description?: string;
					type?: string;
					properties?: unknown;
				}
			>;
			body?: {
				type?: string;
				properties?: unknown;
				required?: string[];
			};
			headers?: {
				type: string;
				properties: unknown;
				required: string[];
			};
		};
		controller: ControllerT<ParamsT, BodyT, QueryT>;
	},
) => void;

type PreHookT = Array<
	(request: FastifyRequest, reply: FastifyReply) => Promise<void>
>;

const route: RouteT = (fastify, opts) => {
	const { method, url, controller, swaggerSchema, zodSchema, middleware } =
		opts;

	const preValidation: PreHookT = [];
	const preHandler: PreHookT = [];

	if (middleware?.authenticate) preHandler.push(authenticate);
	if (middleware?.validateCSRF) preHandler.push(validateCSRF);
	if (middleware?.contentLanguage) preHandler.push(contentLanguage);

	if (zodSchema?.body !== undefined)
		preValidation.push(validateBody(zodSchema.body, opts.isMultipart));
	if (zodSchema?.params !== undefined)
		preValidation.push(validateParams(zodSchema.params));
	if (zodSchema?.query !== undefined)
		preValidation.push(validateQuery(zodSchema.query));
	if (opts.permissions) preHandler.push(permissions(opts.permissions));

	fastify.route({
		method: method,
		url: url,
		handler: controller,
		preValidation: preValidation,
		preHandler: preHandler,
		schema: swaggerSchema,
	});
};

export default route;