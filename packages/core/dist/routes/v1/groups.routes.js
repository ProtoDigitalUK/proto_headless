"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = __importDefault(require("../../utils/route"));
const update_single_1 = __importDefault(require("../../controllers/groups/update-single"));
const get_single_1 = __importDefault(require("../../controllers/groups/get-single"));
const router = (0, express_1.Router)();
(0, route_1.default)(router, {
    method: "patch",
    path: "/:collection_key",
    middleware: {
        authenticate: true,
        authoriseCSRF: true,
        validateBricks: true,
        validateEnvironment: true,
    },
    schema: update_single_1.default.schema,
    controller: update_single_1.default.controller,
});
(0, route_1.default)(router, {
    method: "get",
    path: "/:collection_key",
    middleware: {
        authenticate: false,
        authoriseCSRF: false,
        validateBricks: false,
        validateEnvironment: true,
    },
    schema: get_single_1.default.schema,
    controller: get_single_1.default.controller,
});
exports.default = router;
//# sourceMappingURL=groups.routes.js.map