<script setup lang="ts">
/**
 * Application sidebar component with collapsible support.
 *
 * Features:
 * - App name/logo header
 * - Navigation items
 * - User menu at the bottom with dropdown
 * - Collapsible rail for desktop
 *
 * Apps can customize navigation items, menu actions, and styling.
 */
import primitiveLogoIcon from "@/assets/primitive-logo.png";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, Home, Key, LogOut, Pencil } from "lucide-vue-next";
import { useUserStore } from "primitive-app";
import { RouterLink, useRoute } from "vue-router";

interface Props {
  /**
   * Whether this sidebar is rendered in mobile mode (inside a sheet).
   * When true, disables collapsible behavior.
   */
  mobile?: boolean;
}

interface Emits {
  (e: "navigate"): void;
  (e: "open-edit-profile"): void;
  (e: "open-passkey-management"): void;
}

const props = withDefaults(defineProps<Props>(), {
  mobile: false,
});
const emit = defineEmits<Emits>();

const userStore = useUserStore();
const route = useRoute();
const { isMobile } = useSidebar();

// App name
const appName = "Primitive Template App";

// Navigation items - customize this for your app
const navItems = [{ name: "home", label: "Home", icon: Home, path: "/" }];

function handleNavClick(): void {
  emit("navigate");
}
</script>

<template>
  <!-- Sidebar component for both mobile and desktop -->
  <Sidebar :collapsible="props.mobile ? 'none' : 'icon'">
    <!-- App header -->
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            class="cursor-default hover:bg-transparent"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg border"
            >
              <img :src="primitiveLogoIcon" alt="App Icon" class="size-4" />
            </div>
            <span class="truncate font-semibold">{{ appName }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- Navigation -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.name">
              <SidebarMenuButton as-child :is-active="route.path === item.path">
                <RouterLink :to="item.path" @click="handleNavClick">
                  <component :is="item.icon" />
                  <span>{{ item.label }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- User menu at bottom -->
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage
                    :src="userStore.currentUser?.avatarUrl || ''"
                    :alt="userStore.currentUser?.name || ''"
                  />
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{
                    userStore.currentUser?.name
                  }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{
                    userStore.currentUser?.email
                  }}</span>
                </div>
                <ChevronsUpDown class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              :side="isMobile ? 'bottom' : 'right'"
              align="end"
              :side-offset="4"
            >
              <DropdownMenuLabel class="p-0 font-normal">
                <div
                  class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage
                      :src="userStore.currentUser?.avatarUrl || ''"
                      :alt="userStore.currentUser?.name || ''"
                    />
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-medium">{{
                      userStore.currentUser?.name
                    }}</span>
                    <span class="truncate text-xs text-muted-foreground">{{
                      userStore.currentUser?.email
                    }}</span>
                  </div>
                  <!-- Online/offline indicator -->
                  <span
                    :class="
                      userStore.isOnline
                        ? 'ml-1 h-2 w-2 rounded-full bg-green-500'
                        : 'ml-1 h-2 w-2 rounded-full bg-red-500'
                    "
                    :aria-label="userStore.isOnline ? 'Online' : 'Offline'"
                  />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="emit('open-edit-profile')">
                <Pencil class="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem @click="emit('open-passkey-management')">
                <Key class="mr-2 h-4 w-4" />
                Manage Passkeys
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <RouterLink to="/logout" class="flex items-center">
                  <LogOut class="mr-2 h-4 w-4" />
                  Log out
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <!-- Rail for collapse/expand toggle (desktop only) -->
    <SidebarRail v-if="!props.mobile" />
  </Sidebar>
</template>
