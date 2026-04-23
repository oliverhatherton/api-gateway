import express from "express";

export function createApp() {
  const app = express();

  app.get("/", (_request, response) => {
    response.status(200).json({ message: "Hello World!" });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Not Found" });
  });

  return app;
}

export const app = createApp();
