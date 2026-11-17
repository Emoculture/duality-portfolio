import { expect, test } from "@playwright/test";
import { enterSavedArchive } from "./navigation";

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
  await enterSavedArchive(page);
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
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await page.clock.fastForward(700);
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
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await page.clock.fastForward(700);
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await page.clock.fastForward(1500);
  await expect(page.locator(".connection-short")).toBeVisible();
  await page.clock.fastForward(1500);
  await expect(page.locator(".archive-board")).toHaveCSS("background-color", "rgb(234, 230, 216)");
});

test("archive traces follow chapter progress without changing the light shell", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image", "camera", "system", "dialogue"] }));
  });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await enterSavedArchive(page);
  await expect(page.locator(".archive-board")).toHaveAttribute("data-incident-stage", "7");
  await expect(page.locator(".archive-board")).toHaveCSS("background-color", "rgb(234, 230, 216)");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident h2").first()).not.toHaveCSS("text-shadow", "none");
  await expect(page.getByRole("button", { name: "/journal/" })).toBeEnabled();
});

test("observer progresses once, and the fictional window records its choice", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    if (!localStorage.getItem("observer-seeded")) {
      localStorage.setItem("observer-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"], memory: { evidence: ["camera000"] } }));
    }
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await expect(page.locator(".archive-observer")).toContainText("OBSERVER STATUS: ACTIVE");
  await page.locator(".observer-window").getByRole("button", { name: "WAIT" }).click();
  await expect(page.locator(".archive-observer")).toContainText("Я ждал ответа");
  await page.clock.fastForward(9000);
  await expect(page.locator(".archive-observer")).toContainText("OBSERVER STATUS: OBSERVED");
  await expect(page.locator(".archive-observer")).toContainText("THERE ARE TWO OF YOU.");
  await page.reload();
  await enterSavedArchive(page);
  await expect(page.locator(".archive-observer")).toContainText("OBSERVER STATUS: OBSERVED");
  await expect(page.locator(".observer-window")).toHaveCount(0);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident-journal")).toContainText("ARCHIVE.EXE: ожидание");
});

test("first and later post-ending connection show different fictional frames", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    if (!localStorage.getItem("frame-seeded")) {
      localStorage.setItem("frame-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "game", discovered: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, endings: ["RELEASE"], clues: ["thread"], memory: { visits: 1 } }));
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await page.clock.fastForward(700);
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await page.clock.fastForward(1500);
  await page.clock.fastForward(7500);
  await expect(page.getByRole("img", { name: "Пустое кресло перед компьютером" })).toBeVisible();
  await page.getByRole("button", { name: "Пропустить" }).click();
  await page.getByRole("button", { name: "Завершить сеанс", exact: true }).click();
  await page.getByRole("button", { name: "Вернуться в архив" }).click();
  await page.clock.fastForward(7500);
  await expect(page.getByRole("img", { name: "Неподвижный силуэт в кресле перед компьютером" })).toBeVisible();
  await page.getByRole("button", { name: "Пропустить" }).click();
  await expect(page.locator(".archive-board")).toBeVisible();
});

test("sound is off by default and the preference persists", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true })));
  await page.goto("/");
  await enterSavedArchive(page);
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  const sound = page.getByRole("button", { name: /Звук эффектов/ });
  await expect(sound).toHaveText("Звук эффектов: выключен");
  await sound.click();
  await expect(sound).toHaveText("Звук эффектов: включён");
  await page.reload();
  await enterSavedArchive(page);
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await expect(sound).toHaveText("Звук эффектов: включён");
  await sound.click();
  await expect(sound).toHaveText("Звук эффектов: выключен");
});

test("observer stays hidden in early chapters and TERMINATE is remembered", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("terminate-seeded")) {
      localStorage.setItem("terminate-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: [] }));
    }
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await expect(page.locator(".archive-observer")).toHaveCount(0);
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("duality.incident.v1")!);
    save.clues = ["thread", "moderator", "image"];
    localStorage.setItem("duality.incident.v1", JSON.stringify(save));
  });
  await page.reload();
  await enterSavedArchive(page);
  await page.getByRole("button", { name: "TERMINATE" }).click();
  await expect(page.locator(".archive-observer")).toContainText("попытка закрытия записана");
  await page.reload();
  await enterSavedArchive(page);
  await expect(page.locator(".observer-window")).toHaveCount(0);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident-journal")).toContainText("попытка закрытия окна");
});

test("a connection rendering error falls through to the unlocked archive", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("duality.v1", JSON.stringify({ mode: "game" })));
  await page.goto("/");
  await page.getByRole("button", { name: "Неизвестный объект" }).click();
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.evaluate(() => { window.matchMedia = () => { throw new Error("simulated cinematic failure"); }; });
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await expect(page.locator(".archive-board")).toBeVisible();
});
