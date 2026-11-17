import { expect, test } from "@playwright/test";

test("wrong key stays in game; successful first connection finishes without looping", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Исследовать деталь" }).click();
  await page.clock.fastForward(700);
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("wrong");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await expect(page.getByRole("alert")).toContainText("Ключ не совпал");
  await expect(page.getByLabel("ARCHIVE CONNECTION SEQUENCE")).toHaveCount(0);
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await page.clock.fastForward(1500);
  const sequence = page.getByLabel("ARCHIVE CONNECTION SEQUENCE");
  await expect(sequence).toBeVisible();
  await page.clock.fastForward(4500);
  await expect(sequence).toContainText("NEW MEMORY SIGNATURE DETECTED");
  await expect(sequence).not.toContainText("THIS SESSION HAS BEEN SEEN BEFORE");
  await page.clock.fastForward(5000);
  await expect(page.locator(".archive-board")).toBeVisible();
  await expect(sequence).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".archive-board")).toBeVisible();
  await expect(sequence).toHaveCount(0);
});

test("returning player can skip connection without losing progress", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "game", unlocked: false, discovered: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator"], memory: { visits: 3 } }));
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await page.clock.fastForward(1500);
  await page.clock.fastForward(4500);
  const sequence = page.getByLabel("ARCHIVE CONNECTION SEQUENCE");
  await expect(sequence).toContainText("THIS SESSION HAS BEEN SEEN BEFORE");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await sequence.getByRole("button", { name: "Пропустить" }).click();
  await expect(page.locator(".archive-board")).toHaveAttribute("data-incident-stage", "3");
});

test("reduced motion uses a short static connection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem("duality.v1", JSON.stringify({ mode: "game" })));
  await page.goto("/");
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await page.clock.fastForward(1500);
  await expect(page.locator(".connection-short")).toBeVisible();
  await page.clock.fastForward(1500);
  await expect(page.locator(".archive-board")).toHaveCSS("background-color", "rgb(234, 230, 216)");
});
