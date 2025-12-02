<script setup lang="ts">
import {
  PrimitiveDebuggingSuite,
  type PrimitiveTestGroup,
} from "primitive-app";

const testGroups: PrimitiveTestGroup[] = [];
</script>

<template>
  <PrimitiveDebuggingSuite :test-groups="testGroups" app-name="Template Tests" />
</template>

