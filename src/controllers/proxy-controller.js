import { isWebSocketUpgrade } from "../utils/header-utils.js";
import { rewriteSetCookieHeaders } from "../utils/cookie-utils.js";
import { parseProjectPath } from "../utils/path-utils.js";
import {
  buildProxyResponse,
  forwardProjectRequest,
} from "../services/proxy-service.js";
import { workerHelloResponse, workerJsonError } from "./health-controller.js";

export async function handleWorkerProjectProxy(request) {
  const url = new URL(request.url);
  const parsedPath = parseProjectPath(url.pathname);
  const isWebSocketRequest = isWebSocketUpgrade(request.headers.entries());

  if (!parsedPath) {
    return workerJsonError(404, "Not Found");
  }

  const result = await forwardProjectRequest({
    project: parsedPath.project,
    restPath: parsedPath.restPath,
    sourceUrl: url,
    method: request.method,
    headers: request.headers.entries(),
    body: request.body,
  });

  if (!result.ok) {
    return workerJsonError(result.status, result.error);
  }

  if (result.internalHello) {
    return workerHelloResponse();
  }

  if (isWebSocketRequest) {
    return result.upstreamResponse;
  }

  const proxyResponse = buildProxyResponse(result.upstreamResponse);

  const headers = rewriteSetCookieHeaders(proxyResponse.headers, {
    pathPrefix: `/${parsedPath.project}`,
    gatewayHost: url.hostname,
  });

  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers,
  });
}
