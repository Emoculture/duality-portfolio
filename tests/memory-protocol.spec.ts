import { expect, test } from "@playwright/test";

test("legacy incident save migrates, remembers returns, and resets only on confirmation", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("memory-test-seeded")) {
      localStorage.setItem("memory-test-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({
        version: 1, visited: ["old-page"], threads: ["1273"], files: ["OLD.TXT"],
        clues: ["thread", "moderator"], choices: ["old-answer"], endings: ["RELEASE"],
        systemUnlocked: true, lastEnding: "RELEASE",
      }));
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const journal = page.locator(".incident-journal");
  await expect(journal).toContainText("Входов в архив: 1");
  await expect(journal).toContainText("максимальная глава: 3/7");
  await expect(journal).toContainText("OLD.TXT");
  await expect(journal).toContainText("RELEASE");
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(journal).toContainText("Входов в архив: 2");
  await expect(journal).toContainText("Ты снова здесь");
  await journal.getByRole("button", { name: "Сбросить игровой прогресс" }).click();
  await journal.getByRole("button", { name: "Да, начать заново" }).click();
  await expect(journal).toContainText("RELEASE");
  await expect(journal).toContainText("максимальная глава: 3/7");
  await journal.getByRole("button", { name: "Удалить все игровые воспоминания" }).click();
  await journal.getByRole("button", { name: "Отмена" }).click();
  await expect(journal).toContainText("RELEASE");
  await journal.getByRole("button", { name: "Удалить все игровые воспоминания" }).click();
  await journal.getByRole("button", { name: "Да, удалить воспоминания" }).click();
  await expect(journal).toContainText("Концовки: нет");
  await expect(journal).toContainText("Входов в архив: 0");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duality.v1")!).unlocked)).toBe(true);
});

test("invalid saved memory does not break the archive", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
    localStorage.setItem("duality.incident.v1", "{broken");
  });
  await page.goto("/");
  await expect(page.locator(".archive-board")).toBeVisible();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident-journal")).toContainText("Входов в архив: 1");
});
