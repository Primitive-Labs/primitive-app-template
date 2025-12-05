import type { NavigationConfig } from "primitive-app";
import { NavigationOverflowMode } from "primitive-app";

/**
 * Navigation configuration factory for the template app.
 *
 * This function is called once during primitive-app bootstrap and is not
 * reactive. Updating its implementation at runtime will not change the
 * navigation; re-bootstrap the app if you need different navigation config.
 */
export function getNavigationConfig(): NavigationConfig {
  return {
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
  } as const;
}
