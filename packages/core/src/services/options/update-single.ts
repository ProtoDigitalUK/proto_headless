import Repository from "../../libs/repositories/index.js";
import type { ServiceFn } from "../../libs/services/types.js";
import type { OptionName } from "../../types/response.js";
import type { BooleanInt } from "../../libs/db/types.js";

const updateSingle: ServiceFn<
	[
		{
			name: OptionName;
			valueText?: string;
			valueInt?: number;
			valueBool?: BooleanInt;
		},
	],
	undefined
> = async (serviceConfig, data) => {
	const OptionsRepo = Repository.get("options", serviceConfig.db);

	const updateOption = await OptionsRepo.updateSingle({
		where: [
			{
				key: "name",
				operator: "=",
				value: data.name,
			},
		],
		data: {
			valueBool: data.valueBool,
			valueInt: data.valueInt,
			valueText: data.valueText,
		},
	});

	if (updateOption === undefined) {
		return {
			error: {
				type: "basic",
				status: 400,
			},
			data: undefined,
		};
	}

	return {
		error: undefined,
		data: undefined,
	};
};

export default updateSingle;
