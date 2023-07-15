"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = __importDefault(require("../../utils/app/route"));
const update_roles_1 = __importDefault(require("../../controllers/users/update-roles"));
const create_single_1 = __importDefault(require("../../controllers/users/create-single"));
const delete_single_1 = __importDefault(require("../../controllers/users/delete-single"));
const get_multiple_1 = __importDefault(require("../../controllers/users/get-multiple"));
const router = (0, express_1.Router)();
(0, route_1.default)(router, {
    method: "post",
    path: "/:id/roles",
    permissions: {
        global: ["assign_role"],
    },
    middleware: {
        authenticate: true,
        authoriseCSRF: true,
    },
    schema: update_roles_1.default.schema,
    controller: update_roles_1.default.controller,
});
(0, route_1.default)(router, {
    method: "post",
    path: "/",
    permissions: {
        global: ["create_user"],
    },
    middleware: {
        authenticate: true,
        authoriseCSRF: true,
    },
    schema: create_single_1.default.schema,
    controller: create_single_1.default.controller,
});
(0, route_1.default)(router, {
    method: "delete",
    path: "/:id",
    permissions: {
        global: ["delete_user"],
    },
    middleware: {
        authenticate: true,
        authoriseCSRF: true,
    },
    schema: delete_single_1.default.schema,
    controller: delete_single_1.default.controller,
});
(0, route_1.default)(router, {
    method: "get",
    path: "/",
    permissions: {
        global: ["read_users"],
    },
    middleware: {
        authenticate: true,
        authoriseCSRF: true,
        paginated: true,
    },
    schema: get_multiple_1.default.schema,
    controller: get_multiple_1.default.controller,
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map