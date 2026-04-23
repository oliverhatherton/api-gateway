function trimTrailingSlashes(value) {
  return value.replace(/\/+$/, "");
}

function trimLeadingSlashes(value) {
  return value.replace(/^\/+/, "");
}

export function resolveTargetUrl(baseUrl, restPath, sourceUrl) {
  const normalizedRestPath = trimLeadingSlashes(restPath || "");
  const targetPath = normalizedRestPath ? `/${normalizedRestPath}` : "";
  const targetUrl = new URL(`${trimTrailingSlashes(baseUrl)}${targetPath}`);
  targetUrl.search = sourceUrl.search;
  return targetUrl;
}

export function parseProjectPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length < 1) {
    return null;
  }

  return {
    project: parts[0].toLowerCase(),
    restPath: parts.slice(1).join("/"),
  };
}