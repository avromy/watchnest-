import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: vi.fn() }),
}));
import { handle } from "./product";
afterEach(() => vi.unstubAllEnvs());
describe("API fail closed", () => {
  it("reports configuration absence without production sample data", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const r = await handle(new Request("https://test.local/api/session"), [
      "session",
    ]);
    expect(await r.json()).toEqual({ role: null, configured: false });
  });
  it("blocks cross-site writes before any database access", async () => {
    const r = await handle(
      new Request("https://test.local/api/parent/videos", {
        method: "DELETE",
        headers: { origin: "https://evil.test" },
        body: "{}",
      }),
      ["parent", "videos"],
    );
    expect(r.status).toBe(403);
  });
  it("protected APIs fail closed when infrastructure is absent", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const r = await handle(
      new Request("https://test.local/api/child/library"),
      ["child", "library"],
    );
    expect(r.status).toBe(503);
    expect(await r.json()).toHaveProperty("error");
  });
  it("rejects payloads beyond bounded size even without content-length", async () => {
    const r = await handle(
      new Request("https://test.local/api/auth/child", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({ text: "x".repeat(33000) }),
      }),
      ["auth", "child"],
    );
    expect(r.status).toBe(413);
  });
  it("never accepts a profile ID instead of authentication", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "dummy");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "dummy");
    const r = await handle(
      new Request(
        "https://test.local/api/child/player?videoId=11111111-1111-4111-8111-111111111111&profileId=22222222-2222-4222-8222-222222222222",
      ),
      ["child", "player"],
    );
    expect(r.status).toBe(401);
  });
});
