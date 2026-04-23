import {
  expressHeadersToEntries,
  filterHopByHopHeaders,
} from "../utils/header-utils.js";
import { parseProjectPath } from "../utils/path-utils.js";
import {
  buildProxyResponse,
  forwardProjectRequest,
} from "../services/proxy-service.js";
import {
  sendExpressHello,
  workerHelloResponse,
  workerJsonError,
} from "./health-controller.js";

function buildExpressSourceUrl(request) {
  if (request.originalUrl) {
    return new URL(request.originalUrl, "http://localhost");
  }

  return new URL("http://localhost");
}

export async function handleExpressProjectProxy(request, response) {
  const project = String(request.params.project || "").toLowerCase();
  const restPath = String(request.params[0] || "");
  const result = await forwardProjectRequest({
    project,
    restPath,
    sourceUrl: buildExpressSourceUrl(request),
    method: request.method,
    headers: expressHeadersToEntries(request.headers),
    body: request.body,
  });

  if (!result.ok) {
    response.status(result.status).json({ error: result.error });
    return;
  }

  if (result.internalHello) {
    sendExpressHello(response);
    return;
  }

  const proxyResponse = buildProxyResponse(result.upstreamResponse);
  response.status(proxyResponse.status);
  proxyResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });

  if (!proxyResponse.body) {
    response.end();
    return;
  }

  const bodyBuffer = Buffer.from(await result.upstreamResponse.arrayBuffer());
  response.send(bodyBuffer);
}

export async function handleWorkerProjectProxy(request) {
  const url = new URL(request.url);
  const parsedPath = parseProjectPath(url.pathname);

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

  const proxyResponse = buildProxyResponse(result.upstreamResponse);

  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers: filterHopByHopHeaders(proxyResponse.headers.entries()),
  });
}
