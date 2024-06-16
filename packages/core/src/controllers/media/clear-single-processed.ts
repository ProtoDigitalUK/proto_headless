import T from "../../translations/index.js";
import mediaSchema from "../../schemas/media.js";
import {
	swaggerResponse,
	swaggerHeaders,
} from "../../utils/swagger-helpers.js";
import LucidServices from "../../services/index.js";
import serviceWrapper from "../../libs/services/service-wrapper.js";
import { LucidAPIError } from "../../utils/error-handler.js";
import type { RouteController } from "../../types/types.js";

const clearSingleProcessedController: RouteController<
	typeof mediaSchema.clearSingleProcessed.params,
	typeof mediaSchema.clearSingleProcessed.body,
	typeof mediaSchema.clearSingleProcessed.query
> = async (request, reply) => {
	const clearProcessed = await serviceWrapper(
		LucidServices.processedImage.clearSingle,
		{
			transaction: true,
			defaultError: {
				type: "basic",
				name: T("method_error_name", {
					name: T("processed_images"),
					method: T("delete"),
				}),
				message: T("deletion_error_message", {
					name: T("processed_images").toLowerCase(),
				}),
				status: 500,
			},
		},
	)(
		{
			db: request.server.config.db.client,
			config: request.server.config,
		},
		{
			key: request.params.key,
		},
	);
	if (clearProcessed.error) throw new LucidAPIError(clearProcessed.error);

	reply.status(204).send();
};

export default {
	controller: clearSingleProcessedController,
	zodSchema: mediaSchema.clearSingleProcessed,
	swaggerSchema: {
		description:
			"Clear all processed images for a single media item based on the given key.",
		tags: ["media"],
		summary: "Clear all processed image for a single media item.",
		response: {
			204: swaggerResponse({
				type: 204,
				noPropertise: true,
			}),
		},
		headers: swaggerHeaders({
			csrf: true,
		}),
	},
};
