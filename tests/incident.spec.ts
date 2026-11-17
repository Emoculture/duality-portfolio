import { test, expect } from "@playwright/test";
test("seven objectives, camera, terminal, choices and endings survive reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({
        mode: "archive",
        unlocked: true,
        discovered: true,
        puzzle: true,
      }),
    );
    localStorage.setItem("duality.investigation.v1", "4");
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(
    page.getByRole("heading", { name: "I — RESTORED" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Импортировано старое расследование: 4\/6/),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Разделы INCIDENT 000" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await page.getByRole("button", { name: "Прочитать ответ №000" }).click();
  await page
    .getByRole("button", { name: "Сохранить заметку модератора" })
    .click();
  await page.getByRole("button", { name: "/recovery/" }).click();
  for (const [a, b] of [
    [2, 1],
    [6, 5],
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`Фрагмент ${a},`) })
      .click();
    await page
      .getByRole("button", { name: new RegExp(`Фрагмент ${b},`) })
      .click();
  }
  await page.getByRole("button", { name: "Проверить изображение" }).click();
  await expect(page.getByText(/На обороте: CAM_03/)).toBeVisible();
  await page.getByRole("button", { name: "/cctv/" }).click();
  await page.getByLabel("Камера").selectOption("CAM_03");
  await page.getByLabel("Время").selectOption("00:01");
  await expect(
    page.getByRole("img", { name: "Фигура на лестнице" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Увеличить", exact: true }).click();
  await expect(page.locator(".camera-frame.camera-zoom img")).toHaveCSS(
    "transform",
    "matrix(1.6, 0, 0, 1.6, 0, 0)",
  );
  await page.getByRole("button", { name: "Уменьшить", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить кадр как улику" }).click();
  await page.getByRole("button", { name: "/system/" }).click();
  await page
    .getByRole("button", { name: "Запустить виртуальную систему" })
    .click();
  await page.getByRole("button", { name: "▣ Терминал" }).click();
  const command = page.getByLabel("C:\\ARCHIVE>");
  await command.fill("cd users");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await page.getByLabel("C:\\USERS>").fill("type ADMIN_NOTES.TXT");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await expect(page.getByLabel("Вывод терминала")).toContainText("000-0102");
  await page.getByLabel("C:\\USERS>").fill("unlock 000-0102");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await expect(
    page.getByText("Код принят. Доступ администратора восстановлен."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "/user_000/", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Я помогу вспомнить" }).click();
  await expect(page.getByText(/не удаляй единственную копию/)).toBeVisible();
  await page.getByRole("button", { name: "Что случилось в 2007?" }).click();
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.getByText(/Ответы:.*Что случилось в 2007/)).toBeVisible();
  await page
    .getByRole("button", { name: "/user_000/", exact: true })
    .last()
    .click();
  await expect(
    page.getByText(/Копия загрузилась без администратора/),
  ).toBeVisible();
  await page.getByRole("button", { name: "/audio/" }).click();
  await page.getByText("Расшифровка").last().click();
  await expect(page.getByText(/Последнее слово — MEMORY/)).toBeVisible();
  await page.getByRole("button", { name: "/ending/", exact: true }).click();
  await page.getByLabel("Последний ключ").fill("MEMORY-0001");
  await page.getByRole("button", { name: "Проверить ключ" }).click();
  await page.getByRole("button", { name: "Удалить архив" }).click();
  await expect(page.getByText("1 FILE REMAINS")).toBeVisible();
  await page.getByRole("button", { name: "Домой", exact: true }).click();
  await expect(page.locator(".purged-home")).toContainText("1 FILE REMAINS");
  await page.getByRole("button", { name: "Открыть оставшийся файл" }).click();
  await page.getByRole("button", { name: "/ending/", exact: true }).click();
  await page.getByRole("button", { name: "Освободить №000" }).click();
  await expect(page.getByText("RELEASE", { exact: true })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Разделы архива" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await expect(page.locator("#post-1370")).toContainText("[восстановлено]");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "/ending/", exact: true }).click();
  await page.getByRole("button", { name: "Стать администратором" }).click();
  await expect(page.getByText("WELCOME BACK, ADMINISTRATOR")).toBeVisible();
  await page.getByRole("button", { name: "/system/" }).click();
  await page.getByRole("button", { name: "▣ Терминал" }).click();
  await page.locator("#terminal-command").fill("whoami");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await expect(page.getByLabel("Вывод терминала")).toContainText(
    "ADMINISTRATOR / №000",
  );
  await page.getByRole("button", { name: "Домой", exact: true }).click();
  await expect(page.locator(".archive-board")).toHaveClass(
    /incident-replacement/,
  );
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "/ending/", exact: true }).click();
  await page
    .getByRole("button", { name: "Начать заново, сохранив концовки" })
    .click();
  await page.getByRole("button", { name: "Да, начать заново" }).click();
  await expect(
    page.getByRole("heading", { name: "I — RESTORED" }),
  ).toBeVisible();
  await expect(page.locator(".archive-board")).not.toHaveClass(
    /incident-replacement/,
  );
  await page.getByRole("button", { name: "/recovery/" }).click();
  await expect(
    page.getByRole("button", { name: "Фрагмент 2, позиция 1" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "/journal/", exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.getByText(/PURGE, RELEASE, REPLACEMENT/)).toBeVisible();
  await page.getByRole("button", { name: "Сбросить игровой прогресс" }).click();
  await page.getByRole("button", { name: "Да, начать заново" }).click();
  await expect(
    page.getByRole("heading", { name: "I — RESTORED" }),
  ).toBeVisible();
  await expect(page.getByText(/PURGE, RELEASE, REPLACEMENT/)).toBeVisible();
});

test("recovery puzzles, three hints, four versions and audio recordings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({
        mode: "archive",
        unlocked: true,
        discovered: true,
        reduced: true,
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "/history/" }).click();
  for (const year of ["2003", "2004", "2007", "2026"]) {
    await page.getByRole("button", { name: new RegExp("^" + year) }).click();
    await expect(page.locator(".history-version")).toContainText(year);
  }
  await page.getByRole("button", { name: "/cctv/" }).click();
  for (const camera of ["CAM_01", "CAM_02", "CAM_03", "CAM_04"]) {
    await page.getByLabel("Камера").selectOption(camera);
    await expect(
      page.getByRole("img", {
        name: new RegExp(camera + " — архивный неподвижный кадр"),
      }),
    ).toBeVisible();
  }
  await expect(
    page.getByText(/отсутствует на сохранившемся плане/),
  ).toBeVisible();
  await page.getByRole("button", { name: "/recovery/" }).click();
  const log = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "LOG_2004.TXT" }) });
  for (let i = 0; i < 3; i++)
    await log.getByRole("button", { name: /Подсказка/ }).click();
  await expect(log.getByText("Заполните 00:01 и 00:02.")).toBeVisible();
  await log.getByLabel("Камера").fill("00:01");
  await log.getByLabel("Сервер").fill("00:02");
  await log.getByRole("button", { name: "Восстановить журнал" }).click();
  const memory = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "MEMORY.DAT" }) });
  for (let i = 0; i < 3; i++)
    await memory.getByRole("button", { name: /Подсказка/ }).click();
  await expect(memory.getByText(/2003, 2004, 2007, 2026/)).toBeVisible();
  await memory.getByLabel("Порядок").fill("2003,2004,2007,2026");
  await memory.getByLabel("Время кадра CAM_03").fill("00:01");
  await memory
    .getByRole("button", { name: "Проверить последовательность" })
    .click();
  await page.getByRole("button", { name: "/audio/" }).click();
  await expect(page.locator("audio")).toHaveCount(5);
  for (const audio of await page.locator("audio").all()) {
    await expect(audio).toHaveAttribute("controls", "");
    const src = await audio.getAttribute("src");
    const response = await page.request.get(src!);
    expect(response.status()).toBe(200);
  }
  for (const audio of await page.locator("audio").all()) {
    const played = await audio.evaluate(async (el: HTMLAudioElement) => {
      await el.play();
      el.pause();
      return el.paused && el.currentSrc.length > 0;
    });
    expect(played).toBe(true);
  }
  await page.getByText("Расшифровка").last().click();
  await expect(page.getByText(/Код восстановления: 000-0102/)).toBeVisible();
  await page.getByRole("button", { name: "/journal/", exact: true }).click();
  await expect(page.getByText(/LOG_2004.TXT/)).toBeVisible();
  await expect(page.getByText(/MEMORY.DAT/)).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("forum has 15 threads, quotes resolve and recovered post changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    );
  });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Разделы архива" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await expect(page.locator(".ib-thread")).toHaveCount(15);
  await expect(page.locator("#post-1370")).toContainText(
    "ответ удалён модератором",
  );
  const missing = await page
    .locator(".ib-thread a[href^='#post-']")
    .evaluateAll((links) =>
      links
        .map((a) => (a as HTMLAnchorElement).getAttribute("href")!.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
  expect(missing).toEqual([]);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "/recovery/" }).click();
  const log = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "LOG_2004.TXT" }) });
  await log.getByLabel("Камера").fill("00:01");
  await log.getByLabel("Сервер").fill("00:02");
  await log.getByRole("button", { name: "Восстановить журнал" }).click();
  await page
    .getByRole("navigation", { name: "Разделы архива" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await expect(page.locator("#post-1370")).toContainText("[восстановлено]");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("virtual desktop and every terminal command use only the fictional filesystem", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    );
    localStorage.setItem(
      "duality.incident.v1",
      JSON.stringify({
        version: 1,
        systemUnlocked: true,
        clues: [],
        visited: [],
        threads: [],
        files: [],
        choices: [],
        endings: [],
        lastEnding: null,
      }),
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: /SYSTEM_RECOVERY.EXE/ }).click();
  await expect(
    page.getByText("Виртуальная система изолирована от устройства."),
  ).toBeVisible();
  await page.getByRole("button", { name: "▣ Терминал" }).click();
  const input = page.locator("#terminal-command");
  const output = page.getByLabel("Вывод терминала");
  for (const [cmd, expected] of [
    ["help", "help dir cd type cls whoami date recover trace status unlock"],
    ["dir", "README.TXT"],
    ["whoami", "GUEST"],
    ["date", "17.04.2004"],
    ["status", "только для чтения"],
    ["trace 000", "CAM_03 00:01"],
    ["cd logs", "C:\\LOGS"],
    ["type LOG_2004.TXT", "запрос удаления 000"],
    ["cd users", "C:\\USERS"],
    ["type ADMIN_NOTES.TXT", "000-0102"],
    ["unlock nope", "Неверный код"],
    ["unlock 000-0102", "Код принят"],
    ["foobar", "Неизвестная команда"],
  ]) {
    await input.fill(cmd);
    await page.getByRole("button", { name: "Выполнить" }).click();
    await expect(output).toContainText(expected);
  }
  await input.press("ArrowUp");
  await expect(input).toHaveValue("foobar");
  await input.fill("cls");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await expect(output).toBeEmpty();
  const title = page
    .locator(".system-window")
    .filter({ has: page.getByLabel("Вывод терминала") })
    .locator(".system-title");
  const before = await title.locator("..").getAttribute("style");
  const box = await title.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 20, box!.y + 10);
  await page.mouse.down();
  await page.mouse.move(box!.x + 35, box!.y + 25);
  await page.mouse.up();
  const after = await title.locator("..").getAttribute("style");
  expect(after).not.toBe(before);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) {
    await title.scrollIntoViewIfNeeded();
    const touchBox = await title.boundingBox();
    expect(touchBox).not.toBeNull();
    const cdp = await page.context().newCDPSession(page);
    const x = Math.round(touchBox!.x + 20),
      y = Math.round(touchBox!.y + 10);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - 10, y: y + 20 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    const afterTouch = await title.locator("..").getAttribute("style");
    expect(afterTouch).not.toBe(after);
    await cdp.detach();
  }
  await page.getByRole("button", { name: "Закрыть Терминал" }).click();
  await expect(page.getByLabel("Вывод терминала")).toHaveCount(0);
  await page.getByRole("button", { name: "▣ Терминал" }).click();
  await input.fill("recover IMAGE_017.JPG");
  await page.getByRole("button", { name: "Выполнить" }).click();
  await expect(
    page.getByRole("heading", { name: "IMAGE_017.JPG" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("Internet Explorer history follows incident sections", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "/history/" }).click();
  await expect(page.locator(".ie-address-value")).toContainText("/history/");
  await page.getByRole("button", { name: "/audio/" }).click();
  await expect(page.locator(".ie-address-value")).toContainText("/audio/");
  await page.getByRole("button", { name: "Назад", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "/history/ — версии архива" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Вперёд", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "/audio/ — архив записей" }),
  ).toBeVisible();
});

test("incident remains usable across archive pages when storage is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("denied");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Исследовать деталь" }).click();
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("ECHO-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await expect(
    page.getByRole("heading", { name: "Вы нашли другую сторону." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page
    .getByRole("navigation", { name: "Разделы INCIDENT 000" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await page.getByRole("button", { name: "Прочитать ответ №000" }).click();
  await page
    .getByRole("button", { name: "Сохранить заметку модератора" })
    .click();
  await page.getByRole("button", { name: "/about/", exact: true }).click();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(
    page.getByRole("heading", { name: "III — IMAGE_017" }),
  ).toBeVisible();
});

test("virtual explorer, notepad, recycle bin, viewer and start menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    );
    localStorage.setItem(
      "duality.incident.v1",
      JSON.stringify({
        version: 1,
        systemUnlocked: true,
        clues: [],
        visited: [],
        threads: [],
        files: [],
        choices: [],
        endings: [],
        lastEnding: null,
      }),
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: /SYSTEM_RECOVERY.EXE/ }).click();
  await page.getByLabel("Каталог").selectOption("C:\\LOGS");
  await page.getByRole("button", { name: "USER_000.LOG", exact: true }).click();
  await expect(page.getByText(/Я помню этот рабочий стол/)).toBeVisible();
  await page.getByRole("button", { name: "▣ Корзина" }).click();
  await expect(
    page.getByText(/Данные оказались в резервной копии/),
  ).toBeVisible();
  await page.getByRole("button", { name: "▦ Пуск" }).click();
  await page
    .locator(".system-taskbar")
    .getByRole("button", { name: "Просмотр изображений", exact: true })
    .click();
  await expect(
    page.getByAltText("Архивный кадр лестницы CAM_03"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Закрыть Просмотр изображений" })
    .click();
  await expect(page.getByAltText("Архивный кадр лестницы CAM_03")).toHaveCount(
    0,
  );
  await page
    .locator(".system-taskbar")
    .getByRole("button", { name: "Проводник", exact: true })
    .click();
  await expect(
    page.locator(".system-window").filter({ has: page.getByLabel("Каталог") }),
  ).toHaveCSS("z-index", "2");
  await page.getByRole("button", { name: "/journal/", exact: true }).click();
  await expect(page.getByText(/USER_000.LOG/)).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("archive memory responds to discoveries and a return visit", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(
    page.getByText("Этот файл никто не открывал с 2004 года."),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Разделы INCIDENT 000" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await page.getByRole("button", { name: "Прочитать ответ №000" }).click();
  await page
    .getByRole("button", { name: "Сохранить заметку модератора" })
    .click();
  await page.getByRole("button", { name: "/journal/", exact: true }).click();
  await expect(page.getByText(/Ты не должен был это открывать/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(
    page.getByText("Этот браузер уже открывал журнал."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "III — IMAGE_017" }),
  ).toBeVisible();
});

test("archive documents and selected threads enter the investigation journal", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /readme.txt/ }).click();
  await page.getByRole("button", { name: /image_017.jpg/ }).click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "Разделы архива" })
    .getByRole("button", { name: "/threads/", exact: true })
    .click();
  await page.getByRole("button", { name: "[Открыть тред]" }).first().click();
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await expect(page.getByText(/README.NFO/)).toBeVisible();
  await expect(page.getByText(/IMAGE_017.JPG/)).toBeVisible();
  await expect(page.getByText(/Треды: 1273/)).toBeVisible();
});
