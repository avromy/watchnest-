import assert from "node:assert/strict";
import { randomBytes, randomInt } from "node:crypto";
import { readFileSync, unlinkSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, expect } from "@playwright/test";
import { browserRuntime } from "../browser-runtime.mjs";

const connection = JSON.parse(readFileSync(process.argv[2], "utf8"));
unlinkSync(process.argv[2]);
const api = new URL(connection.API_URL);
const db = new URL(connection.DB_URL);
const mail = new URL(connection.MAILPIT_URL ?? connection.INBUCKET_URL);
for (const url of [api, db, mail]) {
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname), "Expected runner-local services");
}
assert.equal(db.port, "54322");
assert.ok(connection.SERVICE_ROLE_KEY && connection.ANON_KEY);
const origin = "http://localhost:3000";
const email = "watchnest-qa@example.test";
const password = randomBytes(24).toString("base64url");
const pin = String(randomInt(1000, 10000));
const appEnv = {
  ...process.env, FOUNDER_EMAIL: email, NEXT_PUBLIC_APP_URL: origin,
  NEXT_PUBLIC_SUPABASE_URL: api.origin, NEXT_PUBLIC_SUPABASE_ANON_KEY: connection.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: connection.SERVICE_ROLE_KEY, YOUTUBE_API_KEY: "",
};

function sql(statement) {
  return execFileSync("psql", ["-X", "-Atq", "-v", "ON_ERROR_STOP=1", "-c", statement], {
    env: { PATH: process.env.PATH, PGHOST: db.hostname, PGPORT: db.port,
      PGDATABASE: db.pathname.slice(1), PGUSER: db.username, PGPASSWORD: db.password },
    encoding: "utf8",
  }).trim();
}
assert.equal(sql("select count(*) from auth.users"), "0");
assert.equal(sql("select count(*) from public.parents"), "0");
assert.equal(sql("select count(*) from public.profiles"), "0");
assert.equal(sql("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity"), "0");
assert.equal(sql("select has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute') from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='wn_admit_device_child_session'"), "f");
console.log("PASS fresh synthetic database, RLS and admission grants");

execFileSync("npm", ["run", "build"], { env: appEnv, stdio: "inherit" });
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "localhost"], {
  env: appEnv, stdio: "ignore",
});
let browser;
try {
  await expect.poll(async () => fetch(origin + "/login").then(r => r.status).catch(() => 0), { timeout: 45000 }).toBe(200);
  const signup = await fetch(origin + "/api/auth/parent", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ action: "signup", email, password }),
  });
  assert.equal(signup.status, 200, "ordinary signup");
  let message;
  await expect.poll(async () => {
    const inbox = await fetch(new URL("/api/v1/messages", mail)).then(r => r.json());
    message = inbox.messages.find(m => m.To?.some(t => t.Address === email));
    return Boolean(message);
  }, { timeout: 15000 }).toBe(true);
  const body = await fetch(new URL("/api/v1/message/" + encodeURIComponent(message.ID), mail)).then(r => r.json());
  const verify = (body.Text ?? "").match(/https?:\/\/[^\s<>]+\/auth\/v1\/verify\?[^\s<>]+/)?.[0]
    ?? body.HTML?.match(/href="([^"]+\/auth\/v1\/verify\?[^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.ok(verify, "missing local confirmation link");
  const url = new URL(verify);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname) && url.port === api.port);
  const confirmation = await fetch(url, { redirect: "manual" });
  assert.ok([302, 303].includes(confirmation.status), "confirmation response");
  browser = await chromium.launch({ executablePath: await browserRuntime(), args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 } });
  await page.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  async function call(path, method = "GET", data, device = page) {
    const res = await device.request.fetch(origin + "/api/" + path, {
      method, data, headers: { Origin: origin }, maxRedirects: 0,
    });
    assert.ok(res.ok(), method + " " + path.split("?")[0] + " returned " + res.status());
    return res.json();
  }
  await page.goto(origin + "/login?parent=1");
  await page.getByLabel("Email", {exact:true}).fill(email);
  await page.getByLabel("Password", {exact:true}).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/parent/settings");
  await page.reload();
  assert.equal((await call("session")).role, "parent");
  assert.equal((await call("parent/settings")).safe_playback_enabled, true);
  await call("parent/settings", "PATCH", { parent_pin: pin });
  for (const display_name of ["QA Reader", "QA Artist"]) {
    await call("parent/profiles", "POST", { display_name });
  }
  const { profiles } = await call("parent/profiles");
  const reader = profiles.find(p => p.display_name === "QA Reader").id;
  const artist = profiles.find(p => p.display_name === "QA Artist").id;
  console.log("PASS confirmed synthetic Parent sign-in, reload, enrolled device, PIN setup");
  // Fixture only. The runner-local SQL connection was verified empty before signup.
  sql("insert into public.child_requests (parent_id,profile_id,kind,message,youtube_video_id,video_title) select parent_id,id,'video','QA preview','QApreview01','Synthetic preview' from public.profiles where display_name='QA Reader'");
  await page.goto(origin + "/parent/inbox");
  const preview = page.getByText("Preview", { exact: true });
  await preview.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/QApreview01/);
  await page.getByRole("button", {name:"Close preview"}).click();
  await expect(preview).toBeFocused();
  assert.equal(sql("select count(*) from public.family_videos"), "0");
  console.log("PASS ordinary inbox Preview and focus return, zero approved videos");
  // Wait for real expiry. Parent refresh must work before a device changes roles.
  await delay(125000);
  assert.equal((await call("session")).role, "parent");
  await call("parent/session-status");
  console.log("PASS ordinary Parent refresh after local 120-second token lifetime");
  const timer = (profile_id, action, duration_minutes) => call("parent/session-timer", "POST", { profile_id, action, duration_minutes });
  await timer(reader, "start", 37);
  await timer(reader, "end");
  await timer(artist, "daily", 7);
  const status = (await call("parent/session-status")).profiles.find(p => p.id === artist).access;
  assert.equal(status.dailyAllowanceMinutes, 7);
  assert.equal(status.dailyStarted, false);
  assert.equal(new Intl.DateTimeFormat("en-US", { hour:"2-digit", minute:"2-digit", hourCycle:"h23", timeZone:"America/New_York" }).format(new Date(status.resetAt)), "07:00");
  assert.equal((await call("parent/profile-access?profileId=" + reader)).pin.required, false);
  await call("parent/view-as-child", "POST", {profile_id: reader, recovery:true});
  for (let attempt = 0; attempt < 6; attempt++) {
    await call("auth/profile-exit", "POST", {});
    await call("auth/child", "POST", {profileId: reader});
    assert.equal((await call("child/session-access")).session_access.allowed, false);
  }
  assert.equal(sql("select count(*) from public.audit_events where action='parent_profile_recovery_requested'"), "1");
  console.log("PASS recovery audited, six ordinary PIN-free returns, stopped child remained blocked");
  await call("auth/profile-exit", "POST", {});
  await page.goto(origin + "/watch");
  await page.getByRole("button", {name:/QA Artist.*Open my library/}).click();
  await expect(page.getByRole("dialog")).toContainText("hand over this device");
  await page.getByLabel("4-digit PIN", {exact:true}).fill(pin);
  await page.waitForURL("**/watch/home");
  assert.equal((await call("session")).profile.id, artist);
  const active = (await call("child/session-access")).session_access;
  assert.equal(active.mode, "daily");
  assert.equal(active.allowed, true);
  assert.equal(active.dailyStarted, true);
  // The second browser context represents another enrolled device. It never shares cookies.
  const remote = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await call("auth/parent", "POST", {action:"login", email, password}, remote);
  assert.equal((await call("session", "GET", undefined, remote)).role, "parent");
  await call("parent/session-timer", "POST", {profile_id:artist, action:"end"}, remote);
  assert.equal((await call("child/session-access")).session_access.allowed, false);
  await page.reload();
  await expect(page.getByText(/Time.s up for now/i)).toBeVisible();
  await call("auth/logout", "POST", {}, remote);
  assert.equal((await call("session", "GET", undefined, remote)).role, null);
  await remote.close();
  console.log("PASS second-device End now, child denied after reload");
  await call("auth/parent-mode", "POST", {pin});
  assert.equal((await call("session")).role, "parent");
  await call("auth/logout", "POST", {});
  assert.equal((await call("session")).role, null);
  console.log("PASS authorized sibling handoff, Daily at entry, Parent PIN return and sign-out");
} finally {
  if (browser) await browser.close();
  app.kill("SIGTERM");
}
