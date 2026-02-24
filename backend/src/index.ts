// backend/src/index.ts
import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

console.log("----------------------------------------");
console.log("🚀 Server Starting");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL Loaded:", !!process.env.DATABASE_URL);
console.log("BETTER_AUTH_SECRET Loaded:", !!process.env.BETTER_AUTH_SECRET);
if (process.env.BETTER_AUTH_SECRET) {
  console.log("BETTER_AUTH_SECRET prefix:", process.env.BETTER_AUTH_SECRET.substring(0, 5) + "...");
} else {
  console.error("CRITICAL: BETTER_AUTH_SECRET is MISSING!");
}
console.log("----------------------------------------");

console.log(`🚀 Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
