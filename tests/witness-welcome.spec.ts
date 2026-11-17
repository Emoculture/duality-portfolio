import { expect, test } from "@playwright/test";
import { enterSavedArchive } from "./navigation";

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
  await expect(page.getByRole("button", { name: "Неизвестный объект" })).toContainText("?");
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

test("recordings trigger from case progress and can be replayed without changing it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    if (!localStorage.getItem("witness-recordings-seeded")) {
      localStorage.setItem("witness-recordings-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true, discovered: true, reduced: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image", "camera", "system", "dialogue", "finalkey"], endings: ["RELEASE"], memory: { recovered: ["LETTER", "CASE_LOG"], events: ["recording:first", "null-complete"] } }));
    }
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  for (const [section, title] of [["/recovery/", "THE RECORDING"], ["/user_000/", "TWO USERS"], ["/ending/", "FINAL MEMORY"]]) {
    await nav.getByRole("button", { name: section, exact: true }).click();
    await expect(page.locator(".pixel-cutscene")).toContainText(title);
    await page.getByRole("button", { name: "Пропустить запись" }).click();
  }
  await nav.getByRole("button", { name: "/journal/" }).click();
  const journal = page.getByRole("region", { name: "Журнал записей" });
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("duality.incident.v1")!).memory.events);
  await journal.getByRole("button", { name: "REC_0001 — FIRST CONTACT" }).click();
  await expect(page.locator(".witness-sprite")).toHaveAttribute("src", "/archive/witness/witness-master.png");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Далее" }).click();
  await expect(page.locator(".pixel-cutscene")).toContainText("THIS RECORDING WAS MADE TOMORROW.");
  await page.getByRole("button", { name: "Завершить запись" }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duality.incident.v1")!).memory.events)).toEqual(before);
});

test("skipping recovery still plays first contact and revealed text stays visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true })));
  await page.goto("/");
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await page.clock.fastForward(700);
  await page.clock.fastForward(1200);
  await page.getByRole("button", { name: "Пропустить", exact: true }).click();
  await expect(page.locator(".connection-screen")).toHaveCount(0);
  await expect(page.locator(".archive-board")).toHaveCount(0);
  const scene = page.locator(".pixel-cutscene");
  await expect(scene).toContainText("FIRST CONTACT");
  await scene.getByRole("button", { name: "Показать текст" }).click();
  await expect(scene).toContainText("Ты всё-таки открыл его.");
  await page.clock.fastForward(700);
  await expect(scene).toContainText("Ты всё-таки открыл его.");
  await scene.getByRole("button", { name: "Пропустить запись" }).click();
  await expect(page.locator(".archive-board")).toBeVisible();
});
