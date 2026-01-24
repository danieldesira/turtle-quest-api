import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./api/vitest.setup.ts"],
    environment: "node",
  },
});
