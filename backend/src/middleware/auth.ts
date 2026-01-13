import { Context, Next } from "hono";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";

// Extend Hono context
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    organizationId: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get Authorization header
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
    }

    // Verify session using Better Auth
    // Better Auth's getSession expects headers from the request
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    console.log("📋 Session result:", session ? "Valid" : "Invalid"); // Debug log

    if (!session || !session.user) {
      console.error("❌ Session validation failed");
      return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
    }

    const userId = session.user.id;
    console.log("✅ User ID from session:", userId); // Debug log

    // Get user's organization from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
    });

    if (!user || !user.memberships || user.memberships.length === 0) {
      console.error("❌ User has no organization");
      return c.json(
        { error: "Unauthorized: User has no organization" },
        401
      );
    }

    const organizationId = user.memberships[0].organizationId;
    console.log("✅ Organization ID:", organizationId); // Debug log

    // Attach to context
    c.set("userId", userId);
    c.set("organizationId", organizationId);
    c.set("user", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    console.log("✅ Auth middleware passed"); // Debug log
    await next();
  } catch (error: any) {
    console.error("❌ Auth middleware error:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 500), // Truncate stack trace
    });
    return c.json({ 
      error: "Unauthorized: Token verification failed",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, 401);
  }
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers
      });

      if (session && session.user) {
        c.set("userId", session.user.id);
        c.set("user", {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });

        // Try to get organization
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            memberships: {
              take: 1,
              orderBy: { createdAt: "asc" }
            },
          },
        });

        if (user?.memberships?.[0]) {
          c.set("organizationId", user.memberships[0].organizationId);
        }
      }
    }
  } catch (error) {
    console.error("Optional auth middleware error:", error);
  }

  await next();
}