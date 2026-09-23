import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit tests for pure server-side logic — today only the migration journal's
 * ordering. Nothing here renders, so there is no jsdom environment and no setup
 * files; everything runs in plain Node. Anything that touches the database is
 * either mocked at the `@/db` boundary or covered by the build and by types.
 */
export default defineConfig({
  // Resolves the `@/*` alias from tsconfig.json.
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Next.js resolves this marker package itself; outside its bundler the
      // specifier does not exist. See the stub for why.
      "server-only": fileURLToPath(
        new URL("./vitest.server-only.stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
