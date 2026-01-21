<script setup lang="ts">
/**
 * Main application layout with collapsible sidebar navigation.
 *
 * Features:
 * - Desktop: Collapsible sidebar that can minimize to icons
 * - Mobile: Sidebar opens as a sheet from hamburger menu
 * - Service worker disconnect banner
 *
 * This layout demonstrates a simple responsive pattern that apps can customize.
 */
import { useMediaQuery } from "@vueuse/core";
import { Menu } from "lucide-vue-next";
import { EditProfile, PasskeyManagement } from "primitive-app";
import { ref, onMounted, onBeforeUnmount } from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const isMobile = useMediaQuery("(max-width: 768px)");
const sidebarOpen = ref(false);

// Dialog state - managed here to avoid nested focus trap issues on mobile
const editProfileOpen = ref(false);
const passkeyDialogOpen = ref(false);

function handleOpenEditProfile(): void {
  if (isMobile.value && sidebarOpen.value) {
    // Close mobile sidebar first, wait for animation to complete
    sidebarOpen.value = false;
    setTimeout(() => {
      editProfileOpen.value = true;
    }, 350); // Slightly longer than the 300ms close animation
  } else {
    editProfileOpen.value = true;
  }
}

function handleOpenPasskeyManagement(): void {
  if (isMobile.value && sidebarOpen.value) {
    // Close mobile sidebar first, wait for animation to complete
    sidebarOpen.value = false;
    setTimeout(() => {
      passkeyDialogOpen.value = true;
    }, 350); // Slightly longer than the 300ms close animation
  } else {
    passkeyDialogOpen.value = true;
  }
}

// Service worker disconnect detection
const swDisconnected = ref(false);
let removeListener: (() => void) | null = null;

function handleRefresh(): void {
  try {
    window.location.reload();
  } catch {}
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === "Enter" || e.key === " ") handleRefresh();
}

function handleNavigate(): void {
  sidebarOpen.value = false;
}

onMounted(() => {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      swDisconnected.value = false;
      return;
    }
    swDisconnected.value = !navigator.serviceWorker.controller;
    const onControllerChange = () => {
      try {
        swDisconnected.value = !navigator.serviceWorker.controller;
      } catch {}
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );
    removeListener = () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
  } catch {}
});

onBeforeUnmount(() => {
  try {
    if (removeListener) {
      removeListener();
    }
  } catch {}
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Service worker disconnect banner -->
    <div
      v-if="swDisconnected"
      class="fixed top-0 left-0 right-0 z-50 w-full bg-red-600 text-white border-b border-red-700 px-4 py-2 cursor-pointer flex items-center justify-center text-center"
      role="button"
      tabindex="0"
      @click="handleRefresh"
      @keydown="onKeyDown"
    >
      Update required: Click to refresh
    </div>

    <div :class="{ 'pt-10': swDisconnected }">
      <!-- Desktop: Collapsible sidebar with SidebarProvider -->
      <SidebarProvider v-if="!isMobile">
        <AppSidebar
          :class="{ 'pt-10': swDisconnected }"
          @open-edit-profile="handleOpenEditProfile"
          @open-passkey-management="handleOpenPasskeyManagement"
        />
        <SidebarInset>
          <!-- Main content area -->
          <div class="flex flex-1 flex-col gap-4 p-4">
            <slot>
              <router-view />
            </slot>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <!-- Mobile: Hamburger + Sheet -->
      <template v-else>
        <Button
          variant="ghost"
          size="icon"
          class="fixed top-4 left-4 z-40"
          :class="{ 'top-14': swDisconnected }"
          @click="sidebarOpen = true"
        >
          <Menu class="h-5 w-5" />
          <span class="sr-only">Open menu</span>
        </Button>

        <Sheet v-model:open="sidebarOpen">
          <SheetContent side="left" class="w-72 bg-sidebar p-0">
            <SheetHeader class="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarProvider class="!min-h-0 h-full !w-full">
              <AppSidebar
                mobile
                @navigate="handleNavigate"
                @open-edit-profile="handleOpenEditProfile"
                @open-passkey-management="handleOpenPasskeyManagement"
              />
            </SidebarProvider>
          </SheetContent>
        </Sheet>

        <!-- Main content area for mobile -->
        <main class="flex-1 p-4 pt-16">
          <slot>
            <router-view />
          </slot>
        </main>
      </template>
    </div>

    <!-- Dialogs rendered outside the navigation sheet to avoid focus trap conflicts -->
    <EditProfile v-model:open="editProfileOpen" />
    <PasskeyManagement v-model:open="passkeyDialogOpen" />
  </div>
</template>
