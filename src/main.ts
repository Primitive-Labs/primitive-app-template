import { getAppConfig, getSingleDocumentConfig } from "@/config/appConfig";
import { getJsBaoConfig } from "@/config/envConfig";
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
});
