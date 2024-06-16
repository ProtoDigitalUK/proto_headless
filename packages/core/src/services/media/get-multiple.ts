import type z from "zod";
import Repository from "../../libs/repositories/index.js";
import Formatter from "../../libs/formatters/index.js";
import type mediaSchema from "../../schemas/media.js";
import type { ServiceFn } from "../../libs/services/types.js";
import type { MediaResponse } from "../../types/response.js";

const getMultiple: ServiceFn<
	[
		{
			query: z.infer<typeof mediaSchema.getMultiple.query>;
			localeCode: string;
		},
	],
	{
		data: MediaResponse[];
		count: number;
	}
> = async (service, data) => {
	const MediaRepo = Repository.get("media", service.db);
	const MediaFormatter = Formatter.get("media");

	const [medias, mediasCount] = await MediaRepo.selectMultipleFiltered({
		localeCode: data.localeCode,
		query: data.query,
		config: service.config,
	});

	return {
		error: undefined,
		data: {
			data: MediaFormatter.formatMultiple({
				media: medias,
				host: service.config.host,
			}),
			count: Formatter.parseCount(mediasCount?.count),
		},
	};
};

export default getMultiple;
