import T from "@/translations";
import { useNavigate } from "@solidjs/router";
import userStore from "@/store/userStore";
import { clearCookie } from "@/utils/cookie";
import request from "@/utils/request";
import serviceHelpers from "@/utils/service-helpers";
import type { ResponseBody } from "@lucidcms/core/types";

export const logoutReq = () => {
	return request<
		ResponseBody<{
			message: string;
		}>
	>({
		url: "/api/v1/auth/logout",
		csrf: true,
		config: {
			method: "POST",
		},
	});
};

interface UseLogoutProps {
	onSuccess?: () => void;
	onError?: () => void;
}

const useLogout = (props?: UseLogoutProps) => {
	const navigate = useNavigate();

	// -----------------------------
	// Mutation
	return serviceHelpers.useMutationWrapper<
		unknown,
		ResponseBody<{
			message: string;
		}>
	>({
		mutationFn: logoutReq,
		successToast: {
			title: T()("logout_success_toast_title"),
			message: T()("logout_success_toast_message"),
		},
		invalidates: ["roles.getMultiple", "roles.getSingle"],
		onSuccess: () => {
			userStore.get.reset();
			navigate("/login");
			sessionStorage.removeItem("_csrf");
			props?.onSuccess?.();
		},
		onError: () => {
			clearCookie("auth");
			navigate("/login");
			props?.onError?.();
		},
	});
};

export default useLogout;
