"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_single_1 = __importDefault(require("./get-single"));
const get_all_1 = __importDefault(require("./get-all"));
const format_1 = __importDefault(require("./format"));
const get_builder_instance_1 = __importDefault(require("./get-builder-instance"));
exports.default = {
    getSingle: get_single_1.default,
    getAll: get_all_1.default,
    format: format_1.default,
    getBuilderInstance: get_builder_instance_1.default,
};
//# sourceMappingURL=index.js.map