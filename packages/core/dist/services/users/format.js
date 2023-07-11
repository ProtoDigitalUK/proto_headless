"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatUser = (user, permissions) => {
    return {
        id: user.id,
        super_admin: user.super_admin,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: permissions?.roles,
        permissions: permissions?.permissions,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
};
exports.default = formatUser;
//# sourceMappingURL=format.js.map