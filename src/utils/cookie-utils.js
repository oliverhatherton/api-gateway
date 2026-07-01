function joinPathPrefix(prefix, path) {
  const normalizedPrefix = prefix.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedPrefix}${normalizedPath}`;
}

function rewriteSetCookieValue(cookieValue, { pathPrefix, gatewayHost }) {
  const segments = cookieValue.split(";");

  const rewritten = segments
    .map((segment, index) => {
      // segments[0] is always "name=value", never an attribute.
      if (index === 0) {
        return segment;
      }

      const eqIndex = segment.indexOf("=");
      const rawName = eqIndex === -1 ? segment : segment.slice(0, eqIndex);
      const attrName = rawName.trim().toLowerCase();

      if (attrName === "path") {
        const attrValue = segment.slice(eqIndex + 1).trim();
        return ` Path=${joinPathPrefix(pathPrefix, attrValue)}`;
      }

      // No Path attribute at all needs no rewrite: browsers default an
      // absent Path to the directory of the request URL the browser used,
      // which is already the prefixed public path.

      if (attrName === "domain") {
        const attrValue = segment
          .slice(eqIndex + 1)
          .trim()
          .replace(/^\./, "")
          .toLowerCase();

        // An explicit Domain that isn't the gateway's own public host will
        // never domain-match requests through the proxy, and browsers
        // reject the entire Set-Cookie header in that case. Drop just the
        // attribute so the cookie falls back to a host-only cookie scoped
        // to the gateway's hostname instead of disappearing outright.
        return attrValue === gatewayHost.toLowerCase() ? segment : null;
      }

      return segment;
    })
    .filter((segment) => segment !== null);

  return rewritten.join(";");
}

export function rewriteSetCookieHeaders(headers, { pathPrefix, gatewayHost }) {
  const rewritten = new Headers();

  for (const [name, value] of headers.entries()) {
    if (name.toLowerCase() !== "set-cookie") {
      rewritten.append(name, value);
      continue;
    }

    rewritten.append(
      "set-cookie",
      rewriteSetCookieValue(value, { pathPrefix, gatewayHost }),
    );
  }

  return rewritten;
}
