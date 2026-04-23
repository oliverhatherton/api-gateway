import { JSON_HEADERS } from "../consts/http.js";

export function sendExpressHello(response) {
  response.status(200).json({ message: "Hello World!" });
}

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