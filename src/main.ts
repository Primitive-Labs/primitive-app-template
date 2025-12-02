import { getAppConfig, getSingleDocumentConfig } from "@/config/appConfig";
import { getJsBaoConfig, getLogLevel } from "@/config/envConfig";
import { templateNavigationConfig } from "@/config/navigationConfig";
import { createPrimitiveApp } from "primitive-app";
import App from "./App.vue";
import router from "./router/routes";
import "./style.css";

void createPrimitiveApp({
  mainComponent: App,
  router,
  getAppConfig,
  getJsBaoConfig,
  navigationConfig: templateNavigationConfig,
  getSingleDocumentConfig,
  loginUrl: "/login",
  logLevel: getLogLevel(),
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("[SW] registration failed", err));
  });
}
