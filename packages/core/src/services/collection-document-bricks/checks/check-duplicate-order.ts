import T from "../../../translations/index.js";
import type { BrickInsertItem } from "../helpers/format-insert-bricks.js";
import type { ServiceResponse } from "../../../libs/services/types.js";

const checkDuplicateOrder = (
	bricks: Array<BrickInsertItem>,
): Awaited<ServiceResponse<undefined>> => {
	const builderOrders = bricks
		.filter((brick) => brick.type === "builder")
		.map((brick) => brick.order);

	const builderOrderDuplicates = builderOrders.filter(
		(order, index) => builderOrders.indexOf(order) !== index,
	);

	if (builderOrderDuplicates.length > 0) {
		return {
			error: {
				type: "basic",
				name: T("error_saving_bricks"),
				message: T("error_saving_page_duplicate_order", {
					order: builderOrderDuplicates.join(", "),
				}),
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

export default checkDuplicateOrder;
