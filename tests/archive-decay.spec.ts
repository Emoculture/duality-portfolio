import { expect, test } from "@playwright/test";
import { enterSavedArchive } from "./navigation";

test("decay stages derive from story milestones and survive reload", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    if (!localStorage.getItem("decay-test-seeded")) {
      localStorage.setItem("decay-test-seeded", "1");
      localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true, reduced: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: [], memory: { events: ["recording:first"] } }));
    }
  });
  await page.goto("/");
  await enterSavedArchive(page);
  const board = page.locator(".archive-board");
  await expect(board).toHaveAttribute("data-decay-stage", "0");
  for (const [stage, clues, events, adminUnlocked, evidence] of [
    [1, ["thread"], ["recording:first"], false, []],
    [2, ["thread"], ["recording:first", "null-complete"], false, []],
    [3, ["thread"], ["recording:first", "null-complete"], true, ["contradiction"]],
    [4, ["thread", "finalkey"], ["recording:first", "null-complete"], true, ["contradiction"]],
  ] as const) {
    await page.evaluate(({ clues, events, adminUnlocked, evidence }) => {
      const save = JSON.parse(localStorage.getItem("duality.incident.v1")!);
      Object.assign(save, { clues });
      Object.assign(save.memory, { events, adminUnlocked, evidence });
      localStorage.setItem("duality.incident.v1", JSON.stringify(save));
      window.dispatchEvent(new Event("duality:incident-progress"));
    }, { clues, events, adminUnlocked, evidence });
    await expect(board).toHaveAttribute("data-decay-stage", String(stage));
  }
  await page.reload();
  await expect(page.locator(".welcome")).toBeVisible();
  await enterSavedArchive(page);
  await expect(board).toHaveAttribute("data-decay-stage", "4");
});

test("milestone anomaly is skippable, saved once and keeps exit available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    if (!localStorage.getItem("decay-once-seeded")) {
      localStorage.setItem("decay-once-seeded", "1");
      localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: [], memory: { events: ["recording:first"] } }));
    }
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("duality.incident.v1")!);
    save.clues = ["thread"];
    localStorage.setItem("duality.incident.v1", JSON.stringify(save));
    window.dispatchEvent(new Event("duality:incident-progress"));
  });
  await expect(page.locator(".decay-transition")).toContainText("I REMEMBER YOU");
  await expect(page.getByRole("button", { name: "Завершить сеанс", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Пропустить сбой" }).click();
  await expect(page.locator(".decay-transition")).toHaveCount(0);
  await page.reload();
  await enterSavedArchive(page);
  await expect(page.locator(".archive-board")).toHaveAttribute("data-decay-stage", "1");
  await expect(page.locator(".decay-transition")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duality.incident.v1")!).memory.events.filter((s: string) => s === "decay-shown:1").length)).toBe(1);
});

test("late story camera reveals a fictional empty chair without removing existing clues", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true, reduced: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"], memory: { events: ["recording:first"], adminUnlocked: true, evidence: ["contradiction"] } }));
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("navigation", { name: "Разделы INCIDENT 000" }).getByRole("button", { name: "/cctv/" }).click();
  await page.getByRole("button", { name: "Открыть повреждённый кадр кресла" }).click();
  await expect(page.getByRole("img", { name: "Вымышленный архивный кадр пустого кресла у монитора" })).toBeVisible();
  await page.getByLabel("Таймкод").selectOption("00:01");
  await expect(page.getByRole("button", { name: "Сохранить кадр CAMERA_000" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duality.incident.v1")!).memory.events)).toContain("decay-chair-seen");
});
