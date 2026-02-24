// backend/src/app.ts
import { Hono } from "hono";
import { auth } from "./lib/auth";
import transactionRoutes from "./routes/transactions.routes";
import authRoutes from "./routes/auth.routes";
import { cors } from "hono/cors";

export const app = new Hono();

app.use(
  "*",
  cors({
    /**
     * CORS configuration
     *
     * - Allows localhost for local development
     * - Allows the deployed Vercel frontend
     * - Allows a custom frontend URL via FRONTEND_URL env
     *
     * This MUST include the exact origin you see in the browser
     * devtools (e.g. https://vessify-frontend.vercel.app) otherwise
     * the browser will fail the preflight request and show
     * "No 'Access-Control-Allow-Origin' header is present".
     */
    origin: (origin) => {
      const allowedOrigins = new Set<string>([
        "http://localhost:3000",
        "http://localhost:3001",
        "https://vessify-frontend.vercel.app",
      ]);

      const envFrontend = process.env.FRONTEND_URL;
      if (envFrontend) {
        allowedOrigins.add(envFrontend);
      }

      if (!origin) {
        // Non-browser clients / same-origin requests
        return "https://vessify-frontend.vercel.app";
      }

      if (allowedOrigins.has(origin)) {
        console.log(`[CORS] Allowing origin: ${origin}`);
        return origin;
      }

      // Allow any *.vercel.app frontend (useful for preview deployments)
      if (origin.endsWith(".vercel.app")) {
        console.log(`[CORS] Allowing Vercel origin: ${origin}`);
        return origin;
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      // Returning an empty string means no Access-Control-Allow-Origin header,
      // which causes the browser to block the request.
      return "";
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Better-Auth",
      "X-Better-Auth-Organization-Id",
    ],
    exposeHeaders: ["X-Better-Auth"],
  })
);

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
  const origin = c.req.header("Origin") || "https://vessify-frontend.vercel.app";

  // 1. Manually handle preflight OPTIONS requests for /api/auth/*
  if (c.req.method === "OPTIONS") {
    return c.text("", 204 as any, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Better-Auth, X-Better-Auth-Organization-Id",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    });
  }

  try {
    console.log(`[Auth Request] ${c.req.method} ${c.req.url}`);

    // 2. Wrap the Better Auth handler to ensure CORS headers are preserved
    const res = await auth.handler(c.req.raw);

    // Create a new response with the same body and headers, but force CORS headers
    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", origin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Better-Auth, X-Better-Auth-Organization-Id");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    console.error("Better Auth handler error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json({ error: "Authentication error", details: String(error) }, 500);
  }
});

// Transactions
app.route("/api/transactions", transactionRoutes);
