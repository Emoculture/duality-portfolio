import { expect, test } from "@playwright/test";

for (const choice of ["memory", "record"] as const) {
  test(`NULL remembers the ${choice} interpretation and preserves it after reload`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      if (!localStorage.getItem("null-seeded")) {
        localStorage.setItem("null-seeded", "yes");
        localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true }));
        localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"], memory: { recovered: ["LETTER"], events: ["midnight"] } }));
      }
    });
    await page.goto("/");
    await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
    const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
    await nav.getByRole("button", { name: "/user_000/" }).click();
    const messenger = page.getByRole("region", { name: "Переписка с NULL" });
    await messenger.getByRole("button", { name: "Сначала докажи" }).click();
    await expect(messenger).toContainText("Справедливо");
    await messenger.getByRole("button", { name: choice === "memory" ? "Сохранить воспоминание" : "Сверить с записью" }).click();
    await page.reload();
    await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
    await expect(page.locator(".incident-journal")).toContainText(choice === "memory" ? "версия воспоминания" : "версия записи");
    await nav.getByRole("button", { name: "/user_000/" }).click();
    await expect(messenger).toContainText(choice === "memory" ? "часть памяти" : "тоже могла быть копией");
  });
}

test("additional photo, log and transcript recover with clues and survive reload", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("recovered-seeded")) {
      localStorage.setItem("recovered-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"], memory: { recovered: ["LETTER"], evidence: ["camera000"] } }));
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("navigation", { name: "Разделы INCIDENT 000" }).getByRole("button", { name: "/recovery/" }).click();
  const files = page.getByRole("region", { name: "Дополнительные восстановленные файлы" });
  await expect(files).toContainText("VOICE_2007.TXT — LOCKED");
  await files.getByLabel("Метка фотографии").fill("00:02");
  await files.getByRole("button", { name: "Восстановить фотографию" }).click();
  await expect(files.getByRole("status")).toContainText("не совпадает");
  await files.getByLabel("Метка фотографии").fill("00:01");
  await files.getByRole("button", { name: "Восстановить фотографию" }).click();
  await files.getByLabel("Порядок событий").fill("2004-2007");
  await files.getByRole("button", { name: "Восстановить журнал" }).click();
  await files.getByLabel("Слово расшифровки").fill("TRACE");
  await files.getByRole("button", { name: "Восстановить расшифровку" }).click();
  await expect(files).toContainText("VOICE_2007.TXT — RECOVERED");
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident-journal")).toContainText("PHOTO_000.JPG");
  await expect(page.locator(".incident-journal")).toContainText("SERVER_2007.LOG");
  await expect(page.locator(".incident-journal")).toContainText("VOICE_2007.TXT");
});

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

test("secret ending requires the case evidence and survives a new run", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("ending-seeded")) {
      localStorage.setItem("ending-seeded", "yes");
      localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
      localStorage.setItem("duality.incident.v1", JSON.stringify({
        version: 1, clues: ["thread", "moderator", "image", "camera", "system", "dialogue", "finalkey"],
        memory: { recovered: ["LETTER"], events: ["midnight", "null-complete"], evidence: ["forum", "camera000", "midnight", "null", "admin"], adminUnlocked: true },
      }));
    }
  });
  await page.goto("/");
  await expect(page.locator(".archive-board")).toHaveAttribute("data-incident-stage", "7");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  await nav.getByRole("button", { name: "/ending/" }).click();
  await expect(page.getByRole("button", { name: "Запустить MEMORY PROTOCOL" })).toHaveCount(0);
  await nav.getByRole("button", { name: "/journal/" }).click();
  await page.getByRole("button", { name: "Сохранить противоречие" }).click();
  await nav.getByRole("button", { name: "/ending/" }).click();
  await page.getByRole("button", { name: "Запустить MEMORY PROTOCOL" }).click();
  await expect(page.locator(".incident-ending")).toContainText("MEMORY PROTOCOL");
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.locator(".incident-journal")).toContainText("MEMORY_PROTOCOL");
  await page.getByRole("button", { name: "Сбросить игровой прогресс" }).click();
  await page.getByRole("button", { name: "Да, начать заново" }).click();
  await expect(page.locator(".incident-journal")).toContainText("MEMORY_PROTOCOL");
  await expect(page.locator(".archive-board")).toHaveAttribute("data-incident-stage", "1");
});

test("rejected storage writes keep the current session playable", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"] }));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "duality.incident.v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  await nav.getByRole("button", { name: "/recovery/" }).click();
  await page.getByLabel("Контрольное слово").fill("TRACE");
  await page.getByRole("button", { name: "Восстановить переписку" }).click();
  await nav.getByRole("button", { name: "/journal/" }).click();
  await expect(page.getByRole("region", { name: "Дело о пропавшем человеке" })).toContainText("восстановлена; слово TRACE");
});

test("new investigation fits narrow viewports without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true, reduced: true }));
    localStorage.setItem("duality.incident.v1", JSON.stringify({ version: 1, clues: ["thread", "moderator", "image"] }));
  });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 740 });
    for (const label of ["/journal/", "/threads/", "/recovery/", "/cctv/", "/user_000/"]) {
      await nav.getByRole("button", { name: label, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("complete new investigation is reachable through existing chapters", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    localStorage.setItem("duality.v1", JSON.stringify({ mode: "archive", unlocked: true, discovered: true }));
  });
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  const open = async (label: string) => nav.getByRole("button", { name: label, exact: true }).click();
  await open("/threads/");
  await page.getByRole("button", { name: "Прочитать ответ №000" }).click();
  await page.getByRole("button", { name: "Сохранить заметку модератора" }).click();
  await page.getByRole("button", { name: "Сохранить запись №1410" }).click();
  await open("/recovery/");
  await page.getByLabel("Контрольное слово").fill("TRACE");
  await page.getByRole("button", { name: "Восстановить переписку" }).click();
  for (const [a, b] of [[2, 1], [6, 5]]) {
    await page.getByRole("button", { name: new RegExp(`Фрагмент ${a},`) }).click();
    await page.getByRole("button", { name: new RegExp(`Фрагмент ${b},`) }).click();
  }
  await page.getByRole("button", { name: "Проверить изображение" }).click();
  await open("/cctv/");
  await page.getByLabel("Таймкод").selectOption("00:01");
  await page.getByRole("button", { name: "Сохранить кадр CAMERA_000" }).click();
  await page.getByLabel("Камера").selectOption("CAM_03");
  await page.getByLabel("Время").selectOption("00:01");
  await page.getByRole("button", { name: "Сохранить кадр как улику" }).click();
  await open("/system/");
  await page.getByRole("button", { name: "Запустить виртуальную систему" }).click();
  await page.getByRole("button", { name: "▣ Терминал" }).click();
  await page.getByLabel("C:\\ARCHIVE>").fill("cd users");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await page.getByLabel("C:\\USERS>").fill("unlock 000-0102");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await open("/user_000/");
  await page.getByRole("button", { name: "Я помогу вспомнить" }).click();
  await page.getByRole("button", { name: "Помогу", exact: true }).click();
  await open("/journal/");
  await page.getByLabel("Код ADMIN_1999").fill("TRACE-0001");
  await page.getByRole("button", { name: "Проверить код" }).click();
  await page.getByRole("button", { name: "Сохранить противоречие" }).click();
  await page.getByRole("button", { name: "Запустить MIDNIGHT EVENT" }).click();
  await page.clock.fastForward("00:20");
  await expect(page.getByRole("region", { name: "Процедура восстановления памяти" })).toContainText("процедура завершена");
  await open("/user_000/");
  await page.getByRole("button", { name: "Сохранить ответ NULL" }).click();
  await open("/ending/");
  await page.getByLabel("Последний ключ").fill("MEMORY-0001");
  await page.getByRole("button", { name: "Проверить ключ" }).click();
  await page.getByRole("button", { name: "Запустить MEMORY PROTOCOL" }).click();
  await expect(page.locator(".incident-ending")).toContainText("MEMORY PROTOCOL");
});
