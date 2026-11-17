import { test, expect, type Page } from "@playwright/test";
import { enterSavedArchive } from "./navigation";
async function enterGame(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Исследовать деталь" }).click();
  await expect(page.getByRole("heading", { name: "README.TXT" })).toBeVisible();
}
async function win(page: Page) {
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("echo-04-17");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await expect(page.getByText("ACCESS GRANTED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Пропустить" }).click();
  await page.getByRole("button", { name: "Пропустить запись" }).click();
  await expect(
    page.getByRole("heading", { name: "Вы нашли другую сторону." }),
  ).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}
test("welcome and full professional portfolio", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Всё начинается/ }),
  ).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "Войти на сайт" }).click();
  await expect(
    page.getByRole("heading", { name: /Создаю цифровое/ }),
  ).toBeVisible();
  for (const id of ["about", "skills", "projects", "services", "contact"])
    await expect(page.locator("#" + id)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Вернуться в архив" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Открыть CUT CULTURE" }),
  ).toHaveAttribute("href", "https://cut-culture.vercel.app/");
  await noOverflow(page);
  await page.reload();
  await page.getByRole("button", { name: "Войти на сайт" }).click();
  await expect(page.locator("#home")).toBeVisible();
  expect(errors).toEqual([]);
});
test("files, wrong password, correct password, archive puzzle and persistence", async ({
  page,
}) => {
  await enterGame(page);
  await expect(page.getByText("ECHO", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /LOG_2004.TXT/ }).click();
  await expect(page.getByText("04", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /IMAGE_017.JPG/ }).click();
  await expect(page.getByText("17", { exact: true })).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: /ACCESS.EXE/ }).click();
  await page.getByLabel("Ключ доступа").fill("wrong");
  await page.getByRole("button", { name: "Открыть архив" }).click();
  await expect(page.getByRole("alert")).toContainText("Ключ не совпал");
  await win(page);
  await noOverflow(page);
  await page.getByRole("button", { name: "/projects/", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Открыть CUT CULTURE" }),
  ).toHaveAttribute("href", "https://cut-culture.vercel.app/");
  await page.getByRole("button", { name: "/threads/", exact: true }).click();
  await expect(
    page.getByText("Пользователь №000", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Найти AFTER.TXT" }).click();
  await page.getByLabel("Последнее слово").fill("test");
  await page.getByRole("button", { name: "Оставить свет" }).click();
  await expect(page.getByText("Прочитайте первую букву")).toBeVisible();
  await page.getByLabel("Последнее слово").fill("stay");
  await page.getByRole("button", { name: "Оставить свет" }).click();
  await expect(
    page.getByText("LIGHT_KEEPER / СКРЫТАЯ ЗАПИСЬ ВОССТАНОВЛЕНА"),
  ).toBeVisible();
  await noOverflow(page);
  await page.reload();
  await enterSavedArchive(page);
  await expect(
    page.getByRole("heading", { name: "Вы нашли другую сторону." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await page.getByRole("button", { name: /Уменьшение анимаций/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-reduced", "true");
  await page
    .getByRole("button", { name: "Пройти входную игру заново" })
    .click();
  await expect(page.getByRole("heading", { name: "README.TXT" })).toBeVisible();
  await page.getByRole("button", { name: "В обычное портфолио" }).click();
  await expect(page.locator("#home")).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "Вернуться в архив" }).click();
  await expect(page.getByRole("heading", { name: "README.TXT" })).toBeVisible();
});
test("keyboard access, session exit and denied storage", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("denied");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Войти на сайт" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#home")).toBeVisible();
  await page.getByRole("button", { name: /DUALITY/ }).click();
  await enterGame(page);
  await win(page);
  await page
    .getByRole("button", { name: "Завершить сеанс", exact: true })
    .click();
  await expect(page.locator("#home")).toBeVisible();
});

test("320px layout across every reality and archive section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await noOverflow(page);
  await page.getByRole("button", { name: "Войти на сайт" }).click();
  await noOverflow(page);
  await page.getByRole("button", { name: /DUALITY/ }).click();
  await enterGame(page);
  await noOverflow(page);
  await win(page);
  for (const section of ["home", "projects", "threads", "about", "files"]) {
    await page
      .getByRole("button", { name: `/${section}/`, exact: true })
      .click();
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await noOverflow(page);
});

test("classic imageboard boards, cross-thread quotes, thumbnails and hidden records", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({
        mode: "archive",
        unlocked: true,
        discovered: true,
        puzzle: true,
        reduced: true,
      }),
    ),
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await enterSavedArchive(page);
  await expect(page.getByRole("heading", { name: /Boards/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Popular Threads/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Stats/ })).toBeVisible();
  await expect(page.locator(".retro-layout")).toBeVisible();
  await expect(page.locator(".ie-titlebar")).toBeVisible();
  for (const name of [
    "/dev/ — Проекты",
    "/me/ — Об авторе",
    "/lost/ — Потерянные файлы",
    "/x/ — Паранормальное",
    "/log/ — Журналы",
    "/000/ — Пользователь №000",
  ])
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Открыть тред: Комната без адреса" })
    .click();
  await expect(page.locator("#post-1278")).toBeVisible();
  await page.getByRole("link", { name: ">>1273", exact: true }).click();
  await expect(page.locator("#post-1273")).toBeFocused();
  await expect(page.locator("#post-1278")).toHaveCount(0);
  await page.getByRole("button", { name: "Увеличить снимок 1273" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Увеличить снимок 1273" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "/home/", exact: true }).click();
  await page
    .getByRole("button", { name: "/log/ — Журналы", exact: true })
    .click();
  await page.getByText("RECORD_017 — показать запись").click();
  await expect(
    page.getByText("[ запись исчезла из последней копии ]", { exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "/home/", exact: true }).click();
  await page
    .getByRole("button", { name: "/000/ — Пользователь №000", exact: true })
    .click();
  await page.getByRole("button", { name: "№000", exact: true }).click();
  await expect(page.getByText(/Спасибо, что заметили/)).toBeVisible();
  await page.getByText("Просмотреть заголовки страницы").click();
  await page
    .getByRole("button", { name: "Открыть оставшуюся страницу" })
    .click();
  await expect(
    page.getByText("Файл создан: после вашего входа."),
  ).toBeVisible();
  await expect(
    page.getByText("LIGHT_KEEPER / СКРЫТАЯ ЗАПИСЬ ВОССТАНОВЛЕНА"),
  ).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("investigation clues, hints, persistence, ending and replay at 320px", async ({
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
        puzzle: false,
        reduced: true,
      }),
    ),
  );
  await page.goto("/");
  await enterSavedArchive(page);
  await page.getByRole("button", { name: /INVESTIGATION.TXT/ }).click();
  await page.getByRole("button", { name: "Подсказка" }).click();
  await expect(
    page.getByText("В рамке под текстом есть кнопка с номером сообщения."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Открыть скрытое сообщение No.1273" })
    .click();
  await page.getByRole("button", { name: "Записать улику" }).click();
  await page.getByLabel("Ответ").fill("wrong");
  await page.getByRole("button", { name: "Проверить" }).click();
  await expect(page.getByRole("status")).toContainText("Ответ не совпал");
  for (const answer of ["RECOVER", "1", "STAY", "ECHO-17-01", "STAY-COPY"]) {
    await page.getByLabel("Ответ").fill(answer);
    await page.getByRole("button", { name: "Проверить" }).click();
  }
  await expect(page.getByText("Найдено улик: 6 / 6")).toBeVisible();
  await expect(
    page.getByText(/Восстановление не вызвало появление/),
  ).toBeVisible();
  await noOverflow(page);
  await page.reload();
  await enterSavedArchive(page);
  await page.getByRole("button", { name: /INVESTIGATION.TXT/ }).click();
  await expect(page.getByText("Найдено улик: 6 / 6")).toBeVisible();
  await page
    .getByRole("button", { name: "Начать расследование заново" })
    .click();
  await expect(page.getByText("Найдено улик: 0 / 6")).toBeVisible();
});

test("project filters and repository links in both modes", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({
        mode: "normal",
        unlocked: true,
        discovered: true,
        reduced: true,
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Войти на сайт" }).click();
  await page
    .getByLabel("Фильтр проектов")
    .selectOption({ label: "TELEGRAM MINI APP" });
  await expect(
    page.getByRole("heading", { name: "Director Studio" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "LUNA NAILS" })).toHaveCount(
    0,
  );
  await page.getByText("Подробнее", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Репозиторий GitHub" }),
  ).toHaveAttribute("href", "https://github.com/Emoculture/prompt-craft-");
  await page.getByRole("button", { name: "Вернуться в архив" }).click();
  await page.getByRole("button", { name: "/projects/", exact: true }).click();
  await page
    .getByLabel("Фильтр:")
    .selectOption({ label: "ДЕМОНСТРАЦИОННЫЙ САЙТ" });
  await expect(page.getByRole("heading", { name: "LUNA NAILS" })).toBeVisible();
  await page.getByText("Техническая запись").click();
  await expect(
    page.getByRole("link", { name: "Репозиторий GitHub" }),
  ).toHaveAttribute("href", "https://github.com/Emoculture/luna-nails");
});

test("retro browser history, files and window controls", async ({ page }) => {
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
  await enterSavedArchive(page);
  await expect(
    page.getByText("/archive/ — Личный архив — Microsoft Internet Explorer"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Назад", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "/projects/", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Каталог работ/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "/about/", exact: true }).click();
  await page.getByRole("button", { name: "Назад", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Каталог работ/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Вперёд", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Об авторе/ })).toBeVisible();
  await page.getByRole("button", { name: "Домой", exact: true }).click();
  await page.getByRole("button", { name: /log_2004.txt/ }).click();
  await expect(
    page.getByRole("heading", { name: /Журнал восстановления/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /readme.txt/ }).click();
  await expect(page.getByRole("heading", { name: "README.NFO" })).toBeVisible();
  await page.getByRole("button", { name: /image_017.jpg/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /\?\?\?.bin/ }).click();
  await expect(
    page.getByRole("heading", { name: "THE USER WHO NEVER LEFT" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Свернуть окно" }).click();
  await expect(page.locator(".retro-layout")).toBeHidden();
  await page.getByRole("button", { name: "Восстановить окно" }).click();
  await expect(page.locator(".retro-layout")).toBeVisible();
  await page.getByRole("button", { name: "Уменьшить окно" }).click();
  await expect(page.locator(".ib-shell")).toHaveClass(/ie-windowed/);
  await page.getByRole("button", { name: "Развернуть окно" }).click();
  await expect(page.locator(".ib-shell")).not.toHaveClass(/ie-windowed/);
  await noOverflow(page);
});

test("home quotes, project search and portrait", async ({ page }) => {
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
  await enterSavedArchive(page);
  await expect(page.locator(".retro-avatar-button img")).toHaveAttribute(
    "src",
    "/archive/user-000.png",
  );
  await page
    .locator(".retro-replies")
    .getByRole("button", { name: ">>1273", exact: true })
    .click();
  await expect(page.locator("#post-1273")).toBeFocused();
  await page.getByRole("button", { name: "Домой", exact: true }).click();
  await page
    .locator(".retro-replies")
    .getByRole("button", { name: ">>1274", exact: true })
    .click();
  await expect(page.locator("#post-1274")).toBeFocused();
  await expect(page.locator(".retro-thread-avatar")).toHaveAttribute(
    "src",
    "/archive/user-000.png",
  );
  await page.getByRole("button", { name: "Поиск", exact: true }).click();
  await page.getByLabel("Поиск по проектам").fill("LUNA");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.getByRole("heading", { name: "LUNA NAILS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CUT CULTURE" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Профиль пользователя №000", exact: true }).click();
  await expect(page.locator(".retro-profile-avatar")).toHaveAttribute(
    "src",
    "/archive/user-000.png",
  );
  await noOverflow(page);
});
