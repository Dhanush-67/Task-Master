const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  use: { browserName: "chromium", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [
    { name: "production", use: { baseURL: "http://127.0.0.1:3100" } },
    { name: "development", use: { baseURL: "http://127.0.0.1:5175" } }
  ],
  webServer: [
    { command: "PORT=3100 node src/server.js", url: "http://127.0.0.1:3100/api/health", reuseExistingServer: false },
    { command: "API_PROXY_TARGET=http://127.0.0.1:3100 npm run dev:frontend -- --port 5175 --strictPort", url: "http://127.0.0.1:5175", reuseExistingServer: false }
  ]
});
