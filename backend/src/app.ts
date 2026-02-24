// backend/src/app.ts
import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import transactionRoutes from "./routes/transactions.routes";
import authRoutes from "./routes/auth.routes";

export const app = new Hono();

// VERSION FOR VERIFICATION
const VERSION = "1.0.8-FINAL-ROUTING-FIX";

// 1. CLEAN & CORRECT CORS
app.use(
  "*",
  cors({
    origin: "https://vessify-frontend.vercel.app",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Better-Auth",
      "X-Better-Auth-Organization-Id",
    ],
    credentials: true,
  })
);

// 2. DIAGNOSTICS (Must be high up)
app.get("/", (c) =>
  c.json({
    message: "Vessify Backend API",
    status: "running",
    version: VERSION,
  })
);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    version: VERSION,
    timestamp: new Date().toISOString(),
  })
);

// 3. AUTH ROUTES
// Custom JWT auth routes (like /api/token)
app.route("/api/auth", authRoutes);

// Better Auth catch-all (Must be after specific authRoutes)
app.all("/api/auth/*", async (c) => {
  try {
    console.log(`[AUTH] ${c.req.method} ${c.req.url}`);
    const res = await auth.handler(c.req.raw);
    return res;
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return c.json({ error: "Authentication error", details: String(error) }, 500);
  }
});

// 4. BUSINESS ROUTES
app.route("/api/transactions", transactionRoutes);

// 5. 404 HANDLER
app.notFound((c) => {
  console.log(`[404] No route for ${c.req.method} ${c.req.url}`);
  return c.json({ error: "Route not found", path: c.req.path }, 404);
});
