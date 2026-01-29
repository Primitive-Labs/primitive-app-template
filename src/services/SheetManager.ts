/**
 * Centralized Sheet Manager
 *
 * Instead of each component managing its own sheet state, this provides
 * a single coordinated sheet stack. Benefits:
 * - One backdrop, one scroll lock
 * - Predictable z-index ordering
 * - No nesting bugs from component composition
 * - Easy back-button/swipe-to-dismiss handling
 *
 * Usage:
 * - Apps include <PrimitiveSheetHost> once at their root
 * - Components call sheetManager.open() to show sheets
 * - Components call sheetManager.close() to dismiss
 */
import type { Component, Raw } from "vue";
import { markRaw, reactive } from "vue";

/**
 * A sheet entry in the stack.
 */
export interface SheetEntry {
  /** Unique identifier for this sheet instance */
  id: string;
  /** The component to render as sheet content */
  component: Raw<Component>;
  /** Props to pass to the component */
  props: Record<string, unknown>;
  /** Callback when the sheet is closed */
  onClose?: () => void;
  /** Sheet configuration */
  config?: SheetConfig;
}

/**
 * Configuration options for a sheet.
 */
export interface SheetConfig {
  /** Side the sheet slides in from */
  side?: "top" | "right" | "bottom" | "left";
  /** Additional CSS classes for the sheet */
  class?: string;
  /** Whether clicking the backdrop closes the sheet (default: true) */
  closeOnBackdropClick?: boolean;
}

/**
 * Options for opening a sheet.
 */
export interface OpenSheetOptions {
  /** The component to render */
  component: Component;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Callback when the sheet is closed */
  onClose?: () => void;
  /** Sheet configuration */
  config?: SheetConfig;
}

interface SheetManagerState {
  stack: SheetEntry[];
  /** Whether a PrimitiveSheetHost is currently mounted */
  hostMounted: boolean;
}

const state = reactive<SheetManagerState>({
  stack: [],
  hostMounted: false,
});

/**
 * Generate a unique ID for sheet instances.
 */
function generateId(): string {
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * The sheet manager singleton.
 * Use this to open and close sheets from anywhere in the app.
 */
export const sheetManager = {
  /**
   * Register that a PrimitiveSheetHost has mounted.
   * Called internally by PrimitiveSheetHost.
   * @internal
   */
  _registerHost(): void {
    if (state.hostMounted) {
      console.warn(
        "[app] Multiple PrimitiveSheetHost instances detected. " +
          "Only one PrimitiveSheetHost should be mounted at a time."
      );
    }
    state.hostMounted = true;
  },

  /**
   * Unregister that a PrimitiveSheetHost has unmounted.
   * Called internally by PrimitiveSheetHost.
   * @internal
   */
  _unregisterHost(): void {
    state.hostMounted = false;
  },

  /**
   * Open a new sheet, pushing it onto the stack.
   * @returns The ID of the opened sheet (use to close it specifically)
   */
  open(options: OpenSheetOptions): string {
    // Development-time feedback if no host is mounted
    if (!state.hostMounted) {
      console.error(
        "[app] sheetManager.open() was called but no PrimitiveSheetHost is mounted. " +
          "Add <PrimitiveSheetHost /> to your app's root layout to enable mobile sheets."
      );
    }

    const id = generateId();
    const entry: SheetEntry = {
      id,
      component: markRaw(options.component),
      props: options.props ?? {},
      onClose: options.onClose,
      config: options.config,
    };
    state.stack.push(entry);
    return id;
  },

  /**
   * Close a sheet.
   * @param id - If provided, closes that specific sheet. Otherwise closes the topmost sheet.
   */
  close(id?: string): void {
    if (id) {
      const idx = state.stack.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const removed = state.stack.splice(idx, 1);
        if (removed[0]) {
          removed[0].onClose?.();
        }
      }
    } else if (state.stack.length > 0) {
      const entry = state.stack.pop();
      if (entry) {
        entry.onClose?.();
      }
    }
  },

  /**
   * Close all sheets.
   */
  closeAll(): void {
    while (state.stack.length > 0) {
      const entry = state.stack.pop();
      if (entry) {
        entry.onClose?.();
      }
    }
  },

  /**
   * Get the current sheet stack (reactive).
   */
  get stack(): SheetEntry[] {
    return state.stack;
  },

  /**
   * Check if any sheets are open.
   */
  get hasOpen(): boolean {
    return state.stack.length > 0;
  },

  /**
   * Get the number of open sheets.
   */
  get count(): number {
    return state.stack.length;
  },
};

/**
 * Composable for using the sheet manager in components.
 */
export function useSheetManager() {
  return sheetManager;
}
