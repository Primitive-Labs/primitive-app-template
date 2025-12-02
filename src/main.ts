import { getAppConfig, getSingleDocumentConfig } from "@/config/appConfig";
import { getJsBaoConfig } from "@/config/envConfig";
import { templateNavigationConfig } from "@/config/navigationConfig";
import { createPrimitiveApp, type LogLevel } from "primitive-app";
import App from "./App.vue";
import TestApp from "./TestApp.vue";
import router from "./router/routes";
import "./style.css";

const envLogLevel =
  (import.meta.env.VITE_LOG_LEVEL?.toLowerCase().trim() as
    | LogLevel
    | undefined) ?? "debug";

void createPrimitiveApp({
  mainComponent: App,
  testHarnessComponent: TestApp,
  router,
  getAppConfig,
  getJsBaoConfig,
  navigationConfig: templateNavigationConfig,
  getSingleDocumentConfig,
  loginUrl: "/login",
  logLevel: envLogLevel,
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) =>
      // eslint-disable-next-line no-console
      console.error("[SW] registration failed", err)
    );
  });
}
