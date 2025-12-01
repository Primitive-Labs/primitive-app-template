import { defineComponent, h } from "vue";

const AppIcon = defineComponent({
  name: "AppIcon",
  setup() {
    return () =>
      h(
        "div",
        {
          class:
            "flex items-center justify-center rounded-md border size-6 text-xs font-semibold",
        },
        "P"
      );
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
    allowDocumentSwitching: true,
    manageDocumentsRouteName: undefined,
  } as const;
}
