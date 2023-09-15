import { createMemo, Accessor } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
// Utils
import request from "@/utils/request";
import serviceHelpers from "@/utils/service-helpers";
// Types
import { FormResT } from "@lucid/types/src/forms";
import { APIResponse } from "@/types/api";

interface QueryParams {
  include: Record<"fields", boolean>;
  filters?: {
    environment_key?: Accessor<string | undefined>;
  };
}

const useGetAll = (params: QueryHook<QueryParams>) => {
  const queryParams = createMemo(() =>
    serviceHelpers.getQueryParams<QueryParams>(params.queryParams)
  );
  const queryKey = createMemo(() => serviceHelpers.getQueryKey(queryParams()));

  // -----------------------------
  // Query
  return createQuery(
    () => ["environment.forms.getAll", queryKey(), params.key?.()],
    {
      queryFn: () =>
        request<APIResponse<FormResT[]>>({
          url: `/api/v1/forms`,
          query: queryParams(),
          config: {
            method: "GET",
          },
        }),
      get enabled() {
        return params.enabled ? params.enabled() : true;
      },
    }
  );
};

export default useGetAll;
