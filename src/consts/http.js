export const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
});

export const HOP_BY_HOP_HEADERS = Object.freeze(
  new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
  ]),
);