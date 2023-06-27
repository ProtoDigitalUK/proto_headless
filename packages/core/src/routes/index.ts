import auth from "@routes/v1/auth.routes";
import health from "@routes/v1/health.routes";
import categories from "@routes/v1/categories.routes";
import pages from "@routes/v1/pages.routes";
import singlePages from "@routes/v1/single-pages.routes";
import collections from "@routes/v1/collections.routes";
import environments from "@routes/v1/environments.routes";
import roles from "@routes/v1/roles.routes";
import users from "@routes/v1/users.routes";
import permissions from "@routes/v1/permissions.routes";
import brickConfig from "@routes/v1/brick-config.routes";
import menus from "@routes/v1/menus.routes";

const initRoutes = (app: any) => {
  // Version 1
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/health", health);
  app.use("/api/v1/categories", categories);
  app.use("/api/v1/pages", pages);
  app.use("/api/v1/single-page", singlePages);
  app.use("/api/v1/collections", collections);
  app.use("/api/v1/environments", environments);
  app.use("/api/v1/roles", roles);
  app.use("/api/v1/users", users);
  app.use("/api/v1/permissions", permissions);
  app.use("/api/v1/brick-config", brickConfig);
  app.use("/api/v1/menus", menus);
};

export default initRoutes;
