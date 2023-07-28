import { Component } from "solid-js";
// Componetns
import CreateEnvironment from "@/components/Forms/CreateEnvironmentForm";

const CreateEnvrionemntRoute: Component = () => {
  return (
    <div class="flex justify-center items-center h-screen">
      <div class="max-w-2xl m-atuo">
        <h1>Create Environment</h1>
        <p>
          Environments are a top level grouping of collections, forms and
          bricks. With the seperation of environments, you can have multiple
          sites/apps running on the same CMS.
        </p>
        <div class="mt-10">
          <CreateEnvironment />
        </div>
      </div>
    </div>
  );
};

export default CreateEnvrionemntRoute;