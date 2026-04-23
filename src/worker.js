const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}

export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return jsonResponse({ message: "Hello World!" });
    }

    return jsonResponse({ error: "Not Found" }, 404);
  },
};
