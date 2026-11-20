import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  written: [] as [string, string, unknown][],
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      state.jar.has(name) ? { value: state.jar.get(name)! } : undefined,
    set: (name: string, value: string, options: unknown) => {
      state.jar.set(name, value);
      state.written.push([name, value, options]);
    },
  }),
}));
// Keep real supabase-js/auth-js session state and fetchWithAuth. Transport alone
// is controlled: test fixtures never contact hosted auth or database services.
vi.mock("@supabase/supabase-js", async (original) => {
  const sdk = await original<typeof import("@supabase/supabase-js")>();
  return {
    ...sdk,
    createClient: (url: string, key: string, options: any) =>
      sdk.createClient(url, key, {
        ...options,
        global: {
          ...options?.global,
          fetch: (...args: any[]) => fetch(args[0], args[1]),
        },
      }),
  };
});
import { handle } from "./product";

const service = "synthetic-service-role-key";
function token(sub: string) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}.synthetic`;
}
const fresh = token("synthetic-founder");
const user = {
  id: "synthetic-founder",
  email: "founder@example.invalid",
  email_confirmed_at: "2026-01-01",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => {
  state.jar.clear();
  state.written = [];
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic-anon-key");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", service);
  vi.stubEnv("FOUNDER_EMAIL", user.email);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("real SDK: refreshed parent uses service authority for family REST and rotates cookies", async () => {
  state.jar.set("wn_parent", "expired-synthetic-access");
  state.jar.set("wn_refresh", "synthetic-refresh");
  state.jar.set("wn_device", "synthetic-device");
  const restHeaders: { path: string; service: boolean }[] = [];
  let grants = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const bearer = new Headers(init?.headers).get("authorization");
      if (url.pathname === "/auth/v1/token") {
        grants++;
        return json({
          access_token: fresh,
          refresh_token: "rotated-synthetic-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user,
        });
      }
      if (url.pathname === "/auth/v1/user")
        return bearer === `Bearer ${fresh}`
          ? json(user)
          : json({ msg: "expired", code: "bad_jwt" }, 401);
      if (url.pathname.startsWith("/rest/v1/")) {
        const elevated = bearer === `Bearer ${service}`;
        restHeaders.push({ path: url.pathname, service: elevated });
        // Model existing grants: authenticated/anon cannot read these tables.
        if (!elevated)
          return json({ code: "42501", message: "permission denied" }, 403);
        if (url.pathname === "/rest/v1/parents")
          return json({
            id: "synthetic-family",
            auth_user_id: user.id,
            email: user.email,
          });
        if (url.pathname === "/rest/v1/household_devices")
          return json(
            init?.method === "PATCH"
              ? null
              : { id: "synthetic-device-id", parent_id: "synthetic-family" },
          );
      }
      throw new Error(`Unexpected controlled path: ${url.pathname}`);
    }),
  );
  const response = await handle(new Request("https://test.local/api/session"), [
    "session",
  ]);
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    role: "parent",
    configured: true,
  });
  expect(grants).toBe(1);
  expect(restHeaders.length).toBeGreaterThan(0);
  expect(restHeaders.every((call) => call.service)).toBe(true);
  expect(
    state.written.some(
      ([name, value]) => name === "wn_parent" && value === fresh,
    ),
  ).toBe(true);
  expect(
    state.written.some(
      ([name, value]) =>
        name === "wn_refresh" && value === "rotated-synthetic-refresh",
    ),
  ).toBe(true);
});

it("real SDK: session dependency outage is 503 rather than anonymous role downgrade", async () => {
  state.jar.set("wn_parent", fresh);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/v1/user") return json(user);
      if (url.pathname === "/rest/v1/parents")
        return json(
          { code: "08006", message: "synthetic database outage" },
          503,
        );
      throw new Error(`Unexpected controlled path: ${url.pathname}`);
    }),
  );
  const response = await handle(new Request("https://test.local/api/session"), [
    "session",
  ]);
  expect(response.status).toBe(503);
  const body = await response.json();
  expect(body).toHaveProperty("error");
  expect(body).not.toHaveProperty("role");
  expect(JSON.stringify(body)).not.toContain("synthetic database outage");
});

it.each(["provider-503", "network-failure"])(
  "real SDK: transient auth %s is 503 rather than anonymous downgrade",
  async (kind) => {
    state.jar.set("wn_parent", fresh);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = new URL(String(input));
        if (url.pathname === "/auth/v1/user") {
          if (kind === "network-failure")
            throw new TypeError("synthetic auth network unavailable");
          return json({ msg: "synthetic auth temporarily unavailable" }, 503);
        }
        throw new Error(`Unexpected controlled path: ${url.pathname}`);
      }),
    );
    const response = await handle(
      new Request("https://test.local/api/session"),
      ["session"],
    );
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body).not.toHaveProperty("role");
    expect(JSON.stringify(body)).not.toContain("synthetic auth");
  },
);
