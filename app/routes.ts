import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: [
    "**/.*",                    // Hidden files (like .DS_Store)
    "**/*.css",                 // CSS files
    "**/*.test.{js,jsx,ts,tsx}", // Test files
    "**/*.backup",              // Files ending in .backup
    "**/($lang)._index.tsx.backup", // Specific backup files
    "**/($lang).categories.tsx.backup"
  ],
}) satisfies RouteConfig;