import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    clearMocks: true,
    coverage: {
      include: ["src/app.ts", "src/lib", "src/routes"],
    },
  },
});
