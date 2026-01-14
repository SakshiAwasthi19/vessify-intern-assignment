import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { Readable } from "stream";
import request from "supertest";
import { app } from "../src/app";

// Helper: adapt Hono's Fetch-style handler to Node http for supertest
const toNodeHandler = (honoApp: typeof app) => {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = `http://localhost${req.url}`;
    const method = req.method || "GET";

    // Only stream body for non-GET/HEAD
    const body =
      method === "GET" || method === "HEAD" ? undefined : Readable.from(req);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "undefined") continue;
      if (Array.isArray(value)) {
        // Cookies should be '; ' separated. Most other headers can be comma-separated.
        headers.set(key, key.toLowerCase() === "cookie" ? value.join("; ") : value.join(", "));
      } else {
        headers.set(key, value);
      }
    }

    const fetchRequest = new Request(url, {
      method,
      headers,
      body: body as any,
      // Node.js requires duplex when streaming request bodies
      ...(body ? { duplex: "half" as const } : {}),
    });

    const response = await honoApp.fetch(fetchRequest);

    res.statusCode = response.status;
    // Forward headers. NOTE: Set-Cookie is special in Fetch/Undici.
    const anyHeaders = response.headers as any;
    const setCookies: string[] | undefined =
      typeof anyHeaders.getSetCookie === "function" ? anyHeaders.getSetCookie() : undefined;

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return; // handled separately
      res.setHeader(key, value);
    });

    if (setCookies && setCookies.length > 0) {
      res.setHeader("Set-Cookie", setCookies);
    } else {
      const single = response.headers.get("set-cookie");
      if (single) res.setHeader("Set-Cookie", single);
    }
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  };
};

describe("Auth flows", () => {
  let server: Server;
  const uniqueId = Date.now();
  const email = `testuser+${uniqueId}@example.com`;
  const password = "Password123!";
  const name = "Test User";

  beforeAll(async () => {
    // Minimal env for Better Auth
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "test-secret-key";
    process.env.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    server = createServer(toNodeHandler(app));
    await new Promise<void>((resolve) => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  test("User registration with valid email/password", async () => {
    const res = await request(server)
      .post("/api/auth/sign-up/email")
      .send({ email, password, name })
      .set("Content-Type", "application/json");

    expect(res.status).toBeLessThan(400);
    expect(res.body).toBeDefined();
  });

  test("User login returns JWT token", async () => {
    // Login
    const loginRes = await request(server)
      .post("/api/auth/sign-in/email")
      .send({ email, password })
      .set("Content-Type", "application/json");

    expect(loginRes.status).toBeLessThan(400);

    // Prefer token from login response (if Better Auth returns it)
    const tokenFromBody =
      loginRes.body?.token ||
      loginRes.body?.session?.token ||
      loginRes.body?.data?.token ||
      loginRes.body?.data?.session?.token;

    if (typeof tokenFromBody === "string" && tokenFromBody.includes(".")) {
      expect(tokenFromBody.length).toBeGreaterThan(50);
      return;
    }

    // Fallback: Fetch JWT token via the token helper endpoint (cookie-based)
    const rawCookies = loginRes.headers["set-cookie"];
    const setCookieLines = Array.isArray(rawCookies)
      ? rawCookies
      : rawCookies
      ? [rawCookies]
      : [];

    expect(setCookieLines.length).toBeGreaterThan(0);

    // Convert Set-Cookie headers to a single Cookie header: "name=value; name2=value2"
    const cookieHeader = setCookieLines
      .map((c) => c.split(";")[0])
      .filter(Boolean)
      .join("; ");

    const tokenRes = await request(server)
      .get("/api/auth/token")
      .set("Cookie", cookieHeader);

    expect(tokenRes.status).toBe(200);
    expect(tokenRes.body?.token).toBeDefined();
    expect(typeof tokenRes.body.token).toBe("string");
    expect(tokenRes.body.token.includes(".")).toBe(true); // looks like JWT
  });

  test("Invalid login credentials fail", async () => {
    const res = await request(server)
      .post("/api/auth/sign-in/email")
      .send({ email, password: "wrong-password" })
      .set("Content-Type", "application/json");

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("Protected route rejects request without token", async () => {
    const res = await request(server).get("/api/transactions?limit=1");
    expect(res.status).toBe(401);
  });
});
