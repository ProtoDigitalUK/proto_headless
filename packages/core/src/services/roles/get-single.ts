import { PoolClient } from "pg";
// Utils
import { HeadlessError } from "@utils/app/error-handler.js";
// Models
import Role from "@db/models/Role.js";
// Format
import formatRole from "@utils/format/format-roles.js";

export interface ServiceData {
  id: number;
}

const getSingle = async (client: PoolClient, data: ServiceData) => {
  const role = await Role.getSingle(client, {
    id: data.id,
  });

  if (!role) {
    throw new HeadlessError({
      type: "basic",
      name: "Role Error",
      message: "There was an error getting the role.",
      status: 500,
    });
  }

  return formatRole(role);
};

export default getSingle;
