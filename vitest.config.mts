import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Route imports use the @/… alias — mirror tsconfig here.
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
