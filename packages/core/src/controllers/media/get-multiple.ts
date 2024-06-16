import T from "../../translations/index.js";
import mediaSchema from "../../schemas/media.js";
import {
	swaggerResponse,
	swaggerHeaders,
	swaggerQueryString,
} from "../../utils/swagger-helpers.js";
import mediaServices from "../../services/media/index.js";
import buildResponse from "../../utils/build-response.js";
import MediaFormatter from "../../libs/formatters/media.js";
import serviceWrapper from "../../libs/services/service-wrapper.js";
import { LucidAPIError } from "../../utils/error-handler.js";
import type { RouteController } from "../../types/types.js";

const getMultipleController: RouteController<
	typeof mediaSchema.getMultiple.params,
	typeof mediaSchema.getMultiple.body,
	typeof mediaSchema.getMultiple.query
> = async (request, reply) => {
	const media = await serviceWrapper(mediaServices.getMultiple, {
		transaction: false,
		defaultError: {
			type: "basic",
			name: T("method_error_name", {
				name: T("media"),
				method: T("fetch"),
			}),
			message: T("default_error_message"),
			status: 500,
		},
	})(
		{
			db: request.server.config.db.client,
			config: request.server.config,
		},
		{
			query: request.query,
			localeCode: request.locale.code,
		},
	);
	if (media.error) throw new LucidAPIError(media.error);

	reply.status(200).send(
		await buildResponse(request, {
			data: media.data.data,
			pagination: {
				count: media.data.count,
				page: request.query.page,
				perPage: request.query.perPage,
			},
		}),
	);
};

export default {
	controller: getMultipleController,
	zodSchema: mediaSchema.getMultiple,
	swaggerSchema: {
		description: "Get a multiple media items.",
		tags: ["media"],
		summary: "Get a multiple media items.",
		response: {
			200: swaggerResponse({
				type: 200,
				data: {
					type: "array",
					items: MediaFormatter.swagger,
				},
				paginated: true,
			}),
		},
		headers: swaggerHeaders({
			contentLocale: true,
		}),
		querystring: swaggerQueryString({
			filters: [
				{
					key: "key",
				},
				{
					key: "mimeType",
				},
				{
					key: "fileExtension",
				},
				{
					key: "type",
				},
				{
					key: "title",
				},
			],
			sorts: [
				"createdAt",
				"updatedAt",
				"title",
				"fileSize",
				"width",
				"height",
				"mimeType",
				"fileExtension",
			],
			page: true,
			perPage: true,
		}),
	},
};
