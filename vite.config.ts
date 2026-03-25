import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { primitiveDevTools } from "primitive-app/vite";
import { defineConfig, loadEnv } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const appName = env.VITE_APP_NAME || "Primitive Template App";

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      tailwindcss(),
      primitiveDevTools({
        appName,
        testsDir: "src/tests",
        keyboardShortcut: "cmd+shift+l",
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        ws: fileURLToPath(new URL("./src/ws-browser-stub.js", import.meta.url)),
      },
    },
  };
});
