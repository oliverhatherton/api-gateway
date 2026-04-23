import { workerHelloResponse } from "./controllers/health-controller.js";
import { handleWorkerProjectProxy } from "./controllers/proxy-controller.js";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return workerHelloResponse();
    }

    return handleWorkerProjectProxy(request);
  },
};
