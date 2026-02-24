// backend/src/app.ts
import { Hono } from "hono";
import { auth } from "./lib/auth";
import transactionRoutes from "./routes/transactions.routes";
import authRoutes from "./routes/auth.routes";
import { cors } from "hono/cors";

export const app = new Hono();

// ⚠️ NUCLEAR CORS FIX: Manual middleware to ensure headers are ALWAYS present
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin") || "https://vessify-frontend.vercel.app";

  // 1. Handle Preflight (OPTIONS)
  if (c.req.method === "OPTIONS") {
    console.log(`[CORS OPTIONS] Request from: ${origin}`);
    return c.text("", 204 as any, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Better-Auth, X-Better-Auth-Organization-Id",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    });
  }

  // 2. Add headers to regular responses
  // Use c.res.headers.set to ensure they are present even if downstream modifies the response
  c.res.headers.set("Access-Control-Allow-Origin", origin);
  c.res.headers.set("Access-Control-Allow-Credentials", "true");

  await next();
});

app.get("/", (c) =>
  c.json({
    message: "Vessify Backend API",
    status: "running",
  })
);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

// Better Auth
// Custom JWT auth routes (must be under /api/auth so auth cookies (Path=/api/auth) are sent)
app.route("/api/auth", authRoutes);

app.all("/api/auth/*", async (c) => {
  try {
    const res = await auth.handler(c.req.raw);

    // Better Auth returns a RAW response. We wrap it to ensure CORS headers 
    // set in our global middleware are preserved in the final output.
    const origin = c.req.header("Origin") || "https://vessify-frontend.vercel.app";
    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", origin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    return c.json({ error: "Authentication error", details: String(error) }, 500);
  }
});

// Transactions
app.route("/api/transactions", transactionRoutes);
