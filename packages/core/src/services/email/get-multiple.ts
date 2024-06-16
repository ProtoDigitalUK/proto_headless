import type z from "zod";
import type emailSchema from "../../schemas/email.js";
import Repository from "../../libs/repositories/index.js";
import Formatter from "../../libs/formatters/index.js";
import type { ServiceFn } from "../../libs/services/types.js";
import type { EmailResponse } from "../../types/response.js";

const getMultiple: ServiceFn<
	[
		{
			query: z.infer<typeof emailSchema.getMultiple.query>;
		},
	],
	{
		data: EmailResponse[];
		count: number;
	}
> = async (service, data) => {
	const EmailsRepo = Repository.get("emails", service.db);
	const EmailsFormatter = Formatter.get("emails");

	const [emails, emailsCount] = await EmailsRepo.selectMultipleFiltered({
		query: data.query,
		config: service.config,
	});

	return {
		error: undefined,
		data: {
			data: EmailsFormatter.formatMultiple({
				emails: emails,
			}),
			count: Formatter.parseCount(emailsCount?.count),
		},
	};
};

export default getMultiple;
