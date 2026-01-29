<script setup lang="ts">
/**
 * User Menu Content
 *
 * The content portion of the user menu, designed to be rendered
 * inside a managed sheet via SheetManager.
 *
 * This component is used internally by PrimitiveUserMenu but can also
 * be used directly with the sheet manager for custom implementations.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Component } from "vue";
import { RouterLink } from "vue-router";
import { sheetManager } from "@/services/SheetManager";

export interface UserMenuContentUserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserMenuContentMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon component */
  icon: Component;
  /** If provided, renders as a RouterLink to this path */
  to?: string;
}

interface Props {
  /** User information to display */
  user: UserMenuContentUserInfo;
  /** Whether the user is online */
  isOnline?: boolean;
  /** Menu items to display */
  menuItems?: UserMenuContentMenuItem[];
}

interface Emits {
  /** Emitted when a menu item is clicked (for items without 'to' prop) */
  (e: "menu-item-click", itemId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isOnline: true,
  menuItems: () => [],
});

const emit = defineEmits<Emits>();

function getUserInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function handleMenuItemClick(item: UserMenuContentMenuItem): void {
  sheetManager.close();
  if (!item.to) {
    emit("menu-item-click", item.id);
  }
}

function handleLinkClick(): void {
  sheetManager.close();
}
</script>

<template>
  <div class="flex flex-col p-4">
    <!-- User info header -->
    <div class="flex items-center gap-3 pb-4 border-b border-border">
      <Avatar class="h-12 w-12">
        <AvatarImage
          :src="props.user.avatarUrl || ''"
          :alt="props.user.name || 'User'"
        />
        <AvatarFallback>
          {{ getUserInitials(props.user.name) }}
        </AvatarFallback>
      </Avatar>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium truncate">{{
            props.user.name || "User"
          }}</span>
          <span
            :class="
              props.isOnline
                ? 'h-2 w-2 rounded-full bg-green-500 shrink-0'
                : 'h-2 w-2 rounded-full bg-red-500 shrink-0'
            "
            :aria-label="props.isOnline ? 'Online' : 'Offline'"
          />
        </div>
        <span class="text-sm text-muted-foreground truncate block">
          {{ props.user.email || "" }}
        </span>
      </div>
    </div>

    <!-- Menu items -->
    <div class="flex flex-col gap-1 pt-2">
      <template v-for="item in props.menuItems" :key="item.id">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
          @click="handleLinkClick"
        >
          <component :is="item.icon" class="h-5 w-5 text-muted-foreground" />
          <span>{{ item.label }}</span>
        </RouterLink>
        <button
          v-else
          type="button"
          class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors w-full text-left"
          @click="handleMenuItemClick(item)"
        >
          <component :is="item.icon" class="h-5 w-5 text-muted-foreground" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
  </div>
</template>
