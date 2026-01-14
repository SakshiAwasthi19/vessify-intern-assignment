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
    origin: "http://localhost:3000",
    credentials: true,
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
    return await auth.handler(c.req.raw);
  } catch (error) {
    console.error("Better Auth handler error:", error);
    return c.json({ error: "Authentication error" }, 500);
  }
});

// Transactions
app.route("/api/transactions", transactionRoutes);
