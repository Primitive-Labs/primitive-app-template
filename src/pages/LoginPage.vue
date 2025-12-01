<script setup lang="ts">
import { PrimitiveLogin, useAppConfigStore } from "primitive-app";

const appConfig = useAppConfigStore();
</script>

<template>
  <PrimitiveLogin
    :appInfo="{
      name: appConfig.appName(),
      logo: appConfig.appIcon(),
    }"
    defaultContinueRoute="home"
  />
</template>
