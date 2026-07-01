const CORS_ALLOW_METHODS = "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";
const CORS_DEFAULT_ALLOW_HEADERS = "Content-Type, Authorization";

const ALLOWED_ORIGINS = new Set([
	"https://order-lifecycle.oliverhatherton.com",
]);

function normalizeOrigin(origin) {
	return origin && ALLOWED_ORIGINS.has(origin) ? origin : null;
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
	const allowedOrigin = normalizeOrigin(origin);

	if (!allowedOrigin) {
		return null;
	}

	return {
		"access-control-allow-origin": allowedOrigin,
		"access-control-allow-credentials": "true",
		"access-control-allow-methods": CORS_ALLOW_METHODS,
		"access-control-allow-headers": normalizeAllowHeaders(requestHeaders),
		"access-control-max-age": "86400",
	};
}

export function applyCorsToHeaders(headers, { origin, requestHeaders }) {
	const corsHeaders = buildCorsHeaderValues({ origin, requestHeaders });

	if (!corsHeaders) {
		return;
	}

	Object.entries(corsHeaders).forEach(([key, value]) => {
		headers.set(key, value);
	});

	setVaryHeader(headers, "Origin");
	setVaryHeader(headers, "Access-Control-Request-Headers");
}

export function workerCorsPreflightResponse(request) {
	const origin = request.headers.get("origin");

	if (!normalizeOrigin(origin)) {
		return new Response("Origin not allowed", {
			status: 403,
		});
	}

	const headers = new Headers();

	applyCorsToHeaders(headers, {
		origin,
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
		statusText: response.statusText,
		headers,
	});
}
