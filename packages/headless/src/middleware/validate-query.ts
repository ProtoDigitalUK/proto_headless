import T from "../translations/index.js";
import type { FastifyRequest } from "fastify";
import z, { type ZodTypeAny } from "zod";
import constants from "../constants.js";
import { HeadlessAPIError } from "../utils/error-handler.js";

export interface RequestQueryParsed {
	filter: Record<string, string | Array<string>> | undefined;
	sort:
		| Array<{
				key: string;
				value: "asc" | "desc";
		  }>
		| undefined;
	include: Array<string> | undefined;
	exclude: Array<string> | undefined;
	page: number;
	perPage: number;
}

const buildSort = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const sort = queryObject.sort;
	if (!sort) return undefined;

	return sort.split(",").map((sort) => {
		if (sort.startsWith("-")) {
			return {
				key: sort.slice(1),
				value: "desc",
			};
		}

		return {
			key: sort,
			value: "asc",
		};
	});
};

const buildFilter = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const result: RequestQueryParsed["filter"] = {};

	for (const [key, value] of Object.entries(queryObject)) {
		if (key.includes("filter[")) {
			const splitBracket = key.split("[")[1];
			if (splitBracket === undefined) continue;

			const name = splitBracket.split("]")[0];
			if (name === undefined) continue;

			if (value.includes(",")) {
				result[name] = value.split(",");
			} else if (value !== "") {
				result[name] = value;
			}
		}
	}

	return Object.keys(result).length === 0 ? undefined : result;
};

const buildPage = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const page = queryObject.page;
	if (!page) return constants.query.page;

	return Number.parseInt(page);
};

const buildPerPage = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const perPage = queryObject.per_page;
	if (!perPage) return constants.query.perPage;

	return Number.parseInt(perPage);
};

const buildInclude = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const include = queryObject.include;
	if (!include) return undefined;

	return include.split(",");
};

const buildExclude = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const exclude = queryObject.exclude;
	if (!exclude) return undefined;

	return exclude.split(",");
};
const addRemainingQuery = (query: unknown) => {
	const queryObject = query as Record<string, string>;
	const remainingQuery = Object.fromEntries(
		Object.entries(queryObject).filter(
			([key]) =>
				![
					"include",
					"exclude",
					"filter",
					"sort",
					"page",
					"perPage",
				].includes(key),
		),
	);
	return remainingQuery;
};

const validateQuery =
	(schema: ZodTypeAny) => async (request: FastifyRequest) => {
		const querySchema = z.object({
			query: schema ?? z.object({}),
		});

		const validateResult = await querySchema.safeParseAsync({
			query: {
				sort: buildSort(request.query),
				filter: buildFilter(request.query),
				include: buildInclude(request.query),
				exclude: buildExclude(request.query),
				page: buildPage(request.query),
				perPage: buildPerPage(request.query),
				...addRemainingQuery(request.query),
			},
		});

		if (!validateResult.success) {
			throw new HeadlessAPIError({
				type: "validation",
				message: T("validation_query_error_message"),
				zod: validateResult.error,
			});
		}

		request.query = validateResult.data.query;
	};

export default validateQuery;
