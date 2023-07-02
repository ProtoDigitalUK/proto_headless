import { Router } from "express";
import r from "@utils/route";
// Controller
import createSingle from "@controllers/media/create-single";
import getMultiple from "@controllers/media/get-multiple";
import getSingle from "@controllers/media/get-single";

// ------------------------------------
// Router
const router = Router();

r(router, {
  method: "post",
  path: "/",
  permissions: {
    global: ["create_media"],
  },
  middleware: {
    authenticate: true,
    authoriseCSRF: true,
  },
  schema: createSingle.schema,
  controller: createSingle.controller,
});

r(router, {
  method: "get",
  path: "/",
  permissions: {
    global: ["read_media"],
  },
  middleware: {
    authenticate: true,
    authoriseCSRF: true,
    paginated: true,
  },
  schema: getMultiple.schema,
  controller: getMultiple.controller,
});

r(router, {
  method: "get",
  path: "/:key",
  permissions: {
    global: ["read_media"],
  },
  middleware: {
    authenticate: true,
    authoriseCSRF: true,
  },
  schema: getSingle.schema,
  controller: getSingle.controller,
});

export default router;
