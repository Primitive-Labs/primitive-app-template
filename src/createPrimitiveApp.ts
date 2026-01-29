import { createPinia, type Pinia } from "pinia";
import type { Component } from "vue";
import { createApp, type App as VueApp } from "vue";
import type { Router } from "vue-router";

import type { LogLevel } from "./lib/logger";
import { appBaseLogger } from "./lib/logger";
import { initializeJsBao } from "primitive-app";
import { useUserStore } from "./stores/userStore";

type JsBaoConfig = Parameters<typeof initializeJsBao>[0];

export interface PrimitiveAppBootstrapOptions {
  /**
   * Root component for the main application (app shell).
   */
  mainComponent: Component;

  /**
   * The vue-router instance used by the main application.
   */
  router: Router;

  /**
   * js-bao client configuration.
   */
  jsBaoConfig: JsBaoConfig;

  /**
   * Optional global log level applied to the shared logger infrastructure.
   * When provided, this overrides any environment-derived defaults so apps
   * can control logging behavior using their own runtime environment.
   */
  logLevel?: LogLevel;

  /**
   * Selector or element to mount the app into. Defaults to "#app".
   */
  mountTarget?: string | Element;
}

export interface PrimitiveAppBootstrapResult {
  app: VueApp<Element>;
  pinia: Pinia;
  router: Router;
}

/**
 * High-level bootstrap helper that wires a Vue 3 + Pinia + vue-router app
 * into js-bao.
 *
 * This function:
 * 1. Creates and installs Pinia
 * 2. Initializes the js-bao client
 * 3. Initializes the user store (auth state)
 * 4. Installs the router
 * 5. Mounts the app
 *
 * Apps are responsible for:
 * - Creating the router with createPrimitiveRouter()
 * - Handling sign-out events (watch userStore.isAuthenticated)
 * - Initializing document stores if needed
 * - Building their own layouts and navigation
 */
export async function createPrimitiveApp(
  options: PrimitiveAppBootstrapOptions
): Promise<PrimitiveAppBootstrapResult> {
  if (options.logLevel) {
    appBaseLogger.level = options.logLevel;
  }

  const app = createApp(options.mainComponent);
  const pinia = createPinia();

  // Install Pinia so that subsequent store usages are properly scoped.
  app.use(pinia);

  // Initialize js-bao client
  initializeJsBao(options.jsBaoConfig);

  // Initialize user store (auth state)
  const user = useUserStore();
  await user.initialize();

  // Install router
  app.use(options.router);

  // Mount the app
  const target = options.mountTarget ?? "#app";
  app.mount(target);

  return { app, pinia, router: options.router };
}
