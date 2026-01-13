# STEP 1: Schema + Auth Foundation - CORRECTIONS

## ✅ DELIVERABLE 1: Corrected Prisma Schema

**File:** `backend/prisma/schema.prisma`

### Key Changes:
1. ✅ **Added `password` field to User model** - Required for email+password auth
2. ✅ **Removed `Account` table** - Not using OAuth providers
3. ✅ **Removed `Session` table** - Using JWT tokens, not database sessions
4. ✅ **Removed `VerificationToken` table** - Not needed for MVP
5. ✅ **Kept User, Organization, Membership, Transaction** - Core tables

### Important Fields:
- `User.password`: Stores hashed password (Better Auth handles hashing)
- `Transaction.userId`: For data isolation (who created it)
- `Transaction.organizationId`: For multi-tenancy (which org it belongs to)
- **Indexes**: Critical for performance, especially the composite index for cursor pagination

---

## ✅ DELIVERABLE 2: Confirmed Package Names

### Backend:
```bash
npm install better-auth
```

### Frontend:
```bash
npm install @better-auth/react
```

### ❌ DO NOT USE:
- `next-auth` (NextAuth.js)
- `@auth/nextjs` (Auth.js v5)
- `@auth/core` (Auth.js core)

**Only use Better Auth packages!**

---

## ✅ DELIVERABLE 3: Better Auth Configuration

**File:** `backend/src/lib/auth.ts`

### Features Configured:
1. ✅ **Email + Password Authentication** - `emailAndPassword.enabled: true`
2. ✅ **JWT Tokens with 7-day expiry** - `session.expiresIn: 604800` (7 days in seconds)
3. ✅ **Organizations Plugin** - Enables multi-tenancy
4. ✅ **Prisma Adapter** - Connects to your database
5. ✅ **Secret Key Management** - Uses `BETTER_AUTH_SECRET` from environment

### Environment Variables Required:
See `backend/.env.example` for complete list:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for JWT signing (min 32 characters)
- `BACKEND_URL` - Your backend server URL
- `FRONTEND_URL` - Your frontend URL (for CORS)

### How Organizations Work:
- When a user registers, Better Auth's `organization` plugin automatically:
  1. Creates an organization (default name: "Personal")
  2. Creates a membership linking user to organization
  3. Sets user as "owner" of the organization
- The organization ID is included in the JWT token payload
- Users can belong to multiple organizations (via `memberships` table)

---

## ✅ DELIVERABLE 4: Authentication Middleware

**File:** `backend/src/middleware/auth.ts`

### How It Works:

1. **Extracts JWT Token:**
   ```typescript
   const authHeader = c.req.header("Authorization");
   const token = authHeader.substring(7); // Remove "Bearer " prefix
   ```

2. **Verifies Token with Better Auth:**
   ```typescript
   const session = await auth.api.getSession({
     headers: { authorization: `Bearer ${token}` }
   });
   ```
   - Better Auth verifies the JWT signature
   - Checks if token is expired
   - Returns session data if valid

3. **Extracts userId and organizationId:**
   ```typescript
   const userId = session.user.id;
   const organizationId = session.organization.id; // From Better Auth's organization plugin
   ```

4. **Attaches to Context:**
   ```typescript
   c.set("userId", userId);
   c.set("organizationId", organizationId);
   ```
   - Route handlers can access via `c.get("userId")`
   - Route handlers can access via `c.get("organizationId")`

### Usage in Routes:
```typescript
import { authMiddleware } from "./middleware/auth";

app.use("/api/transactions/*", authMiddleware);

app.get("/api/transactions", async (c) => {
  const userId = c.get("userId"); // From JWT, not from request!
  const orgId = c.get("organizationId"); // From JWT, not from request!
  
  // Query database with userId and orgId for data isolation
  const transactions = await db.transaction.findMany({
    where: {
      userId: userId,        // From JWT
      organizationId: orgId  // From JWT
    }
  });
  
  return c.json({ transactions });
});
```

### Security Notes:
- ✅ **Never trusts request parameters** - userId/orgId come from JWT only
- ✅ **Validates token on every request** - Middleware runs before route handlers
- ✅ **Returns 401 if token invalid** - Prevents unauthorized access
- ✅ **Handles missing organization gracefully** - Falls back to user's first org

---

## 🔍 ANSWERS TO YOUR QUESTIONS

### Q1: Does Better Auth's organizations plugin auto-create tables?

**Answer:** 
- Better Auth's `organization` plugin **does NOT** auto-create Prisma tables
- **You must define** `Organization` and `Membership` tables in your Prisma schema (which we've done)
- The plugin provides the **logic** (creating orgs, managing memberships) but uses **your schema**
- After defining the schema, run `npx prisma migrate dev` to create the tables

### Q2: How does organizationId get included in JWT payload?

**Answer:**
- When a user logs in, Better Auth's organization plugin:
  1. Finds the user's active/default organization
  2. Includes `organizationId` in the JWT token payload
  3. The JWT contains: `{ userId, organizationId, email, ... }`
- When you call `auth.api.getSession()`, it returns:
  ```typescript
  {
    user: { id, email, name },
    organization: { id, name, slug } // From organization plugin
  }
  ```

### Q3: Middleware Code (Already Provided)

See `backend/src/middleware/auth.ts` for complete implementation.

---

## 📋 NEXT STEPS

After reviewing these corrections:

1. ✅ Review the corrected Prisma schema
2. ✅ Review the Better Auth configuration
3. ✅ Review the middleware implementation
4. ✅ Set up environment variables (copy `.env.example` to `.env`)

**Then we'll proceed to:**
- Step 2: Install dependencies and set up package.json files
- Step 3: Create database migrations
- Step 4: Implement authentication endpoints
- Step 5: Implement transaction parser
- Step 6: Implement protected API routes
- Step 7: Build frontend pages
- Step 8: Write Jest tests

---

## ⚠️ IMPORTANT NOTES

1. **Password Hashing:** Better Auth automatically hashes passwords (uses bcrypt). You don't need to manually hash.

2. **JWT Expiry:** The 7-day expiry is set in `session.expiresIn: 604800` (seconds). Better Auth handles token refresh automatically.

3. **Organization Creation:** When a user registers, Better Auth's `createOrganization` callback runs automatically. You can customize the default organization name.

4. **TypeScript Types:** Better Auth exports types. Use `typeof auth.$Infer.Session` for session types.

5. **Secret Key:** Generate a strong secret key:
   ```bash
   openssl rand -base64 32
   ```
   Never commit this to git!

---

## ✅ VERIFICATION CHECKLIST

Before moving to Step 2, verify:

- [ ] Prisma schema has `password` field in User model
- [ ] Prisma schema has NO Account, Session, or VerificationToken tables
- [ ] Better Auth config includes `emailAndPassword.enabled: true`
- [ ] Better Auth config includes `session.expiresIn: 604800` (7 days)
- [ ] Better Auth config includes `organization` plugin
- [ ] Middleware extracts userId from JWT (not from request)
- [ ] Middleware extracts organizationId from JWT (not from request)
- [ ] Environment variables are documented in `.env.example`

Ready for Step 2? Let me know! 🚀
