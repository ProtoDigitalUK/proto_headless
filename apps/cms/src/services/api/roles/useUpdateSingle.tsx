import T from "@/translations";
// Utils
import spawnToast from "@/utils/spawn-toast";
import request from "@/utils/request";
import serviceHelpers from "@/utils/service-helpers";
// Types
import { APIResponse } from "@/types/api";
import { RoleResT } from "@lucid/types/src/roles";

interface Params {
  id: number;
  body: {
    name?: string;
    permission_groups?: Array<{
      environment_key?: string;
      permissions: string[];
    }>;
  };
}

export const updateSingleReq = (params: Params) => {
  return request<APIResponse<RoleResT>>({
    url: `/api/v1/roles/${params.id}`,
    csrf: true,
    config: {
      method: "PATCH",
      body: params.body,
    },
  });
};

interface UseUpdateSingleProps {
  onSuccess?: () => void;
  onError?: () => void;
}

const useUpdateSingle = (props?: UseUpdateSingleProps) => {
  // -----------------------------
  // Mutation
  return serviceHelpers.useMutationWrapper<Params, APIResponse<RoleResT>>({
    mutationFn: updateSingleReq,
    invalidates: ["roles.getMultiple", "roles.getSingle", "users.getSingle"],
    onSuccess: (data) => {
      spawnToast({
        title: T("role_update_toast_title"),
        message: T("role_update_toast_message", {
          name: data.data.name,
        }),
        status: "success",
      });
      props?.onSuccess && props.onSuccess();
    },
    onError: props?.onError,
  });
};

export default useUpdateSingle;
