import express from "express";
import { sendExpressHello } from "./controllers/health-controller.js";
import { handleExpressProjectProxy } from "./controllers/proxy-controller.js";

export function createApp() {
  const app = express();

  app.use(express.raw({ type: "*/*", limit: "10mb" }));

  app.get("/", (_request, response) => {
    sendExpressHello(response);
  });

  app.all("/:project", handleExpressProjectProxy);
  app.all("/:project/*", async (request, response) => {
    return handleExpressProjectProxy(request, response);
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Not Found" });
  });

  return app;
}

export const app = createApp();
