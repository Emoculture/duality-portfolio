import { test, expect, type Page } from "@playwright/test";
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
  await page.getByRole("button", { name: "Продолжить" }).click();
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
  await page.getByRole("button", { name: "Продолжить" }).focus();
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
  await page.getByRole("button", { name: "Продолжить" }).click();
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
