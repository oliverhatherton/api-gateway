import { HOP_BY_HOP_HEADERS } from "../consts/http.js";

export function filterHopByHopHeaders(headerEntries) {
  const headers = new Headers();

  for (const [name, value] of headerEntries) {
    if (value == null) {
      continue;
    }

    if (HOP_BY_HOP_HEADERS.has(String(name).toLowerCase())) {
      continue;
    }

    headers.set(name, value);
  }

  return headers;
}

export function expressHeadersToEntries(headersObject) {
  return Object.entries(headersObject);
}