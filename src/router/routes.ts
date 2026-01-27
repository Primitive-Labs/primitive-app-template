import { config } from "@/config/envConfig";
import AppLayout from "@/layouts/AppLayout.vue";
import LoginLayout from "@/layouts/LoginLayout.vue";
import {
  createPrimitiveRouter,
  DebuggingSuiteDocuments,
  DebuggingSuiteDocumentsModel,
  DebuggingSuiteHome,
  DebuggingSuiteTests,
  DebugSuiteLayout,
  PrimitiveLogout,
  PrimitiveNotFound,
  PrimitiveOauthCallback,
} from "primitive-app";
import type { RouteRecordRaw } from "vue-router";
import { createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";

const oauthCallbackPath = config.oauthRedirectUri
  ? new URL(config.oauthRedirectUri).pathname
  : "/oauth/callback";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
        meta: {
          primitiveRouterMeta: {
            requireAuth: "member",
          },
        },
      },
    ],
  },
  {
    path: "/",
    component: LoginLayout,
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
    component: DebugSuiteLayout,
    props: {
      testGroups: [],
      appName: "Primitive Template App",
    },
    meta: {
      primitiveRouterMeta: {
        requireAuth: "member",
      },
    },
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
      {
        path: "documents/:model",
        name: "debug-documents-model",
        component: DebuggingSuiteDocumentsModel,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: PrimitiveNotFound,
    meta: {
      primitiveRouterMeta: {
        requireAuth: "none",
      },
    },
  },
];

const router = createPrimitiveRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  loginRouteName: "login",
});

export default router;
