import { PoolClient } from "pg";
// Utils
import { HeadlessError } from "@utils/app/error-handler.js";
import service from "@utils/app/service.js";
// Models
import FormSubmission from "@db/models/FormSubmission.js";
// Serives
import formSubService from "@services/form-submissions/index.js";
import formsService from "@services/forms/index.js";
// Format
import formatFormSubmission from "@utils/format/format-form-submission.js";

export interface ServiceData {
  id: number;
  form_key: string;
  environment_key: string;
}

const deleteSingle = async (client: PoolClient, data: ServiceData) => {
  // Check if form is assigned to environment
  await service(
    formSubService.hasEnvironmentPermission,
    false,
    client
  )({
    form_key: data.form_key,
    environment_key: data.environment_key,
  });

  // Delete form submission
  const formSubmission = await FormSubmission.deleteSingle(client, {
    id: data.id,
    form_key: data.form_key,
    environment_key: data.environment_key,
  });

  if (!formSubmission) {
    throw new HeadlessError({
      type: "basic",
      name: "Form Error",
      message: "This form submission does not exist.",
      status: 404,
    });
  }

  const formBuilder = formsService.getBuilderInstance({
    form_key: data.form_key,
  });

  return formatFormSubmission(formBuilder, {
    submission: formSubmission,
    data: [],
  });
};

export default deleteSingle;
