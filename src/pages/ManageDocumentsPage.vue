<script setup lang="ts">
/**
 * Page for managing documents - listing, creating, sharing, deleting.
 * Uses the PrimitiveDocumentList component from primitive-app.
 */
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { config } from "@/config/envConfig";
import { jsBaoClientService, PrimitiveDocumentList } from "primitive-app";
import { useMediaQuery } from "@vueuse/core";
import { Plus } from "lucide-vue-next";
import { ref } from "vue";

const isMobile = useMediaQuery("(max-width: 640px)");

// Template for invitation links - use root URL since template app handles documents there
const inviteUrlTemplate = config.baseUrl || undefined;

const isCreateOpen = ref(false);
const newDocName = ref("");
const isCreating = ref(false);

function handleDocumentClick(documentId: string, title: string): void {
  // Handle document click - customize this for your app
  alert(
    `"${title}" selected. Add code here to wire this up in your application to the appropriate action.`
  );
}

async function handleCreateDocument(): Promise<void> {
  const name = newDocName.value.trim();
  if (!name || isCreating.value) return;

  isCreating.value = true;
  try {
    const client = await jsBaoClientService.getClientAsync();
    const createRes = await client.documents.create({ title: name });
    const newId = createRes.metadata.documentId;
    console.log("Created document:", newId);
    // Example: router.push(`/documents/${newId}`);
  } catch (error) {
    console.error("Failed to create document:", error);
  } finally {
    isCreating.value = false;
    newDocName.value = "";
    isCreateOpen.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold">Manage Documents</h1>
        <p class="text-sm text-muted-foreground">
          Create, share, and manage your documents.
        </p>
      </div>
      <Button size="sm" @click="isCreateOpen = true">
        <Plus class="h-4 w-4 mr-2" /> New Document
      </Button>
    </div>

    <PrimitiveDocumentList
      document-name="Document"
      :invite-url-template="inviteUrlTemplate"
      @document-click="handleDocumentClick"
    />

    <!-- Create document dialog (desktop) -->
    <Dialog
      v-if="!isMobile"
      :open="isCreateOpen"
      @update:open="(val: boolean) => (isCreateOpen = val)"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Document</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid gap-2">
            <Label for="create-document">Document Name</Label>
            <Input
              id="create-document"
              v-model="newDocName"
              placeholder="e.g., My Document"
              :disabled="isCreating"
              @keyup.enter="handleCreateDocument"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            :disabled="!newDocName.trim() || isCreating"
            @click="handleCreateDocument"
          >
            {{ isCreating ? "Creating..." : "Create" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Create document sheet (mobile) -->
    <Sheet
      v-if="isMobile"
      :open="isCreateOpen"
      @update:open="(val: boolean) => (isCreateOpen = val)"
    >
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>New Document</SheetTitle>
        </SheetHeader>
        <div class="space-y-4 px-4 py-4">
          <div class="grid gap-2">
            <Label for="create-document-mobile">Document Name</Label>
            <Input
              id="create-document-mobile"
              v-model="newDocName"
              placeholder="e.g., My Document"
              :disabled="isCreating"
              @keyup.enter="handleCreateDocument"
            />
          </div>
        </div>
        <SheetFooter>
          <Button
            class="w-full"
            :disabled="!newDocName.trim() || isCreating"
            @click="handleCreateDocument"
          >
            {{ isCreating ? "Creating..." : "Create" }}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
