const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdir, writeFile, rm } = require("node:fs/promises");
const path = require("node:path");
const app = require("../src/app");
test("Express serves the compiled frontend alongside JSON API routes", async () => {
  const fixture = path.join(__dirname, "..", "dist", "integration-probe.txt");
  await mkdir(path.dirname(fixture), { recursive: true });
  await writeFile(fixture, "compiled frontend asset");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const asset = await fetch(`${base}/integration-probe.txt`);
    assert.equal(asset.status, 200);
    assert.equal(await asset.text(), "compiled frontend asset");
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).data.status, "ok");
    const missing = await fetch(`${base}/api/missing`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).success, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(fixture, { force: true });
  }
});
