import primitiveLogoIcon from "@/assets/primitive-logo.png";
import { DocumentStoreMode } from "primitive-app";
import { defineComponent, h } from "vue";

const AppIcon = defineComponent({
  name: "AppIcon",
  setup() {
    return () =>
      h("img", {
        src: primitiveLogoIcon,
        alt: "App Icon",
      });
  },
});

/**
 * App configuration factories used by primitive-app.
 *
 * These functions are called once during bootstrap and are not reactive.
 * Changing what they would return at runtime will not update an already
 * bootstrapped application.
 */

export function getAppConfig() {
  return {
    appName: "Primitive Starter App",
    homeRouteName: "home",
    loginRouteName: "login",
    appIcon: AppIcon,
    documentStoreMode: DocumentStoreMode.SingleDocument,
    // Profile completion/editing configuration
    // Controls which fields are shown when completing or editing user profiles
    profileConfig: {
      requestName: true, // Show name field in profile forms
      requireName: true, // Name is required before continuing
      requestAvatar: true, // Show avatar field in profile forms
      requireAvatar: false, // Avatar is optional
    },
  } as const;
}

export function getSingleDocumentConfig() {
  return {
    userVisibleDocumentName: "Document",
    userVisibleDocumentNamePlural: "Documents",
    defaultDocumentTitle: "My First Document",
    manageDocumentsRouteName: "documents",
  } as const;
}
