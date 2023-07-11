// Utils
import { LucidError } from "@utils/app/error-handler";
// Models
import Role from "@db/models/Role";

export interface ServiceData {
  id: number;
}

const getSingle = async (data: ServiceData) => {
  const role = await Role.getSingle(data.id);

  if (!role) {
    throw new LucidError({
      type: "basic",
      name: "Role Error",
      message: "There was an error getting the role.",
      status: 500,
    });
  }

  return role;
};

export default getSingle;