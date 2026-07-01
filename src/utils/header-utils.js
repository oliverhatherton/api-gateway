import { HOP_BY_HOP_HEADERS } from "../consts/http.js";

export function isWebSocketUpgrade(headerEntries) {
  for (const [name, value] of headerEntries) {
    if (String(name).toLowerCase() !== "upgrade") {
      continue;
    }

    if (String(value).toLowerCase() === "websocket") {
      return true;
    }
  }

  return false;
}

export function filterHopByHopHeaders(headerEntries) {
  const headers = new Headers();

  for (const [name, value] of headerEntries) {
    if (value == null) {
      continue;
    }

    if (HOP_BY_HOP_HEADERS.has(String(name).toLowerCase())) {
      continue;
    }

    headers.append(name, value);
  }

  return headers;
}
