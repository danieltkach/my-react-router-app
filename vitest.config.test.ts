import { defineConfig } from 'vite';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    css: true,
    include: ['app/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});