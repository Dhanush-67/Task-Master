const { test, expect, request: requestFactory } = require("@playwright/test");
let ids = [];
test.beforeEach(() => { ids = []; });
test.afterEach(async ({}, testInfo) => {
  // Use an independent context so cleanup survives a browser/test timeout.
  const cleanup = await requestFactory.newContext({ baseURL: testInfo.project.use.baseURL });
  try {
    for (const id of ids) await cleanup.delete(`/api/tasks/${id}`);
  } finally { await cleanup.dispose(); }
});
test("task CRUD, server filters, sorting, persistence and validation", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const prefix = `Migration ${Date.now()}`;
  async function create(title, date) {
    await page.getByRole("button", { name: "Add New Task" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title").fill(title);
    await dialog.getByLabel("Date", { exact: true }).fill(date);
    await dialog.getByLabel("Time", { exact: true }).fill("14:30");
    const response = page.waitForResponse((r) => r.url().endsWith("/api/tasks") && r.request().method() === "POST" && r.status() === 201);
    await dialog.getByRole("button", { name: "Save Task" }).click();
    ids.push((await (await response).json()).data.id);
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("article", { name: title, exact: true })).toBeVisible();
  }
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Task Master", exact: true })).toBeVisible();
    await expect(page.getByRole("status")).not.toBeVisible();
    await page.getByRole("button", { name: "Add New Task" }).click();
    const draft = page.getByRole("dialog");
    await draft.getByLabel("Title").fill("Unsaved draft");
    // Interior padding is inside the dialog, not the backdrop.
    await draft.click({ position: { x: 10, y: 10 } });
    await expect(draft).toBeVisible();
    await expect(draft.getByLabel("Title")).toHaveValue("Unsaved draft");
    await page.keyboard.press("Escape");
    await expect(draft).not.toBeVisible();
    // The real Express validator rejects the input; the form must stay editable.
    await page.getByRole("button", { name: "Add New Task" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title").fill("ab");
    await dialog.getByLabel("Date", { exact: true }).fill("2026-10-20");
    await dialog.getByLabel("Time", { exact: true }).fill("14:30");
    await dialog.getByRole("button", { name: "Save Task" }).click();
    await expect(dialog.getByRole("alert")).toContainText("title must be at least 3");
    await dialog.getByRole("button", { name: "Close modal" }).click();

    await create(`${prefix} Z <b>literal</b>`, "2026-10-22");
    await create(`${prefix} A`, "2026-10-21");
    await page.screenshot({ path: `test-results/frontend-${testInfo.project.name}.png`, fullPage: true });
    await page.reload();
    let first = page.getByRole("article", { name: `${prefix} Z <b>literal</b>`, exact: true });
    await expect(first).toBeVisible();
    await first.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByRole("dialog").getByLabel("Date", { exact: true })).toHaveValue("2026-10-22");
    await expect(page.getByRole("dialog").getByLabel("Time", { exact: true })).toHaveValue("14:30");
    await page.getByRole("dialog").getByLabel("Title").fill(`${prefix} B`);
    await page.getByRole("dialog").getByLabel("Time", { exact: true }).fill("16:45");
    await page.getByRole("button", { name: "Update Task" }).click();
    first = page.getByRole("article", { name: `${prefix} B`, exact: true });
    await expect(first).toBeVisible();
    await expect(first).toContainText("4:45");
    await first.getByRole("button", { name: "Mark Done" }).click();
    await expect(first.getByRole("button", { name: "Mark Open" })).toBeVisible();
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("completed");
    await expect(first).toBeVisible();
    await expect(page.getByRole("article", { name: `${prefix} A`, exact: true })).not.toBeVisible();
    await first.getByRole("button", { name: "Mark Open" }).click();
    await expect(first).not.toBeVisible();
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("open");
    await expect(first).toBeVisible();
    await page.getByRole("combobox", { name: "Sort By", exact: true }).selectOption("title");
    await page.getByRole("combobox", { name: "Order", exact: true }).selectOption("desc");
    const cards = page.getByRole("article").filter({ hasText: prefix });
    await expect.poll(() => cards.locator("h3").allTextContents()).toEqual([`${prefix} B`, `${prefix} A`]);
    await page.getByRole("combobox", { name: "Sort By", exact: true }).selectOption("dueDate");
    await page.getByRole("combobox", { name: "Order", exact: true }).selectOption("asc");
    await expect.poll(() => cards.locator("h3").allTextContents()).toEqual([`${prefix} A`, `${prefix} B`]);
    await first.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(first).not.toBeVisible();
    await page.reload();
    await expect(first).not.toBeVisible();
    expect(errors).toEqual([]);
});
