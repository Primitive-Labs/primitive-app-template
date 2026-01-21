import { getJsBaoConfig, getLogLevel } from "@/config/envConfig";
import { createPrimitiveApp } from "primitive-app";
import App from "./App.vue";
import router from "./router/routes";
import "./style.css";

void createPrimitiveApp({
  mainComponent: App,
  router,
  jsBaoConfig: getJsBaoConfig(),
  logLevel: getLogLevel(),
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("[SW] registration failed", err));
  });
}
