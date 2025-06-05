import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  // Ignore any files that shouldn't be routes
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}", "**/*.backup", "**/*.backup.*"],
}) satisfies RouteConfig;
