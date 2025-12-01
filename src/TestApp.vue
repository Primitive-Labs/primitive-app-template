<script setup lang="ts">
import {
  PrimitiveTestHarnessApp,
  type PrimitiveTestGroup,
} from "primitive-app";

const testGroups: PrimitiveTestGroup[] = [];
</script>

<template>
  <PrimitiveTestHarnessApp :test-groups="testGroups" app-name="Template Tests" />
</template>


