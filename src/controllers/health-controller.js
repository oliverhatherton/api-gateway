import { JSON_HEADERS } from "../consts/http.js";

export function workerHelloResponse() {
  return new Response(JSON.stringify({ message: "Hello World!" }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

export function workerJsonError(status, error) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: JSON_HEADERS,
  });
}
