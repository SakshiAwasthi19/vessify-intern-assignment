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
      console.error("❌ Missing or invalid Authorization header");
      return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("🔑 Token received, length:", token.length, "prefix:", token.substring(0, 20) + "...");

    // Try to verify session using Better Auth
    // Better Auth's getSession should work with Authorization header when JWT plugin is enabled
    let session;
    try {
      session = await auth.api.getSession({
        headers: c.req.raw.headers
      });
      console.log("📋 Better Auth getSession result:", session ? "Valid" : "Invalid");
    } catch (sessionError: any) {
      console.error("❌ Better Auth getSession error:", {
        message: sessionError?.message,
        name: sessionError?.name,
      });
      // Continue to manual JWT verification as fallback
      session = null;
    }

    // If Better Auth's getSession doesn't work, manually verify JWT
    if (!session || !session.user) {
      console.log("⚠️ Better Auth getSession failed, trying manual JWT verification...");

      try {
        // Manually decode JWT to get user info
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.log("ℹ️ Token is not a JWT format, falling back to session ID lookup");
          throw new Error("NOT_A_JWT");
        }

        // Decode payload (base64url)
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          console.log("📋 Decoded JWT payload:", {
            id: payload.id,
            email: payload.email,
            exp: payload.exp,
            expDate: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
          });

          // Check expiration
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.error("❌ JWT token expired");
            return c.json({ error: "Unauthorized: Token expired" }, 401);
          }

          // Use payload data as session data
          session = {
            user: {
              id: payload.id || payload.sub,
              email: payload.email,
              name: payload.name,
            },
            session: {
              expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
            },
          };

          console.log("✅ Manual JWT verification successful");
        } catch (e) {
          console.error("❌ JWT parse error, falling back to session ID lookup");
          throw new Error("NOT_A_JWT");
        }
      } catch (jwtError: any) {
        console.log("🛠️ Attempting manual Session ID lookup in database...");

        // Lookup session in DB by id OR token
        const dbSession = await prisma.session.findFirst({
          where: {
            OR: [
              { id: token },
              { token: token }
            ]
          },
          include: { user: true }
        });

        if (dbSession && dbSession.user) {
          console.log("✅ Manual session lookup successful for user:", dbSession.user.id);
          session = {
            user: dbSession.user,
            session: {
              expiresAt: dbSession.expiresAt
            }
          };
        } else {
          console.error("❌ Manual session lookup failed");
          return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
        }
      }
    }

    if (!session || !session.user) {
      console.error("❌ Session validation failed - no user in session");
      return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
    }

    let userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    console.log("✅ User ID from session:", userId);
    console.log("📧 User email from session:", userEmail);

    // 🔧 CRITICAL FIX: If Better Auth session is valid, ensure user exists in database
    // Better Auth with JWT can have valid sessions even if user record is missing
    // We need to create the user if they don't exist (trust Better Auth's session validation)

    let user = await prisma.user.findUnique({
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

    // If user doesn't exist, create them (Better Auth validated the session, so trust it)
    if (!user) {
      console.log("⚠️ User not found in database, creating from session...");
      console.log("📋 User data to create:", { userId, userEmail, userName });

      try {
        // Create user and organization in a single transaction
        const result = await prisma.$transaction(async (tx: any) => {
          // Create user
          console.log("📝 Creating user in database...");
          const newUser = await tx.user.create({
            data: {
              id: userId, // Use the ID from Better Auth session
              email: userEmail || `user-${userId}@temp.com`,
              name: userName || null,
              emailVerified: false,
            },
          });
          console.log("✅ User created:", newUser.id);

          // Create organization
          console.log("📝 Creating organization...");
          const organization = await tx.organization.create({
            data: {
              name: "Personal",
              slug: `personal-${userId.substring(0, 8)}-${Date.now()}`,
            },
          });
          console.log("✅ Organization created:", organization.id);

          // Create membership
          console.log("📝 Creating membership...");
          await tx.organizationMember.create({
            data: {
              userId: userId,
              organizationId: organization.id,
              role: "owner",
            },
          });
          console.log("✅ Membership created");

          return { user: newUser, organization };
        });

        console.log("✅ Created user and organization:", {
          userId: result.user.id,
          orgId: result.organization.id
        });

        // Re-fetch user with membership
        user = await prisma.user.findUnique({
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
      } catch (createError: any) {
        console.error("❌ Failed to create user from session:", {
          message: createError?.message,
          code: createError?.code,
          meta: createError?.meta,
          stack: createError?.stack?.substring(0, 300),
        });

        // If user already exists (race condition), try to fetch again
        if (createError?.code === "P2002") {
          console.log("⚠️ User already exists (race condition), fetching...");
          user = await prisma.user.findUnique({
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
        } else {
          return c.json(
            {
              error: "Unauthorized: Failed to initialize user",
              details: process.env.NODE_ENV === 'development'
                ? `${createError?.message} (code: ${createError?.code})`
                : undefined
            },
            401
          );
        }
      }
    }

    // 🔧 FIX: Auto-create organization if user doesn't have one
    // This handles edge cases where users were created before organization plugin was configured
    if (!user || !user.memberships || user.memberships.length === 0) {
      console.log("⚠️ User has no organization, creating one automatically...");

      try {
        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx: any) => {
          // 1. Ensure User Exists (Double Check inside Transaction)
          let txUser = await tx.user.findUnique({ where: { id: userId } });

          if (!txUser) {
            console.log("⚠️ User missing inside transaction, checking by email...");

            // Check if user exists by email (to avoid P2002 Unique Constraint violation)
            if (userEmail) {
              const existingUserByEmail = await tx.user.findUnique({ where: { email: userEmail } });
              if (existingUserByEmail) {
                console.log("✅ Found user by email, using existing user:", existingUserByEmail.id);
                txUser = existingUserByEmail;
              }
            }

            // If still no user, create one
            if (!txUser) {
              console.log("📝 Creating new user...");
              txUser = await tx.user.create({
                data: {
                  id: userId,
                  email: userEmail || `user-${userId}@temp.config`,
                  name: userName,
                  emailVerified: false
                }
              });
            }
          }

          // 2. Create a "Personal" organization for the user
          // Check if user already has an organization to avoid duplicates in this race condition
          const existingMember = await tx.organizationMember.findFirst({
            where: { userId: txUser.id },
            include: { organization: true }
          });

          if (existingMember) {
            console.log("✅ User already has an organization, skipping creation");
            return { organization: existingMember.organization, user: txUser };
          }

          console.log("📝 Creating new organization for user:", txUser.id);
          const organization = await tx.organization.create({
            data: {
              name: "Personal",
              slug: `personal-${txUser.id.substring(0, 8)}-${Date.now()}`,
            },
          });

          // 3. Create membership linking user to organization
          await tx.organizationMember.create({
            data: {
              userId: txUser.id, // Use the confirmed user ID
              organizationId: organization.id,
              role: "owner",
            },
          });

          return { organization, user: txUser };
        });

        console.log("✅ Created/Verified organization for user:", result.user.id);

        // Update userId in case it changed (e.g. found by email with different ID)
        if (userId !== result.user.id) {
          console.log(`⚠️ Updating userId from ${userId} to ${result.user.id} (found by email)`);
          userId = result.user.id;
        }

        // Re-fetch user with the new membership using the CORRECT userId
        user = await prisma.user.findUnique({
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
      } catch (txError: any) {
        console.error("❌ Failed to create organization:", {
          message: txError?.message,
          code: txError?.code,
          meta: txError?.meta,
        });

        throw txError; // Re-throw to be caught by outer catch
      }
    }

    // Ensure we have a valid organization at this point
    if (!user || !user.memberships || user.memberships.length === 0) {
      console.error("❌ Failed to create organization for user");
      return c.json(
        { error: "Unauthorized: Failed to initialize user organization" },
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