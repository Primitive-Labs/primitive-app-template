// Environment and js-bao configuration for the template app
import type { JsBaoClientOptions } from "js-bao-wss-client";

// Raw environment-derived config shared between router and js-bao
export const config = {
  appId: import.meta.env.VITE_APP_ID,
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  enableAuthProxy: import.meta.env.VITE_ENABLE_AUTH_PROXY === "true",
};

function getRefreshProxyBaseUrl(): string {
  return typeof window !== "undefined"
    ? `${window.location.origin}/proxy`
    : "/proxy";
}

export function getJsBaoConfig(): JsBaoClientOptions {
  const auth = {
    persistJwtInStorage: true,
    ...(config.enableAuthProxy
      ? {
          refreshProxy: {
            baseUrl: getRefreshProxyBaseUrl(),
          },
        }
      : {}),
  };

  return {
    appId: config.appId,
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    oauthRedirectUri: config.oauthRedirectUri,
    auth,
  } as JsBaoClientOptions;
}

// Validate required configuration (dev aid)
const requiredVars = ["appId", "apiUrl", "wsUrl", "oauthRedirectUri"] as const;
const missingVars = requiredVars.filter(
  (key) => !config[key as (typeof requiredVars)[number]]
);

if (missingVars.length > 0) {
  // eslint-disable-next-line no-console
  console.error("Missing required environment variables:", missingVars);
  // eslint-disable-next-line no-console
  console.error(
    "Please check your .env file and ensure all VITE_ prefixed variables are set"
  );
}
