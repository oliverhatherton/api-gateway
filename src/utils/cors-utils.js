const CORS_ALLOW_METHODS = "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";
const CORS_DEFAULT_ALLOW_HEADERS = "Content-Type, Authorization";

function normalizeOrigin(origin) {
  return origin || "*";
}

function normalizeAllowHeaders(requestHeaders) {
  return requestHeaders || CORS_DEFAULT_ALLOW_HEADERS;
}

function setVaryHeader(headers, value) {
  const current = headers.get("vary");

  if (!current) {
    headers.set("vary", value);
    return;
  }

  const values = current
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!values.includes(value.toLowerCase())) {
    headers.set("vary", `${current}, ${value}`);
  }
}

export function buildCorsHeaderValues({ origin, requestHeaders }) {
  return {
    "access-control-allow-origin": normalizeOrigin(origin),
    "access-control-allow-methods": CORS_ALLOW_METHODS,
    "access-control-allow-headers": normalizeAllowHeaders(requestHeaders),
    "access-control-max-age": "86400",
  };
}

export function applyCorsToHeaders(headers, { origin, requestHeaders }) {
  const corsHeaders = buildCorsHeaderValues({ origin, requestHeaders });

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  setVaryHeader(headers, "Origin");
  setVaryHeader(headers, "Access-Control-Request-Headers");
}

export function setExpressCorsHeaders(request, response) {
  const corsHeaders = buildCorsHeaderValues({
    origin: request.get("origin"),
    requestHeaders: request.get("access-control-request-headers"),
  });

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  response.append("Vary", "Origin");
  response.append("Vary", "Access-Control-Request-Headers");
}

export function workerCorsPreflightResponse(request) {
  const headers = new Headers();

  applyCorsToHeaders(headers, {
    origin: request.headers.get("origin"),
    requestHeaders: request.headers.get("access-control-request-headers"),
  });

  return new Response(null, {
    status: 204,
    headers,
  });
}

export function withWorkerCors(response, request) {
  const headers = new Headers(response.headers);

  applyCorsToHeaders(headers, {
    origin: request.headers.get("origin"),
    requestHeaders: request.headers.get("access-control-request-headers"),
  });

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
