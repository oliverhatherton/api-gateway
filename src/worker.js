import { workerHelloResponse } from "./controllers/health-controller.js";
import { handleWorkerProjectProxy } from "./controllers/proxy-controller.js";
import { isWebSocketUpgrade } from "./utils/header-utils.js";
import {
  withWorkerCors,
  workerCorsPreflightResponse,
} from "./utils/cors-utils.js";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return workerCorsPreflightResponse(request);
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return withWorkerCors(workerHelloResponse(), request);
    }

    if (isWebSocketUpgrade(request.headers.entries())) {
      return handleWorkerProjectProxy(request, env);
    }

    return withWorkerCors(
      await handleWorkerProjectProxy(request, env),
      request,
    );
  },
};
