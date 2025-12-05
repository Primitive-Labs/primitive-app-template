import type { NavigationConfig } from "primitive-app";
import { NavigationOverflowMode } from "primitive-app";

export const templateNavigationConfig: NavigationConfig = {
  navOptions: {
    overflowMode: NavigationOverflowMode.Auto,
    maxVisibleTabs: 5,
    mobileNavEnabled: true,
    mobileBackEnabled: true,
  },
  navItems: {
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
  },
};
