import sql from "@db/db";
import { LucidError } from "@utils/error-handler";

// -------------------------------------------
// Types
type PermissionNames = "manage_users" | "manage_content" | "manage_settings";
type PermissionRoles = "admin" | "editor";

type PermissionSet = (
  user_id: string,
  role: PermissionRoles
) => Promise<PermissionT>;

// -------------------------------------------
// User
export type PermissionT = {
  id: string;
  user_id: string;
  permissions: PermissionNames[];
  created_at: string;
  updated_at: string;
};

export default class Permission {
  // -------------------------------------------
  // Methods
  static set: PermissionSet = async (user_id, role) => {
    const permissions = Permission.rolePermissions(role);

    const [permission]: [PermissionT?] = await sql`
        SELECT * FROM lucid_permissions WHERE user_id = ${user_id}
        `;
    if (!permission) {
      const [permRes]: [PermissionT?] = await sql`
        INSERT INTO lucid_permissions (user_id, permissions)
        VALUES (${user_id}, ${permissions}) 
        RETURNING *
        `;
      if (!permRes) {
        throw new LucidError({
          type: "basic",
          name: "Permission Error",
          message: "There was an error setting the permissions.",
          status: 500,
        });
      }
      return permRes;
    } else {
      const [permRes]: [PermissionT?] = await sql`
        UPDATE lucid_permissions
        SET permissions = ${permissions}
        WHERE user_id = ${user_id} 
        RETURNING *
        `;
      if (!permRes) {
        throw new LucidError({
          type: "basic",
          name: "Permission Error",
          message: "There was an error setting the permissions.",
          status: 500,
        });
      }
      return permRes;
    }
  };
  // -------------------------------------------
  // Util Methods
  static rolePermissions = (role: PermissionRoles) => {
    switch (role) {
      case "admin":
        return ["manage_users", "manage_content", "manage_settings"];
      case "editor":
        return ["manage_content"];
      default:
        return [];
    }
  };
}