const PROXY_PREFIX = "/proxy";
const REFRESH_PATH = `${PROXY_PREFIX}/auth/refresh`;
const LOGOUT_PATH = `${PROXY_PREFIX}/auth/logout`;
const OAUTH_CALLBACK_PATH = `${PROXY_PREFIX}/oauth/callback`;

const toOrigin = (value, fallbackBase) => {
  if (!value || typeof value !== "string") return null;

  const tryParse = (candidate) => {
    if (!candidate || typeof candidate !== "string") return null;
    try {
      return new URL(candidate).origin;
    } catch {
      return null;
    }
  };

  const trimmed = value.trim();
  const direct = tryParse(trimmed);
  if (direct) {
    return direct;
  }

  if (!trimmed.includes("://")) {
    const httpsCandidate = tryParse(`https://${trimmed.replace(/^\/+/, "")}`);
    if (httpsCandidate) {
      return httpsCandidate;
    }
  }

  if (fallbackBase) {
    const baseOrigin = tryParse(fallbackBase.trim());
    if (baseOrigin) {
      try {
        return new URL(trimmed, ensureEndsWithSlash(baseOrigin)).origin;
      } catch {
        // no-op
      }
    }
  }

  return null;
};

const ensureEndsWithSlash = (value, fallback = "/") => {
  if (!value || typeof value !== "string") return fallback;
  return value.endsWith("/") ? value : `${value}/`;
};

const parseCookies = (header) => {
  if (!header) return {};
  return header.split(/;\s*/).reduce((acc, item) => {
    const [name, ...rest] = item.split("=");
    if (!name) return acc;
    acc[name.trim()] = rest.join("=");
    return acc;
  }, {});
};

const getSetCookies = (headers) => {
  if (!headers) return [];
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const value = headers.get("Set-Cookie");
  return value ? [value] : [];
};

const findCookieValue = (cookies, name) => {
  if (!cookies || !name) return null;
  const prefix = `${name}=`;
  for (const cookie of cookies) {
    if (!cookie) continue;
    const segments = cookie.split(";");
    for (const segment of segments) {
      const trimmed = segment.trim();
      if (trimmed.startsWith(prefix)) {
        return trimmed.substring(prefix.length);
      }
    }
  }
  return null;
};

const appendVary = (existing, value) => {
  if (!value) return existing || undefined;
  if (!existing) return value;
  const parts = existing.split(",").map((p) => p.trim().toLowerCase());
  if (parts.includes(value.toLowerCase())) {
    return existing;
  }
  return `${existing}, ${value}`;
};

const serializeCookie = ({
  name,
  value,
  maxAge,
  path,
  sameSite = "Lax",
  secure = true,
}) => {
  const parts = [`${name}=${value}`];
  parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  if (path) parts.push(`Path=${path}`);
  if (typeof maxAge === "number") {
    parts.push(`Max-Age=${maxAge}`);
    if (maxAge === 0) {
      parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    }
  }
  return parts.join("; ");
};

const getProxyConfig = (env) => {
  const apiOrigin = toOrigin(
    env.API_ORIGIN || env.VITE_API_URL,
    env.API_ORIGIN
  );
  const appId = env.APP_ID || env.VITE_APP_ID;
  const cookieName = appId ? `rt-${appId}` : null;
  const rawMaxAge = env.REFRESH_PROXY_COOKIE_MAX_AGE;
  const parsedMaxAge =
    typeof rawMaxAge === "string" ? Number.parseInt(rawMaxAge, 10) : NaN;
  const cookieMaxAge =
    Number.isFinite(parsedMaxAge) && parsedMaxAge > 0 ? parsedMaxAge : 604800;
  const cookiePath = ensureEndsWithSlash(
    env.REFRESH_PROXY_COOKIE_PATH || PROXY_PREFIX
  );

  return {
    apiOrigin,
    appId,
    cookieName,
    cookiePath,
    cookieMaxAge,
  };
};

const resolveCookieMaxAge = (request, defaultMaxAge) => {
  const header = request.headers.get("X-Refresh-Cookie-Max-Age");
  if (!header) return defaultMaxAge;
  const parsed = Number.parseInt(header, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultMaxAge;
  return parsed;
};

const cloneUpstreamHeaders = (upstreamHeaders, omit = []) => {
  const headers = new Headers();
  const omitLower = omit.map((h) => h.toLowerCase());
  for (const [key, value] of upstreamHeaders) {
    if (omitLower.includes(key.toLowerCase())) continue;
    headers.set(key, value);
  }
  return headers;
};

const buildProxyResponse = async ({
  upstreamResponse,
  cookieName,
  cookiePath,
  cookieMaxAge,
  shouldExpire,
  request,
}) => {
  const body = await upstreamResponse.text();
  const headers = cloneUpstreamHeaders(upstreamResponse.headers, [
    "set-cookie",
  ]);

  const varyHeader = appendVary(upstreamResponse.headers.get("Vary"), "Cookie");
  if (varyHeader) headers.set("Vary", varyHeader);

  const setCookies = getSetCookies(upstreamResponse.headers);
  const refreshCookieValue = cookieName
    ? findCookieValue(setCookies, cookieName)
    : null;
  const maxAgeOverride = resolveCookieMaxAge(request, cookieMaxAge);
  const requestIsSecure = new URL(request.url).protocol === "https:";

  if (refreshCookieValue && cookieName) {
    headers.append(
      "Set-Cookie",
      serializeCookie({
        name: cookieName,
        value: refreshCookieValue,
        maxAge: maxAgeOverride,
        path: cookiePath,
        secure: requestIsSecure,
      })
    );
  } else if (cookieName && (shouldExpire || upstreamResponse.status === 401)) {
    headers.append(
      "Set-Cookie",
      serializeCookie({
        name: cookieName,
        value: "",
        maxAge: 0,
        path: cookiePath,
        secure: requestIsSecure,
      })
    );
  }

  const contentType = upstreamResponse.headers.get("content-type") || "";
  if (
    !headers.has("Cache-Control") &&
    contentType.includes("application/json")
  ) {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
};

const buildUpstreamUrl = (origin, appId, path) => {
  const normalizedOrigin = ensureEndsWithSlash(origin || "");
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedOrigin}app/${appId}/api/${normalizedPath}`;
};

const forwardProxyRequest = async ({ request, url, headers }) => {
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method.toUpperCase())) {
    init.body = request.body;
  }

  return fetch(url, init);
};

const handleAuthRefresh = async (request, env, config) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { cookieName, cookiePath, cookieMaxAge, apiOrigin, appId } = config;
  if (!apiOrigin || !appId || !cookieName) {
    return new Response("Proxy not configured", { status: 500 });
  }

  const cookies = parseCookies(request.headers.get("Cookie"));
  const refreshCookieValue = cookies[cookieName] || null;

  const upstreamHeaders = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  if (refreshCookieValue) {
    upstreamHeaders.set("Cookie", `${cookieName}=${refreshCookieValue}`);
  }

  const upstreamUrl = buildUpstreamUrl(apiOrigin, appId, "auth/refresh");

  try {
    const upstreamResponse = await forwardProxyRequest({
      request,
      url: upstreamUrl,
      headers: upstreamHeaders,
    });

    return buildProxyResponse({
      upstreamResponse,
      cookieName,
      cookiePath,
      cookieMaxAge,
      shouldExpire: false,
      request,
    });
  } catch (error) {
    console.error("[WORKER][refresh] upstream error", error);
    return new Response("Upstream error", { status: 502 });
  }
};

const handleOAuthCallback = async (request, env, config, url) => {
  if (!["GET", "POST"].includes(request.method.toUpperCase())) {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { cookieName, cookiePath, cookieMaxAge, apiOrigin, appId } = config;
  if (!apiOrigin || !appId || !cookieName) {
    return new Response("Proxy not configured", { status: 500 });
  }

  const upstreamHeaders = new Headers({
    Accept: "application/json",
  });

  const incomingCookieHeader = request.headers.get("Cookie");
  if (incomingCookieHeader) {
    upstreamHeaders.set("Cookie", incomingCookieHeader);
  }

  const upstreamUrl = new URL(
    buildUpstreamUrl(apiOrigin, appId, "oauth/callback")
  );

  upstreamUrl.search = url.search;
  if (!upstreamUrl.searchParams.has("appId")) {
    upstreamUrl.searchParams.set("appId", appId);
  }

  try {
    const upstreamResponse = await forwardProxyRequest({
      request,
      url: upstreamUrl.toString(),
      headers: upstreamHeaders,
    });

    return buildProxyResponse({
      upstreamResponse,
      cookieName,
      cookiePath,
      cookieMaxAge,
      shouldExpire: false,
      request,
    });
  } catch (error) {
    console.error("[WORKER][oauth] upstream error", error);
    return new Response("Upstream error", { status: 502 });
  }
};

const handleAuthLogout = async (request, env, config) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { cookieName, cookiePath, cookieMaxAge, apiOrigin, appId } = config;
  if (!apiOrigin || !appId || !cookieName) {
    return new Response("Proxy not configured", { status: 500 });
  }

  const upstreamHeaders = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const incomingCookieHeader = request.headers.get("Cookie");
  if (incomingCookieHeader) {
    upstreamHeaders.set("Cookie", incomingCookieHeader);
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    upstreamHeaders.set("Authorization", authHeader);
  }

  const upstreamUrl = buildUpstreamUrl(apiOrigin, appId, "auth/logout");

  try {
    const upstreamResponse = await forwardProxyRequest({
      request,
      url: upstreamUrl,
      headers: upstreamHeaders,
    });

    return buildProxyResponse({
      upstreamResponse,
      cookieName,
      cookiePath,
      cookieMaxAge,
      shouldExpire: true,
      request,
    });
  } catch (error) {
    console.error("[WORKER][logout] upstream error", error);
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const requestIsSecure = new URL(request.url).protocol === "https:";
    if (cookieName) {
      headers.append(
        "Set-Cookie",
        serializeCookie({
          name: cookieName,
          value: "",
          maxAge: 0,
          path: cookiePath,
          secure: requestIsSecure,
        })
      );
    }
    return new Response(JSON.stringify({ error: "Upstream logout failed" }), {
      status: 502,
      headers,
    });
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(PROXY_PREFIX)) {
      const config = getProxyConfig(env);

      if (url.pathname === REFRESH_PATH) {
        return handleAuthRefresh(request, env, config);
      }

      if (url.pathname === LOGOUT_PATH) {
        return handleAuthLogout(request, env, config);
      }

      if (url.pathname === OAUTH_CALLBACK_PATH) {
        return handleOAuthCallback(request, env, config, url);
      }

      return new Response("Not Found", { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
