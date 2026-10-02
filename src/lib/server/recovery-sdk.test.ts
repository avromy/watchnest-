import { afterEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ cookies: [] as any[] }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: (...args: any[]) => state.cookies.push(args),
  }),
}));
// Keep auth-js real: a controlled HTTP transport makes an accidental setSession
// regression observable even if an unexpired access token is supplied.
vi.mock("@supabase/supabase-js", async (importOriginal) => {
  const sdk = await importOriginal<typeof import("@supabase/supabase-js")>();
  return {
    ...sdk,
    createClient: (url: string, key: string, options: any) =>
      sdk.createClient(url, key, {
        ...options,
        global: { fetch: (...args: any[]) => fetch(args[0], args[1]) },
      }),
  };
});
import { handle } from "./product";
function token(subject: string) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: subject, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
}
const founderToken = token("founder");
const refreshedToken = token("refreshed-founder");
afterEach(() => {
  state.cookies = [];
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it.each(["valid", "invalid", "different-identity"])(
  "real auth-js recovery callback verifies refresh HTTP grant: %s",
  async (mode) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-key");
    const requests: { path: string; body: any }[] = [];
    const user = (id = "founder") => ({
      id,
      email: "avromy@gmail.com",
      email_confirmed_at: "2026-09-30",
      aud: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: "2026-09-30",
    });
    const json = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        const body = init?.body ? JSON.parse(String(init.body)) : null;
        requests.push({ path: url.pathname + url.search, body });
        if (url.pathname === "/auth/v1/token") {
          if (mode === "invalid")
            return json(
              {
                error: "invalid_grant",
                error_description: "Invalid refresh token",
                code: "refresh_token_not_found",
              },
              400,
            );
          return json({
            access_token: refreshedToken,
            refresh_token: "rotated-private-refresh",
            expires_in: 3600,
            token_type: "bearer",
            user: user(
              mode === "different-identity" ? "other-family" : "founder",
            ),
          });
        }
        if (url.pathname === "/auth/v1/user") {
          const bearer = new Headers(init?.headers).get("authorization");
          return json(
            user(
              mode === "different-identity" &&
                bearer === `Bearer ${refreshedToken}`
                ? "other-family"
                : "founder",
            ),
          );
        }
        if (url.pathname === "/rest/v1/rpc/wn_rate_limit") return json(true);
        if (url.pathname === "/rest/v1/parents")
          return json({
            id: "family",
            auth_user_id: "founder",
            email: "avromy@gmail.com",
          });
        if (url.pathname === "/rest/v1/profiles") return json([]);
        if (url.pathname === "/rest/v1/household_devices") return json(null);
        throw Error("Unexpected controlled HTTP route");
      }),
    );
    const response = await handle(
      new Request("https://test.local/api/auth/callback", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          type: "recovery",
          access_token: founderToken,
          refresh_token: "supplied-refresh-token",
        }),
      }),
      ["auth", "callback"],
    );
    expect(requests.filter((r) => r.path.startsWith("/auth/v1/token"))).toEqual(
      [
        {
          path: "/auth/v1/token?grant_type=refresh_token",
          body: { refresh_token: "supplied-refresh-token" },
        },
      ],
    );
    if (mode === "valid") {
      expect(response.status).toBe(200);
      expect(state.cookies).toContainEqual([
        "wn_parent",
        refreshedToken,
        expect.objectContaining({ httpOnly: true }),
      ]);
      expect(state.cookies).toContainEqual([
        "wn_refresh",
        "rotated-private-refresh",
        expect.objectContaining({ httpOnly: true }),
      ]);
    } else {
      expect(response.status).toBe(401);
      expect(state.cookies).toEqual([]);
      expect(requests.some((r) => r.path.startsWith("/rest/v1/parents"))).toBe(
        false,
      );
    }
  },
);
