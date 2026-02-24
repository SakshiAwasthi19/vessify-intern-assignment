// backend/src/app.ts
import { Hono } from "hono";
import { auth } from "./lib/auth";
import transactionRoutes from "./routes/transactions.routes";
import authRoutes from "./routes/auth.routes";

export const app = new Hono();

// 🚀 VERSION TAG FOR DEPLOYMENT VERIFICATION
const DEPLOY_VERSION = "1.0.6-manual-cors-fix";

// ⚠️ DEFINITIVE MANUAL CORS MIDDLEWARE
// We handle this manually because Hono's plugin might be bypassed by Better Auth's raw responses.
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");

  // Set headers for the current request context
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
  }

  // Handle Internal Preflight (OPTIONS)
  if (c.req.method === "OPTIONS") {
    return c.text("", 204 as any, {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Better-Auth, X-Better-Auth-Organization-Id",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    });
  }

  await next();

  // After next(), ensure headers are still present on the response
  if (origin) {
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }
});

app.get("/", (c) =>
  c.json({
    message: "Vessify Backend API",
    status: "running",
    version: DEPLOY_VERSION,
  })
);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    version: DEPLOY_VERSION,
    timestamp: new Date().toISOString(),
  })
);

// Better Auth
app.route("/api/auth", authRoutes);

app.all("/api/auth/*", async (c) => {
  try {
    // Pass the raw request to Better Auth
    const res = await auth.handler(c.req.raw);

    // Better Auth returns a RAW Web Response. 
    // We MUST clone it and inject headers because Hono's middleware only 
    // affects the Hono context, not returnable raw Responses.
    const origin = c.req.header("Origin") || "https://vessify-frontend.vercel.app";
    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", origin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");

    // Force OPTIONS logic here too just in case
    if (c.req.method === "OPTIONS") {
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Better-Auth, X-Better-Auth-Organization-Id");
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    console.error("Better Auth handler error:", error);
    return c.json({ error: "Authentication error", details: String(error) }, 500);
  }
});

// Transactions
app.route("/api/transactions", transactionRoutes);
