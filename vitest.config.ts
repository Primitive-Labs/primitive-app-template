import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

/**
 * Vitest runs the registered `*.primitive-test.ts` harness groups headlessly
 * in Node (see src/tests/primitive-tests.spec.ts). It merges the app's own
 * Vite config so aliases, TOML model imports, and generated code resolve
 * exactly as they do in the browser.
 */
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      resolve: {
        // The js-bao ORM keeps document-routing state in statics on its
        // BaseModel class; ensure primitive-app and the app share one copy of
        // the client stack even when primitive-app is linked/duplicated.
        dedupe: ["js-bao", "js-bao-wss-client", "yjs"],
      },
      test: {
        environment: "node",
        include: ["src/tests/**/*.spec.ts"],
        server: {
          deps: {
            // js-bao-wss-client's dist uses extension-less relative imports,
            // which native Node ESM rejects — run it (and primitive-app,
            // which imports it) through Vite's resolver instead.
            inline: ["primitive-app", "js-bao-wss-client"],
          },
        },
        // Harness tests hit the real Primitive server (documents, blobs,
        // network sync), so allow more time than vitest's 5s default.
        testTimeout: 60_000,
        hookTimeout: 120_000,
      },
    })
  )
);
