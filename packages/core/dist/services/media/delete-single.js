"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../../utils/app/error-handler");
const Media_1 = __importDefault(require("../../db/models/Media"));
const media_1 = __importDefault(require("../media"));
const s3_1 = __importDefault(require("../s3"));
const deleteSingle = async (data) => {
    const media = await Media_1.default.deleteSingle(data.key);
    if (!media) {
        throw new error_handler_1.LucidError({
            type: "basic",
            name: "Media not found",
            message: "Media not found",
            status: 404,
        });
    }
    await s3_1.default.deleteFile({
        key: media.key,
    });
    await media_1.default.setStorageUsed({
        add: 0,
        minus: media.file_size,
    });
    return media_1.default.format(media);
};
exports.default = deleteSingle;
//# sourceMappingURL=delete-single.js.map