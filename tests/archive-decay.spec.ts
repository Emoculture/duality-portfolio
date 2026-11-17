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
