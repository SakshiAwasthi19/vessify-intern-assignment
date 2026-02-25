import { Hono } from "hono";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";

const authRoutes = new Hono();

/**
 * GET /api/token
 * Get the JWT token for the current session
 * Uses cookies, session ID query param, or Authorization header
 */
authRoutes.get("/token", async (c) => {
  try {
    console.log("🔑 /api/token endpoint called");

    // Get session from Better Auth (works with cookies or Authorization header)
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      console.error("❌ No session found in Better Auth using current headers");

      // Try to extract token from Authorization header manually
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const manualToken = authHeader.substring(7);
        console.log("🛠️ Attempting manual DB session lookup for token:", manualToken.substring(0, 10) + "...");

        const dbSession = await prisma.session.findFirst({
          where: { token: manualToken },
          include: { user: true }
        });

        if (dbSession && dbSession.user) {
          console.log("✅ Found session via manual DB lookup for user:", dbSession.user.id);
          return c.json({
            token: dbSession.token, // This should be the JWT if configured
            expiresAt: dbSession.expiresAt,
          });
        }
      }

      return c.json({ error: "Unauthorized: No active session" }, 401);
    }

    console.log("✅ Session found in Better Auth for user:", session.user.id);

    // Get the session from the database to retrieve the token (JWT)
    const dbSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    if (!dbSession) {
      console.error("❌ No session found in database for user:", session.user.id);
      return c.json({ error: "Token not found for session" }, 404);
    }

    // The token field should contain the JWT (with JWT plugin enabled)
    if (!dbSession.token) {
      console.error("❌ No token field in database session");
      return c.json({ error: "Token not found for session" }, 404);
    }

    // Validate it's a JWT (should be long and contain dots)
    if (dbSession.token.length < 50 || !dbSession.token.includes('.')) {
      console.warn("⚠️ Token in database doesn't look like a JWT:", dbSession.token.substring(0, 30));
      console.warn("⚠️ This might be a session ID. JWT plugin may not be properly configured.");
    }

    console.log("✅ JWT token found in database, length:", dbSession.token.length);

    return c.json({
      token: dbSession.token,
      expiresAt: dbSession.expiresAt,
    });
  } catch (error: any) {
    console.error("❌ Get token error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return c.json({ error: "Failed to get token", details: error?.message }, 500);
  }
});

export default authRoutes;
