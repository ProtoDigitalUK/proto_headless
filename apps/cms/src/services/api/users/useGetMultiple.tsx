import { createMemo, type Accessor } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
// Utils
import request from "@/utils/request";
import serviceHelpers from "@/utils/service-helpers";
// Types
import type { ResponseBody, UserResponse } from "@protoheadless/core/types";

interface QueryParams {
	queryString?: Accessor<string>;
	filters?: {
		firstName?: Accessor<string>;
		lastName?: Accessor<string>;
		email?: Accessor<string>;
		username?: Accessor<string>;
	};
}

const useGetMultiple = (params: QueryHook<QueryParams>) => {
	const queryParams = createMemo(() =>
		serviceHelpers.getQueryParams<QueryParams>(params?.queryParams || {}),
	);
	const queryKey = createMemo(() =>
		serviceHelpers.getQueryKey(queryParams()),
	);

	// -----------------------------
	// Query
	return createQuery(() => ({
		queryKey: ["users.getMultiple", queryKey(), params.key?.()],
		queryFn: () =>
			request<ResponseBody<UserResponse[]>>({
				url: "/api/v1/users",
				query: queryParams(),
				config: {
					method: "GET",
				},
			}),
		get enabled() {
			return params?.enabled ? params.enabled() : true;
		},
	}));
};

export default useGetMultiple;
