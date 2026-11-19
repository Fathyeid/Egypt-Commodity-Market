import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    env: { AUTH_RATE_LIMIT: "off", BETTER_AUTH_URL: `http://localhost:${PORT}`, AI_PROVIDER: "fake" },
    url: `http://localhost:${PORT}/ar`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /responsive\.spec\.ts/ },
  ],
});
