import { config } from "@/config/envConfig";
import {
  createPrimitiveRouter,
  DebuggingSuiteDocuments,
  DebuggingSuiteHome,
  DebuggingSuiteTests,
  PrimitiveAppLayout,
  PrimitiveLoginLayout,
  PrimitiveLogout,
  PrimitiveOauthCallback,
} from "primitive-app";
import type { RouteRecordRaw } from "vue-router";
import { createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ManageDocumentsPage from "../pages/ManageDocumentsPage.vue";

const oauthCallbackPath = config.oauthRedirectUri
  ? new URL(config.oauthRedirectUri).pathname
  : "/oauth/callback";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: PrimitiveAppLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
        meta: {
          primitiveRouterMeta: {
            requireAuth: "member",
            breadcrumb: {
              title: "Home",
            },
          },
        },
      },
      {
        path: "documents",
        name: "documents",
        component: ManageDocumentsPage,
        meta: {
          primitiveRouterMeta: {
            requireAuth: "member",
            breadcrumb: {
              title: "Manage Documents",
            },
          },
        },
      },
    ],
  },
  {
    path: "/",
    component: PrimitiveLoginLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: LoginPage,
      },
      {
        path: "logout",
        name: "logout",
        component: PrimitiveLogout,
        props: {
          continueRoute: "login",
        },
      },
      {
        path: oauthCallbackPath,
        name: "oauth-callback",
        component: PrimitiveOauthCallback,
        props: {
          continueRoute: "home",
          loginRoute: "login",
        },
      },
    ],
  },
  {
    path: "/debug",
    component: () => import("../pages/DebugSuiteLayout.vue"),
    children: [
      {
        path: "",
        name: "debug-home",
        component: DebuggingSuiteHome,
      },
      {
        path: "test",
        name: "debug-test",
        component: DebuggingSuiteTests,
      },
      {
        path: "documents",
        name: "debug-documents",
        component: DebuggingSuiteDocuments,
      },
    ],
  },
];

const router = createPrimitiveRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  loginRouteName: "login",
});

export default router;
