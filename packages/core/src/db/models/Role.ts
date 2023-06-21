import z from "zod";
import client from "@db/db";
// Schema
import roleSchema from "@schemas/roles";
// Utils
import { LucidError, modelErrors } from "@utils/error-handler";
import { queryDataFormat } from "@utils/query-helpers";
// Models
import RolePermission from "@db/models/RolePermission";
// Services
import validatePermissions from "@services/roles/validate-permissions";

// -------------------------------------------
// Types
type RoleCreateSingle = (
  data: z.infer<typeof roleSchema.createSingle.body>
) => Promise<RoleT>;
type RoleDeleteSingle = (id: number) => Promise<RoleT>;
type RoleGetMultiple = (ids: number[]) => Promise<RoleT[]>;
type RoleUpdateSingle = (
  id: number,
  data: z.infer<typeof roleSchema.updateSingle.body>
) => Promise<RoleT>;

// -------------------------------------------
// User
export type RoleT = {
  id: number;
  environment_key: string;
  user_id: string;
  role_id: string;

  permissions: string[];

  created_at: string;
  updated_at: string;
};

export default class Role {
  // -------------------------------------------
  // Functions
  static createSingle: RoleCreateSingle = async (data) => {
    const { columns, aliases, values } = queryDataFormat(["name"], [data.name]);

    const parsePermissions = await validatePermissions(data.permission_groups);

    // check if role name is unique
    await Role.#roleNameUnique(data.name);

    const roleRes = await client.query<RoleT>({
      text: `INSERT INTO lucid_roles (${columns.formatted.insert}) VALUES (${aliases.formatted.insert}) RETURNING *`,
      values: values.value,
    });

    let role = roleRes.rows[0];

    if (!role) {
      throw new LucidError({
        type: "basic",
        name: "Role Error",
        message: "There was an error creating the role.",
        status: 500,
      });
    }

    if (data.permission_groups.length > 0) {
      try {
        await RolePermission.createMultiple(role.id, parsePermissions);
      } catch (error) {
        await Role.deleteSingle(role.id);
        throw error;
      }
    }

    return role;
  };
  static deleteSingle: RoleDeleteSingle = async (id) => {
    const roleRes = await client.query<RoleT>({
      text: `DELETE FROM lucid_roles WHERE id = $1 RETURNING *`,
      values: [id],
    });

    let role = roleRes.rows[0];

    if (!role) {
      throw new LucidError({
        type: "basic",
        name: "Role Error",
        message: "There was an error deleting the role.",
        status: 500,
      });
    }

    return role;
  };
  static getMultiple: RoleGetMultiple = async (data) => {
    const rolesRes = await client.query<RoleT>({
      text: `SELECT * FROM lucid_roles WHERE id = ANY($1)`,
      values: [data],
    });

    let roles = rolesRes.rows;

    if (!roles) {
      throw new LucidError({
        type: "basic",
        name: "Role Error",
        message: "There was an error getting the roles.",
        status: 500,
      });
    }

    return roles;
  };
  static updateSingle: RoleUpdateSingle = async (id, data) => {
    const { columns, aliases, values } = queryDataFormat(["name"], [data.name]);
    const parsePermissions = await validatePermissions(data.permission_groups);

    await Role.#roleNameUnique(data.name, id);

    const roleRes = await client.query<RoleT>({
      text: `UPDATE lucid_roles SET ${columns.formatted.update} WHERE id = $${
        aliases.value.length + 1
      } RETURNING *`,
      values: [...values.value, id],
    });

    let role = roleRes.rows[0];

    if (!role) {
      throw new LucidError({
        type: "basic",
        name: "Role Error",
        message: "There was an error updating the role.",
        status: 500,
      });
    }

    if (data.permission_groups.length > 0) {
      await RolePermission.deleteAll(id);
      await RolePermission.createMultiple(id, parsePermissions);
    }

    return role;
  };
  // -------------------------------------------
  // Util Functions
  static #roleNameUnique = async (name: string, id?: number) => {
    const roleCheck = await client.query<RoleT>({
      text: `SELECT * FROM lucid_roles WHERE name = $1 AND id != $2`,
      values: [name, id],
    });

    if (roleCheck.rows.length > 0) {
      throw new LucidError({
        type: "basic",
        name: "Role Error",
        message: "The role name must be unique.",
        status: 500,
        errors: modelErrors({
          name: {
            code: "Not unique",
            message: "The role name must be unique.",
          },
        }),
      });
    }
  };
}
