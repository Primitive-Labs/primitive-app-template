import primitiveLogoIcon from "@/assets/primitive-logo.png";
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

export function getAppConfig() {
  return {
    appName: "Primitive Starter App",
    homeRouteName: "home",
    loginRouteName: "login",
    appIcon: AppIcon,
  } as const;
}

export function getSingleDocumentConfig() {
  return {
    userVisibleDocumentName: "Document",
    userVisibleDocumentNamePlural: "Documents",
    defaultDocumentTitle: "My First Document",
    allowDocumentSwitching: false,
    manageDocumentsRouteName: "documents",
  } as const;
}
