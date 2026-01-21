<script setup lang="ts">
import primitiveLogoIcon from "@/assets/primitive-logo.png";
import { PieChart, TrendingDown } from "lucide-vue-next";
import { PrimitiveLogin } from "primitive-app";
import { defineComponent, h, type Component } from "vue";

// App icon component
const AppIcon = defineComponent({
  name: "AppIcon",
  setup() {
    return () =>
      h("img", {
        src: primitiveLogoIcon,
        alt: "App Icon",
        class: "size-24",
      });
  },
});

const Feature1Content = defineComponent({
  name: "Feature1Content",
  setup() {
    return () =>
      h(
        "div",
        {
          class:
            "w-full max-w-4xl h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg flex items-center justify-center",
        },
        [
          h("div", { class: "text-center" }, [
            h(
              "div",
              {
                class:
                  "w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 mx-auto mb-3 flex items-center justify-center",
              },
              [h(PieChart, { class: "h-8 w-8 text-blue-600" })]
            ),
            h(
              "p",
              { class: "text-sm text-muted-foreground" },
              "Feature 1 Screenshot"
            ),
          ]),
        ]
      );
  },
});

const Feature2Content = defineComponent({
  name: "Feature2Content",
  setup() {
    return () =>
      h(
        "div",
        {
          class:
            "w-full max-w-4xl h-96 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg shadow-lg flex items-center justify-center",
        },
        [
          h("div", { class: "text-center" }, [
            h(
              "div",
              {
                class:
                  "w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-violet-300 mx-auto mb-3 flex items-center justify-center",
              },
              [h(TrendingDown, { class: "h-8 w-8 text-purple-600" })]
            ),
            h(
              "p",
              { class: "text-sm text-muted-foreground" },
              "Feature 2 Screenshot"
            ),
          ]),
        ]
      );
  },
});

const carouselItems: Array<{
  icon?: Component;
  title: string;
  description: string;
  content?: Component;
}> = [
  {
    icon: PieChart as unknown as Component,
    title: "Feature 1",
    description: "Lorum ipsum dolor sit amet, consectetur adipiscing elit.",
    content: Feature1Content,
  },
  {
    icon: TrendingDown as unknown as Component,
    title: "Feature 2",
    description: "Lorum ipsum dolor sit amet, consectetur adipiscing elit.",
    content: Feature2Content,
  },
];
</script>

<template>
  <PrimitiveLogin
    :appInfo="{
      name: 'Primitive Starter',
      logo: AppIcon,
    }"
    :carousel="{
      items: carouselItems,
      autoplayDelay: 2000,
    }"
    defaultContinueRoute="home"
  />
</template>
