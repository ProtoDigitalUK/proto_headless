"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = __importDefault(require("../../db/models/Environment"));
const error_handler_1 = require("../../utils/app/error-handler");
const environments_1 = __importDefault(require("../environments"));
const deleteSingle = async (data) => {
    await environments_1.default.getSingle({
        key: data.key,
    });
    const environment = await Environment_1.default.deleteSingle(data.key);
    if (!environment) {
        throw new error_handler_1.LucidError({
            type: "basic",
            name: "Environment not deleted",
            message: `Environment with key "${data.key}" could not be deleted`,
            status: 400,
        });
    }
    return environments_1.default.format(environment);
};
exports.default = deleteSingle;
//# sourceMappingURL=delete-single.js.map