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

test("forum changes, recovered letter and CAMERA_000 evidence survive reload", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("case-seeded")) {
      localStorage.setItem("case-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"] }));
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  await nav.getByRole("button", { name: "/threads/" }).click();
  await expect(page.getByText("Оригинал No.1412: [удалено]")).toBeVisible();
  await page.getByRole("button", { name: "Сохранить запись №1410" }).click();
  await nav.getByRole("button", { name: "/recovery/" }).click();
  await page.getByLabel("Контрольное слово").fill("TRACE");
  await page.getByRole("button", { name: "Восстановить переписку" }).click();
  await expect(page.getByText("LETTER_2007.TXT — RECOVERED")).toBeVisible();
  await nav.getByRole("button", { name: "/cctv/" }).click();
  await page.getByLabel("Таймкод").selectOption("00:01");
  await page.getByRole("button", { name: "Сохранить кадр CAMERA_000" }).click();
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const dossier = page.getByRole("region", { name: "Дело о пропавшем человеке" });
  await expect(dossier).toContainText("запись №1410 сохранена");
  await expect(dossier).toContainText("восстановлена; слово TRACE");
  await expect(dossier).toContainText("кадр 00:01 сохранён");
  await expect(dossier).toContainText("CHANGE.LOG");
});

test("NULL choices, timer and ADMIN_1999 persist", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("interaction-seeded")) {
      localStorage.setItem("interaction-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"], memory: { recovered: ["LETTER"], evidence: ["camera000"] } }));
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const procedure = page.getByRole("region", { name: "Процедура восстановления памяти" });
  await procedure.getByRole("button", { name: "Запустить MIDNIGHT EVENT" }).click();
  await expect(procedure).toContainText("До 00:00:");
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("duality.incident.v1")!);
    save.memory.timerDeadline = Date.now() - 1;
    localStorage.setItem("duality.incident.v1", JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(procedure).toContainText("процедура завершена");
  await procedure.getByLabel("Код ADMIN_1999").fill("TRACE-0001");
  await procedure.getByRole("button", { name: "Проверить код" }).click();
  await procedure.getByRole("button", { name: "Сохранить противоречие" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  await nav.getByRole("button", { name: "/user_000/" }).click();
  const messenger = page.getByRole("region", { name: "Переписка с NULL" });
  await messenger.getByRole("button", { name: "Сначала докажи" }).click();
  await messenger.getByRole("button", { name: "Сохранить ответ NULL" }).click();
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(procedure).toContainText("ДОСТУП ОТКРЫТ");
  await nav.getByRole("button", { name: "/user_000/" }).click();
  await expect(messenger).toContainText("Сначала докажи");
  await expect(messenger).toContainText("Переписка сохранена");
});
