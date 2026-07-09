import { config } from "@/config/envConfig";
import AppLayout from "@/layouts/AppLayout.vue";
import LoginLayout from "@/layouts/LoginLayout.vue";
import PrimitiveLogout from "@/components/auth/PrimitiveLogout.vue";
import PrimitiveOauthCallback from "@/components/auth/PrimitiveOauthCallback.vue";
import PrimitiveOnboarding from "@/components/auth/PrimitiveOnboarding.vue";
import { createPrimitiveRouter } from "@/router/primitiveRouter";
import type { RouteRecordRaw } from "vue-router";
import { createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import InviteAcceptPage from "../pages/InviteAcceptPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";

const oauthCallbackPath = config.oauthRedirectUri
  ? new URL(config.oauthRedirectUri).pathname
  : "/oauth/callback";

const signedIn = { primitiveRouterMeta: { requireSignIn: true } };
const publicRoute = { primitiveRouterMeta: { requireSignIn: false } };

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
        meta: signedIn,
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
        meta: publicRoute,
      },
      {
        path: "logout",
        name: "logout",
        component: PrimitiveLogout,
        props: { continueRoute: "login" },
        meta: publicRoute,
      },
      {
        path: oauthCallbackPath,
        name: "oauth-callback",
        component: PrimitiveOauthCallback,
        props: {
          continueRoute: "home",
          loginRoute: "login",
          onboardingRoute: "onboarding",
        },
        meta: publicRoute,
      },
      {
        // Shared post-sign-in onboarding step (profile completion + passkey
        // prompt). Every sign-in method funnels through here for new users.
        // Requires sign-in: the router guard sends signed-out visitors to
        // login, and the user is always authenticated by the time they arrive.
        path: "onboarding",
        name: "onboarding",
        component: PrimitiveOnboarding,
        props: { continueRoute: "home" },
        meta: signedIn,
      },
      {
        path: "invite/accept",
        name: "invite-accept",
        component: InviteAcceptPage,
        props: { continueRoute: "home", loginRoute: "login" },
        meta: publicRoute,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
    meta: publicRoute,
  },
];

const router = createPrimitiveRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  loginRouteName: "login",
});

export default router;
