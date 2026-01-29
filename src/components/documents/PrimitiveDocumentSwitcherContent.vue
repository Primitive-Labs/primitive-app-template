<script setup lang="ts">
/**
 * Document Switcher Content
 *
 * The content portion of the document switcher, designed to be rendered
 * inside a managed sheet via SheetManager.
 */
import PrimitiveLoadingGate from "@/components/shared/PrimitiveLoadingGate.vue";
import { appBaseLogger } from "@/lib/logger";
import { jsBaoClientService } from "primitive-app";
import { sheetManager } from "@/services/SheetManager";
import type {
  DocumentInfo,
  DocumentMetadataChangedEvent,
} from "js-bao-wss-client";
import { FolderOpen } from "lucide-vue-next";
import type { Component } from "vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const logger = appBaseLogger.forScope("PrimitiveDocumentSwitcherContent");

/**
 * Document metadata tracked locally.
 */
interface TrackedDocument {
  documentId: string;
  permission: DocumentInfo["permission"];
  tags: string[];
  title: string;
}

/**
 * Pending invitation with document metadata.
 */
interface PendingInvitation {
  invitationId: string;
  documentId: string;
  email: string;
  permission: "owner" | "read-write" | "reader";
  invitedBy: string;
  invitedAt: string;
  title?: string;
}

interface Props {
  /**
   * Label text displayed in the header.
   */
  label: string;
  /**
   * Icon component to display in the header.
   */
  icon?: Component;
  /**
   * ID of the currently active document.
   */
  currentDocumentId?: string | null;
  /**
   * Plural name for documents.
   */
  documentNamePlural?: string;
  /**
   * Route path for the manage documents page.
   */
  manageDocumentsPath?: string;
}

interface Emits {
  (e: "switch-document", documentId: string, title: string): void;
  (e: "navigate"): void;
}

const props = withDefaults(defineProps<Props>(), {
  currentDocumentId: null,
  documentNamePlural: "Documents",
});

const emit = defineEmits<Emits>();

// Local state for documents and invitations
const documents = ref<TrackedDocument[]>([]);
const pendingInvitations = ref<PendingInvitation[]>([]);
const documentListLoaded = ref(false);

// Track event listener cleanup
let metadataChangeUnsubscribe: (() => void) | null = null;

/**
 * Convert a DocumentInfo from js-bao to our TrackedDocument type.
 */
const toTrackedDocument = (doc: DocumentInfo): TrackedDocument => {
  const docWithAltFields = doc as DocumentInfo & {
    tags?: string[];
    lastKnownPermission?: DocumentInfo["permission"];
  };
  return {
    documentId: doc.documentId,
    permission:
      doc.permission ?? docWithAltFields.lastKnownPermission ?? "reader",
    tags: docWithAltFields.tags ?? [],
    title: doc.title ?? "",
  };
};

/**
 * Load the document list from the js-bao client.
 */
const loadDocuments = async (): Promise<void> => {
  try {
    logger.debug("Loading document list...");
    const client = await jsBaoClientService.getClientAsync();
    const list: DocumentInfo[] = await client.documents.list();
    documents.value = list.map((doc) => toTrackedDocument(doc));
    documentListLoaded.value = true;
    logger.debug("Document list loaded", { count: documents.value.length });
  } catch (error) {
    logger.error("Failed to load document list", { error });
    documentListLoaded.value = true;
  }
};

/**
 * Load pending invitations from the js-bao client.
 */
const loadInvitations = async (): Promise<void> => {
  try {
    logger.debug("Loading pending invitations...");
    const client = await jsBaoClientService.getClientAsync();
    const invitations = await client.me.pendingDocumentInvitations();
    pendingInvitations.value = invitations as PendingInvitation[];
    logger.debug("Pending invitations loaded", { count: invitations.length });
  } catch (error) {
    logger.error("Failed to load invitations", { error });
  }
};

// Load data on mount and set up event listeners
onMounted(async () => {
  await Promise.all([loadDocuments(), loadInvitations()]);

  // Listen for document metadata changes to auto-refresh the list
  const client = await jsBaoClientService.getClientAsync();
  const handler = (event: DocumentMetadataChangedEvent) => {
    const action = event.action;
    if (action === "created" || action === "updated" || action === "deleted") {
      logger.debug("Document metadata changed, refreshing list", {
        documentId: event.documentId,
        action,
      });
      loadDocuments();
    }
  };
  client.on("documentMetadataChanged", handler);
  metadataChangeUnsubscribe = () =>
    client.off("documentMetadataChanged", handler);
});

// Clean up event listeners on unmount
onUnmounted(() => {
  if (metadataChangeUnsubscribe) {
    metadataChangeUnsubscribe();
    metadataChangeUnsubscribe = null;
  }
});

const sortedDocumentsForMenu = computed(() => {
  if (!documentListLoaded.value) {
    return [];
  }

  return [...documents.value]
    .filter((doc) => doc && doc.title)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
});

function handleSwitchDocument(documentId: string, title: string): void {
  sheetManager.close();
  emit("switch-document", documentId, title);
}

function handleManageDocumentsClick(): void {
  sheetManager.close();
  emit("navigate");
  if (props.manageDocumentsPath) {
    router.push(props.manageDocumentsPath);
  }
}
</script>

<template>
  <div class="flex flex-col p-4">
    <!-- Header with icon and label -->
    <div class="flex items-center gap-3 pb-4 border-b border-border">
      <component v-if="props.icon" :is="props.icon" class="size-6 shrink-0" />
      <span class="text-lg font-medium">{{ props.label }}</span>
    </div>

    <!-- Menu items -->
    <div class="flex flex-col gap-1 pt-2">
      <!-- Manage Documents link -->
      <button
        v-if="props.manageDocumentsPath"
        type="button"
        class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors w-full text-left"
        @click="handleManageDocumentsClick"
      >
        <FolderOpen class="h-5 w-5 text-muted-foreground" />
        <span>Manage {{ props.documentNamePlural }}</span>
        <span
          v-if="pendingInvitations.length > 0"
          class="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full shrink-0"
        >
          {{ pendingInvitations.length }}
        </span>
      </button>

      <!-- Separator -->
      <div
        v-if="
          props.manageDocumentsPath &&
          (!documentListLoaded ||
            (Array.isArray(sortedDocumentsForMenu) &&
              sortedDocumentsForMenu.length > 1))
        "
        class="h-px bg-border my-2"
      />

      <!-- Loading state -->
      <PrimitiveLoadingGate :is-ready="documentListLoaded">
        <template #loading>
          <div
            v-for="i in [0, 1, 2]"
            :key="`skeleton-${i}`"
            class="flex items-center gap-3 px-3 py-3"
          >
            <span class="w-8" aria-hidden />
            <span
              class="h-4 w-40 rounded bg-muted/50 animate-pulse"
              aria-hidden
            />
          </div>
        </template>

        <!-- Document list -->
        <template
          v-if="
            Array.isArray(sortedDocumentsForMenu) &&
            sortedDocumentsForMenu.length > 1
          "
        >
          <button
            v-for="doc in sortedDocumentsForMenu"
            :key="doc.documentId"
            type="button"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors w-full text-left"
            @click="handleSwitchDocument(doc.documentId, doc.title)"
          >
            <span class="w-8" aria-hidden />
            <span
              :class="{
                'font-semibold': props.currentDocumentId === doc.documentId,
              }"
            >
              {{ doc.title }}
            </span>
            <span
              v-if="props.currentDocumentId === doc.documentId"
              class="ml-2 inline-block w-2 h-2 rounded-full bg-blue-600"
              aria-hidden
            />
          </button>
        </template>
      </PrimitiveLoadingGate>
    </div>
  </div>
</template>
