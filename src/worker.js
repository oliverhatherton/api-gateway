import { workerHelloResponse } from "./controllers/health-controller.js";
import { handleWorkerProjectProxy } from "./controllers/proxy-controller.js";
import {
  withWorkerCors,
  workerCorsPreflightResponse,
} from "./utils/cors-utils.js";

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return workerCorsPreflightResponse(request);
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return withWorkerCors(workerHelloResponse(), request);
    }

    return withWorkerCors(await handleWorkerProjectProxy(request), request);
  },
};
