import { type Component } from "solid-js";
import { Outlet } from "@solidjs/router";

const AuthRoutes: Component = () => {
  // ----------------------------------
  // Render
  return (
    <div class="fixed top-0 left-0 bottom-0 right-0 flex ">
      <div class="w-full 3xl:w-[40%] 3xl:min-w-[800px] h-full bg-white overflow-y-auto flex items-center justify-center relative">
        <div class="m-auto px-10 py-20 w-full max-w-[600px] ">
          <Outlet />
        </div>
      </div>
      <div class="hidden w-[60%] bg-primary 3xl:flex items-center justify-center text-white relative">
        <span class="absolute inset-0 flex items-center">
          <span class="block  border border-border opacity-80 w-full after:pb-[100%] after:block rotate-45 translate-x-1/2"></span>
        </span>
        <span class="absolute inset-0 flex items-center">
          <span class="block  border border-border opacity-50 w-full after:pb-[100%] after:block rotate-45 translate-x-1/3"></span>
        </span>
      </div>
    </div>
  );
};

export default AuthRoutes;