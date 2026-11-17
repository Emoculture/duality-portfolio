import { expect, test } from "@playwright/test";

for (const previousMode of ["normal", "game", "archive"] as const) {
  test(`document reload starts at welcome and preserves ${previousMode} progress`, async ({ page }) => {
    await page.addInitScript((mode) => {
      if (!localStorage.getItem("welcome-test-seeded")) {
        localStorage.setItem("welcome-test-seeded", "1");
        localStorage.setItem("duality.v1", JSON.stringify({ mode, unlocked: true, discovered: true, reduced: true, puzzle: true, legacyFlag: "keep" }));
        localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator"], choices: ["keep"], endings: ["RELEASE", "MEMORY_PROTOCOL"], memory: { visits: 3, nullChoices: ["help"], recovered: ["LETTER"] } }));
        localStorage.setItem("duality.sound.enabled", "true");
      }
    }, previousMode);
    await page.goto("/");
    await expect(page.locator(".welcome")).toBeVisible();
    await expect(page.locator(".archive-board, .portfolio, .connection-screen")).toHaveCount(0);
    const before = await page.evaluate(() => localStorage.getItem("duality.incident.v1"));
    await page.reload();
    await expect(page.locator(".welcome")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("duality.incident.v1"))).toBe(before);
    const settings = await page.evaluate(() => ({ main: JSON.parse(localStorage.getItem("duality.v1")!), sound: localStorage.getItem("duality.sound.enabled") }));
    expect(settings.main).toMatchObject({ mode: "welcome", unlocked: true, reduced: true, puzzle: true, legacyFlag: "keep" });
    expect(settings.sound).toBe("true");
  });
}

test("visible square starts the puzzle for a new visitor and old hidden entry remains", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Войти на сайт" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Неизвестный объект" })).toHaveText("?");
  await expect(page.getByRole("button", { name: "Исследовать деталь" })).toBeAttached();
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await expect(page.getByRole("heading", { name: "README.TXT" })).toBeVisible();
});

test("unlocked visitor returns through connection without losing clues", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator"], memory: { visits: 2 } }));
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await expect(page.locator(".connection-screen")).toBeVisible();
  await page.getByRole("button", { name: "Пропустить запись" }).click();
  await expect(page.locator(".archive-board")).toHaveAttribute("data-incident-stage", "3");
});
