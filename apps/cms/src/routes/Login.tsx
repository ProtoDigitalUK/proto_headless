import T from "@/translations";
import { type Component } from "solid-js";
// Components
import LoginForm from "@/components/Forms/Auth/LoginForm";

const LoginRoute: Component = () => {
  // ----------------------------------------
  // Render
  return (
    <>
      <h1 class="mb-2 text-center 3xl:text-left">{T("login_route_title")}</h1>
      <p class="mb-10 text-center 3xl:text-left">
        {T("login_route_description")}
      </p>
      <div class="mb-10">
        <LoginForm showForgotPassword={true} />
      </div>
    </>
  );
};

export default LoginRoute;
