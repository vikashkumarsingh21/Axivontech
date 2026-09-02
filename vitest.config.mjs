import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      DATABASE_URL: "postgresql://testuser:testpass@localhost:5432/axivon_test?schema=public",
      SESSION_SECRET: "mock_session_secret_at_least_32_characters_long_for_test",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
