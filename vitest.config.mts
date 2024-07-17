import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    clearMocks: true,
    reporters: ["verbose"],
    outputFile: "coverage/junit.xml",
    coverage: {
      provider: "v8",
      include: ["src/app.ts", "src/lib", "src/routes"],
    },
  },
});
