import type { NavigationConfig } from "primitive-app";

export const templateNavigationConfig: NavigationConfig = {
  home: {
    key: "home",
    navTitle: "Home",
    navGroup: "main",
    routeName: "home",
  },
  logout: {
    key: "logout",
    navTitle: "Log out",
    navGroup: "user-menu",
    routeName: "logout",
  },
};
