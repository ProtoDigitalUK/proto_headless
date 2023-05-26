"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = __importDefault(require("zod"));
const validate_1 = __importDefault(require("@middleware/validate"));
const authenticate_1 = __importDefault(require("@middleware/authenticate"));
const authorise_csrf_1 = __importDefault(require("@middleware/authorise-csrf"));
const route = (router, props) => {
    const { method, path, controller } = props;
    const middleware = [];
    if (props.authoriseCSRF) {
        middleware.push(authorise_csrf_1.default);
    }
    if (props.authenticate) {
        middleware.push(authenticate_1.default);
    }
    if (props.schema?.params || props.schema?.query || props.schema?.body) {
        middleware.push((0, validate_1.default)(zod_1.default.object({ ...props.schema })));
    }
    switch (method) {
        case "get":
            router.get(path, middleware, controller);
            break;
        case "post":
            router.post(path, middleware, controller);
            break;
        case "put":
            router.put(path, middleware, controller);
            break;
        case "delete":
            router.delete(path, middleware, controller);
            break;
        case "patch":
            router.patch(path, middleware, controller);
            break;
        default:
            break;
    }
    return router;
};
exports.default = route;
//# sourceMappingURL=route.js.map