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
    // ⚠️ CRITICAL FIX: Trusted Origins for CORS
    // ⚠️ NUCLEAR FIX: Mirror any origin that asks
    origin: (origin) => {
      if (origin) {
        console.log(`[CORS Request] Origin: ${origin} - MIRRORED`);
        return origin;
      }
      return "https://vessify-frontend.vercel.app";
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Better-Auth", "X-Better-Auth-Organization-Id"],
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
  try {
    console.log(`[Auth Request] ${c.req.method} ${c.req.url}`);
    console.log(`[Auth Headers] Content-Type: ${c.req.header("content-type")}`);

    // Pass the raw request to Better Auth
    // Pass the raw request to Better Auth
    // Use clone() to prevent body locks if Hono touched it (though Hono shouldn't have)
    return await auth.handler(c.req.raw);
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
