<script setup lang="ts">
import { PrimitiveManageDocuments } from "primitive-app";
</script>

<template>
  <main class="space-y-6">
    <section>
      <h1 class="text-3xl font-bold tracking-tight">Manage Documents</h1>
      <p class="text-muted-foreground">
        Create, manage, and organize this app's documents.
      </p>
    </section>

    <section class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-4 sm:p-6">
        <PrimitiveManageDocuments />
      </div>
    </section>
  </main>
</template>
