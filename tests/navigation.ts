import { expect, type Page } from "@playwright/test";

// Existing archive scenarios explicitly enter through WELCOME after each
// document load, matching the real navigation instead of restoring a mode.
export async function enterSavedArchive(page: Page) {
  await expect(page.locator(".welcome")).toBeVisible();
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  const archive = page.locator(".archive-board");
  const skip = page.getByRole("button", { name: "Пропустить" });
  await expect(archive.or(skip)).toBeVisible({ timeout: 15000 });
  if (await skip.isVisible()) await skip.click({ force: true, timeout: 1000 }).catch(() => {});
  const recording = page.getByRole("button", { name: "Пропустить запись" });
  await expect(archive.or(recording)).toBeVisible({ timeout: 15000 });
  if (await recording.isVisible()) await recording.click();
  await expect(archive).toBeVisible();
}
