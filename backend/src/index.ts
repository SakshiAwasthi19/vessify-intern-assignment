// backend/src/index.ts
import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

console.log("----------------------------------------");
console.log("🚀 Server Starting [V1.0.7-LOGGING]");
console.log("PORT:", port);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("----------------------------------------");

// Global error handler for the server itself
serve({
  fetch: (req) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    return app.fetch(req);
  },
  port,
}, (info) => {
  console.log(`🚀 Server listening on http://${info.address}:${info.port}`);
});
