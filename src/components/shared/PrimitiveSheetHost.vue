<script setup lang="ts">
/**
 * Sheet Host Component
 *
 * Renders the centralized sheet stack managed by SheetManager.
 * Include this component ONCE at your app's root layout.
 *
 * Features:
 * - Single backdrop for all sheets
 * - Proper z-index stacking
 * - Body scroll lock when sheets are open
 * - Backdrop click to close
 * - Escape key to close
 *
 * Usage:
 * ```vue
 * <template>
 *   <div>
 *     <!-- Your app content -->
 *     <PrimitiveSheetHost />
 *   </div>
 * </template>
 * ```
 */
import { computed, onMounted, onUnmounted, watch } from "vue";
import { sheetManager } from "@/services/SheetManager";

// Handle escape key to close topmost sheet
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && sheetManager.hasOpen) {
    event.preventDefault();
    sheetManager.close();
  }
}

onMounted(() => {
  // Register this host with the sheet manager
  sheetManager._registerHost();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  // Unregister this host from the sheet manager
  sheetManager._unregisterHost();
  document.removeEventListener("keydown", handleKeydown);
});

// Manage body scroll lock
watch(
  () => sheetManager.hasOpen,
  (hasOpen) => {
    if (hasOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

// Clean up on unmount
onUnmounted(() => {
  document.body.style.overflow = "";
});

function handleBackdropClick(): void {
  // Check if topmost sheet allows backdrop close
  const topSheet = sheetManager.stack[sheetManager.stack.length - 1];
  if (topSheet?.config?.closeOnBackdropClick !== false) {
    sheetManager.close();
  }
}

// Compute classes for each sheet based on its config
// Use z-index 70+ to render above Reka UI's Dialog/Sheet components (which use z-50)
function getSheetClasses(config?: { side?: string; class?: string }): string {
  const side = config?.side ?? "bottom";
  const baseClasses =
    "fixed bg-background shadow-lg flex flex-col transition-transform duration-300 ease-out";

  const sideClasses: Record<string, string> = {
    bottom: "inset-x-0 bottom-0 rounded-t-lg max-h-[90vh]",
    top: "inset-x-0 top-0 rounded-b-lg max-h-[90vh]",
    left: "inset-y-0 left-0 rounded-r-lg w-3/4 max-w-sm",
    right: "inset-y-0 right-0 rounded-l-lg w-3/4 max-w-sm",
  };

  return `${baseClasses} ${sideClasses[side] || sideClasses.bottom} ${config?.class || ""}`;
}

// Track for enter/leave animations
const isVisible = computed(() => sheetManager.hasOpen);
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop - z-index 60 to render above Reka UI's overlays (z-50) -->
    <Transition name="fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-black/60"
        style="z-index: 60"
        @click="handleBackdropClick"
      />
    </Transition>

    <!-- Sheet Stack - z-index 70+ to render above everything -->
    <TransitionGroup name="sheet-slide">
      <div
        v-for="(sheet, index) in sheetManager.stack"
        :key="sheet.id"
        :class="getSheetClasses(sheet.config)"
        :style="{ zIndex: 70 + index }"
        role="dialog"
        aria-modal="true"
      >
        <component :is="sheet.component" v-bind="sheet.props" />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sheet slide animations */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s ease;
}

/* Bottom sheet */
.sheet-slide-enter-from[class*="bottom"],
.sheet-slide-leave-to[class*="bottom"] {
  transform: translateY(100%);
}

/* Top sheet */
.sheet-slide-enter-from[class*="top"],
.sheet-slide-leave-to[class*="top"] {
  transform: translateY(-100%);
}

/* Left sheet */
.sheet-slide-enter-from[class*="left"],
.sheet-slide-leave-to[class*="left"] {
  transform: translateX(-100%);
}

/* Right sheet */
.sheet-slide-enter-from[class*="right"],
.sheet-slide-leave-to[class*="right"] {
  transform: translateX(100%);
}
</style>
