<script setup lang="ts">
import { Card, CardContent, PrimitiveManageDocuments } from "primitive-app";
</script>

<template>
  <main class="space-y-6">
    <section>
      <h1 class="text-3xl font-bold tracking-tight">Manage Documents</h1>
      <p class="text-muted-foreground">
        Create, manage, and organize this app's documents.
      </p>
    </section>

    <Card class="p-0">
      <CardContent class="p-0">
        <PrimitiveManageDocuments />
      </CardContent>
    </Card>
  </main>
</template>


