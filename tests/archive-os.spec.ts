import { expect, test } from "@playwright/test";
import { enterSavedArchive } from "./navigation";

async function open(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ unlocked: true, reduced: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, memory: { events: ["recording:first"] } }));
  });
  await page.goto("/");
  await enterSavedArchive(page);
}

test("desktop windows open, focus, drag, close and reopen", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Desktop window manager is intentionally simplified on phones.");
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  const icons = page.getByRole("navigation", { name: "Рабочий стол ARCHIVE_OS" });
  await icons.getByRole("button", { name: "Проводник" }).click();
  await icons.getByRole("button", { name: "MEMORY.LOG" }).click();
  const navWindow = page.getByRole("region", { name: "Окно проводника" });
  const memory = page.getByRole("region", { name: "Окно журнала памяти" });
  await expect(navWindow).toBeVisible();
  await expect(memory).toBeVisible();
  const header = navWindow.locator(".archive-os-title");
  const start = (await header.boundingBox())!;
  await page.mouse.move(start.x + 30, start.y + 10);
  await page.mouse.down();
  await page.mouse.move(start.x + 100, start.y + 50, { steps: 4 });
  await page.mouse.up();
  const moved = (await header.boundingBox())!;
  expect(moved.x).toBeGreaterThan(start.x + 30);
  await navWindow.getByRole("button", { name: "Закрыть окно Проводник" }).click();
  await expect(navWindow).toHaveCount(0);
  await icons.getByRole("button", { name: "Проводник" }).click();
  await navWindow.getByRole("button", { name: "▣ Проекты" }).click();
  await expect(page.getByRole("heading", { name: /Каталог работ/ })).toBeVisible();
  await page.setViewportSize({ width: 900, height: 600 });
  const windowBox = (await navWindow.boundingBox())!;
  expect(windowBox.x).toBeLessThan(900);
  expect(windowBox.y).toBeLessThan(600);
  await expect(page.getByRole("button", { name: "▦ ARCHIVE_OS" })).toBeVisible();
});

test("fullscreen can be entered and exited without changing progress", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "⛶ FULLSCREEN" }).click();
  await expect(page.getByRole("button", { name: "⛶ EXIT FULLSCREEN" })).toBeVisible();
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.getByRole("button", { name: "⛶ EXIT FULLSCREEN" }).click();
  await expect(page.getByRole("button", { name: "⛶ FULLSCREEN" })).toBeVisible();
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await expect(page.locator(".archive-board")).toHaveAttribute("data-decay-stage", "0");
});

test("phone uses a single readable archive and fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await open(page);
  await expect(page.getByRole("navigation", { name: "Рабочий стол ARCHIVE_OS" })).toBeHidden();
  await expect(page.getByRole("button", { name: "⛶ FULLSCREEN" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "/projects/", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Каталог работ/ })).toBeVisible();
});
