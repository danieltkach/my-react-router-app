import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: [
    "**/.*",                    // Hidden files only
    "**/*.css",                 // CSS files only
    "**/*.test.{js,jsx,ts,tsx}", // Test files only
    "**/*.backup"               // Backup files only
  ],
}) satisfies RouteConfig;