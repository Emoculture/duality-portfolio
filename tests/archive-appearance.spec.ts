import { test, expect } from "@playwright/test";
import { enterSavedArchive } from "./navigation";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const clues = ["thread", "moderator", "image", "camera", "system", "dialogue"];
const initial = {
  version: 1,
  visited: [],
  threads: [],
  files: [],
  clues: [],
  choices: [],
  endings: [],
  systemUnlocked: false,
  lastEnding: null,
};

async function openArchive(page: import("@playwright/test").Page) {
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
}

test("all seven portrait stages use the original file and survive reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openArchive(page);
  const portrait = page.locator(".retro-avatar-button [data-avatar-stage]");
  const hashes = new Set<string>();
  for (let n = 0; n < 7; n++) {
    await page.evaluate(
      (s) => localStorage.setItem("duality.incident.v1", JSON.stringify(s)),
      { ...initial, clues: clues.slice(0, n) },
    );
    await page.reload();
  await enterSavedArchive(page);
    await expect(portrait).toHaveAttribute("data-avatar-stage", String(n + 1));
    if (n === 0) {
      await expect(portrait).toHaveAttribute("src", "/archive/user-000.png");
      expect(await portrait.evaluate((el) => el.tagName)).toBe("IMG");
    } else {
      await expect(portrait).toHaveAttribute("data-avatar-ready", "true");
      const data = await portrait.evaluate((el: HTMLCanvasElement) =>
        el.toDataURL(),
      );
      hashes.add(createHash("sha256").update(data).digest("hex"));
      expect(
        await portrait.evaluate((el: HTMLCanvasElement) => {
          const p = el
            .getContext("2d")!
            .getImageData(0, 0, el.width, el.height).data;
          let visible = 0;
          for (let i = 3; i < p.length; i += 4) if (p[i]) visible++;
          return visible;
        }),
      ).toBeGreaterThan(10000);
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  expect(hashes.size).toBe(6);
  const threadPortrait = page.locator(
    ".retro-avatar-button [data-avatar-stage]",
  );
  await expect(threadPortrait).toHaveAttribute("data-avatar-stage", "7");
  await page
    .getByRole("button", { name: "Профиль пользователя №000", exact: true })
    .click();
  await expect(page.locator(".retro-profile-avatar")).toHaveAttribute(
    "data-avatar-stage",
    "7",
  );
  await expect(page.locator(".retro-profile-avatar")).toHaveAttribute(
    "data-avatar-ready",
    "true",
  );
  const hash = createHash("sha256")
    .update(readFileSync("public/archive/user-000.png"))
    .digest("hex");
  expect(hash).toBe(
    "6cdb964ad9febe6ee58faa1e81e4cd7cc29488a1be6b5625837826fcba7e5ef9",
  );
});

test("chapter progress updates portrait live and reset restores the original", async ({
  page,
}) => {
  await openArchive(page);
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  await nav.getByRole("button", { name: "/threads/", exact: true }).click();
  await page.getByRole("button", { name: "Прочитать ответ №000" }).click();
  const portrait = page.locator(".retro-avatar-button [data-avatar-stage]");
  await expect(portrait).toHaveAttribute("data-avatar-stage", "2");
  await expect(portrait).toHaveAttribute("data-avatar-ready", "true");
  await page
    .getByRole("button", { name: "Сохранить заметку модератора" })
    .click();
  await expect(portrait).toHaveAttribute("data-avatar-stage", "3");
  await page.reload();
  await enterSavedArchive(page);
  await expect(portrait).toHaveAttribute("data-avatar-stage", "3");
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  await page.getByRole("button", { name: "Сбросить игровой прогресс" }).click();
  await page.getByRole("button", { name: "Да, начать заново" }).click();
  await expect(portrait).toHaveAttribute("data-avatar-stage", "1");
  await expect(portrait).toHaveAttribute("src", "/archive/user-000.png");
});

test("directory labels navigate with the story palette in dark system mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({
        mode: "archive",
        unlocked: true,
        discovered: true,
        reduced: true,
      }),
    );
    localStorage.setItem(
      "duality.incident.v1",
      JSON.stringify({
        version: 1,
        visited: [],
        threads: [],
        files: [],
        clues: [],
        choices: [],
        endings: ["REPLACEMENT"],
        systemUnlocked: false,
        lastEnding: "REPLACEMENT",
      }),
    );
    localStorage.setItem("theme", "dark");
  });
  await page.goto("/");
  await enterSavedArchive(page);
  const shell = page.locator(".archive-board");
  await expect(shell).toHaveCSS("color-scheme", /light/);
  await expect(page.locator(".ie-titlebar")).toHaveCSS(
    "background-color",
    "rgb(8, 21, 101)",
  );
  await expect(page.locator(".ib-shell")).toHaveCSS(
    "background-color",
    "rgb(40, 46, 41)",
  );
  await expect(page.locator(".retro-layout")).toHaveCSS(
    "background-color",
    "rgb(16, 23, 17)",
  );
  await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
  const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
  for (const label of [
    "/journal/",
    "/threads/",
    "/recovery/",
    "/cctv/",
    "/system/",
    "/history/",
    "/audio/",
    "/user_000/",
    "/ending/",
  ]) {
    const button = nav.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".ie-address-value")).toContainText(label);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  await page.reload();
  await enterSavedArchive(page);
  await expect(page.locator(".ie-titlebar")).toHaveCSS(
    "background-color",
    "rgb(8, 21, 101)",
  );
  await expect(page.locator(".ib-shell")).toHaveCSS(
    "background-color",
    "rgb(40, 46, 41)",
  );
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-color-scheme: dark)").matches,
    ),
  ).toBe(true);
});

test("document, archive and native controls have the same colours in both system themes", async ({
  page,
}) => {
  await openArchive(page);
  const snapshot = async (scheme: "light" | "dark") => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.reload();
  await enterSavedArchive(page);
    await expect(page.locator(".archive-board")).toBeVisible();
    await page.mouse.move(0, 0);

    const styles = async (selector: string) => {
      const locator = page.locator(selector).first();
      await expect(locator).toBeVisible();
      return locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          background: style.backgroundColor,
          border: style.borderColor,
          colorScheme: style.colorScheme,
          scrollbarColor: style.scrollbarColor,
        };
      });
    };

    const home = {
      html: await styles("html"),
      body: await styles("body"),
      root: await styles("#root"),
      archive: await styles(".archive-board"),
      shell: await styles(".ib-shell"),
      layout: await styles(".retro-layout"),
      title: await styles(".retro-right h2"),
      link: await styles(".retro-left .ib-nav button"),
      button: await styles(".ie-toolbar button:not(:disabled)"),
    };
    await page.getByRole("button", { name: "INCIDENT_000.TXT" }).click();
    const nav = page.getByRole("navigation", { name: "Разделы INCIDENT 000" });
    await nav.getByRole("button", { name: "/recovery/", exact: true }).click();
    const input = await styles('.incident input[placeholder="00:00"]');
    await nav.getByRole("button", { name: "/cctv/", exact: true }).click();
    const select = await styles(".incident select");
    const range = await styles('.incident input[type="range"]');
    return { home, input, select, range };
  };

  const light = await snapshot("light");
  const dark = await snapshot("dark");
  expect(dark).toEqual(light);
  for (const element of [light.home.html, light.home.body, light.home.root]) {
    expect(element.colorScheme).toContain("light");
  }
  expect(light.home.archive.background).toBe("rgb(234, 230, 216)");
  expect(light.home.title.color).toBe("rgb(112, 37, 37)");
});

test("portrait is static with reduced motion and NORMAL stays unchanged", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(
    ({ state, progress }) => {
      localStorage.setItem("duality.v1", JSON.stringify(state));
      localStorage.setItem("duality.incident.v1", JSON.stringify(progress));
    },
    {
      state: { mode: "archive", unlocked: true, discovered: true },
      progress: { ...initial, clues },
    },
  );
  await page.reload();
  await enterSavedArchive(page);
  const portrait = page.locator(".retro-avatar-button canvas");
  await expect(portrait).toHaveAttribute("data-avatar-stage", "7");
  await expect(portrait).toHaveAttribute("data-avatar-ready", "true");
  const first = await portrait.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  await page.waitForTimeout(150);
  expect(
    await portrait.evaluate((el: HTMLCanvasElement) => el.toDataURL()),
  ).toBe(first);
  await expect(portrait).toHaveCSS("animation-name", "none");
  await page.evaluate(() =>
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "normal", unlocked: true, discovered: true }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Войти на сайт" }).click();
  await expect(page.locator(".portfolio")).toBeVisible();
  await expect(
    page.locator(".portfolio canvas, .portfolio [data-avatar-stage]"),
  ).toHaveCount(0);
});

test("story palette preserves the intentionally dark PURGE scene", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem(
      "duality.v1",
      JSON.stringify({ mode: "archive", unlocked: true, discovered: true }),
    );
    localStorage.setItem(
      "duality.incident.v1",
      JSON.stringify({
        version: 1,
        visited: [],
        threads: [],
        files: [],
        clues: [
          "thread",
          "moderator",
          "image",
          "camera",
          "system",
          "dialogue",
          "decision",
        ],
        choices: ["PURGE"],
        endings: ["PURGE"],
        systemUnlocked: true,
        lastEnding: "PURGE",
      }),
    );
  });
  await page.goto("/");
  await enterSavedArchive(page);
  await expect(page.locator(".ie-titlebar")).toHaveCSS(
    "background-color",
    "rgb(8, 21, 101)",
  );
  await expect(page.locator(".ib-shell")).toHaveCSS(
    "background-color",
    "rgb(40, 46, 41)",
  );
  await expect(page.locator(".purged-home")).toHaveCSS(
    "background-color",
    "rgb(23, 28, 25)",
  );
  await expect(page.locator(".purged-home")).toContainText("1 FILE REMAINS");
  await page.getByRole("button", { name: "Открыть оставшийся файл" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Разделы INCIDENT 000" })
      .getByRole("button", { name: "/journal/" }),
  ).toBeVisible();
});
