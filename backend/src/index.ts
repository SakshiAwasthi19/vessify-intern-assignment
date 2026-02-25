// backend/src/index.ts
import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

console.log("----------------------------------------");
console.log("🚀 Server Starting [V1.0.9-DIAGNOSTIC]");
console.log("PORT:", port);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("----------------------------------------");

// Standard Hono Node Server startup
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`🚀 Server listening on http://${info.address}:${info.port}`);
  }
);
