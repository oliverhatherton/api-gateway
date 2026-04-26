import { PROJECT_BACKENDS } from "../consts/project-backends.js";
import {
  filterHopByHopHeaders,
  isWebSocketUpgrade,
} from "../utils/header-utils.js";
import { resolveTargetUrl } from "../utils/path-utils.js";

export function getProjectBaseUrl(project) {
  return PROJECT_BACKENDS[String(project || "").toLowerCase()];
}

export function createForwardInit({ method, headers, body }) {
  const init = {
    method,
    headers,
    redirect: "manual",
  };

  if (body != null && method !== "GET" && method !== "HEAD") {
    init.body = body;
  }

  return init;
}

export async function forwardProjectRequest({
  project,
  restPath,
  sourceUrl,
  method,
  headers,
  body,
}) {
  const baseUrl = getProjectBaseUrl(project);

  if (!baseUrl) {
    return {
      ok: false,
      status: 404,
      error: "Unknown project",
    };
  }

  const targetUrl = resolveTargetUrl(baseUrl, restPath, sourceUrl);
  const isSelfHost =
    targetUrl.host.toLowerCase() === sourceUrl.host.toLowerCase();
  const isBasePath = targetUrl.pathname === "/";
  const isSafeMethod = method === "GET" || method === "HEAD";

  if (isSelfHost && isBasePath && isSafeMethod) {
    return {
      ok: true,
      internalHello: true,
    };
  }

  if (isSelfHost) {
    return {
      ok: false,
      status: 502,
      error: "Project backend cannot point to the gateway host",
    };
  }

  const headerEntries = Array.from(headers);
  const isWebSocket = isWebSocketUpgrade(headerEntries);
  const forwardHeaders = isWebSocket
    ? new Headers(headerEntries)
    : filterHopByHopHeaders(headerEntries);

  if (isWebSocket) {
    // Let the runtime set these for the upstream target host.
    forwardHeaders.delete("host");
    forwardHeaders.delete("content-length");
  }

  try {
    const upstreamResponse = await fetch(
      targetUrl,
      createForwardInit({
        method,
        headers: forwardHeaders,
        body,
      }),
    );

    return {
      ok: true,
      upstreamResponse,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Upstream request failed",
    };
  }
}

export function buildProxyResponse(upstreamResponse) {
  return {
    status: upstreamResponse.status,
    headers: filterHopByHopHeaders(upstreamResponse.headers.entries()),
    body: upstreamResponse.body,
  };
}
