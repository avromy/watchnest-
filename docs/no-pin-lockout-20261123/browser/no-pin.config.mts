import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";
const evidenceRoot = fileURLToPath(new URL("./", import.meta.url));
export default defineConfig({
  testDir: fileURLToPath(new URL("../../../e2e", import.meta.url)),
  testMatch: "no-pin-entry.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  outputDir: `${evidenceRoot}results`,
  reporter: [["list"], ["json", { outputFile: `${evidenceRoot}results.json` }]],
  use: {
    baseURL: "http://127.0.0.1:3127",
    headless: true,
    launchOptions: {
      executablePath: process.env.WATCHNEST_CHROMIUM,
      args: process.env.WATCHNEST_CHROMIUM ? ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] : [],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3127",
    url: "http://127.0.0.1:3127",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
