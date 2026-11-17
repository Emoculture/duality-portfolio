export type ArchivePage =
  | "home"
  | "projects"
  | "threads"
  | "about"
  | "files"
  | "logs"
  | "zero"
  | "investigation";
export const boards: {
  code: string;
  title: string;
  category: string;
  page: ArchivePage;
}[] = [
  { code: "dev", title: "Проекты", category: "Разработка", page: "projects" },
  { code: "me", title: "Об авторе", category: "Разработка", page: "about" },
  { code: "lost", title: "Потерянные файлы", category: "Архив", page: "files" },
  { code: "log", title: "Журналы", category: "Архив", page: "logs" },
  { code: "x", title: "Паранормальное", category: "Другое", page: "threads" },
  { code: "000", title: "Пользователь №000", category: "Другое", page: "zero" },
];
export interface ArchivePost {
  id: string;
  date: string;
  text: string;
  image?: string;
  alt?: string;
  quote?: string;
  green?: string;
  zero?: boolean;
}
export interface ArchiveThread {
  id: string;
  title: string;
  board: string;
  posts: ArchivePost[];
}
export const threads: ArchiveThread[] = [
  {
    id: "1273",
    title: "Кто-нибудь помнит этот адрес?",
    board: "x",
    posts: [
      {
        id: "1273",
        date: "17/04/04(Sat)00:01",
        text: "Нашёл резервную копию на старом диске. Все страницы на месте, но в списке пользователей только одна запись. Нулевая.",
        image: "terminal",
        alt: "Зернистый архивный рисунок старого монитора в пустой комнате",
      },
      {
        id: "1274",
        date: "17/04/04(Sat)00:03",
        quote: "1273",
        green: "> на снимке нет людей",
        text: "Но монитор включён. Кто-то должен был его включить.",
        image: "terminal",
        alt: "Тот же монитор, свет в комнате погас",
      },
      {
        id: "1275",
        date: "17/04/04(Sat)--:--",
        quote: "1274",
        zero: true,
        text: "Это не резервная копия человека. Это резервная копия места, в котором его ждали. Пока кто-то открывает страницу, место существует.",
      },
    ],
  },
  {
    id: "1278",
    title: "Комната без адреса",
    board: "lost",
    posts: [
      {
        id: "1278",
        date: "19/04/04(Mon)03:12",
        text: "Сравнил два снимка. На первом монитор был выключен. На втором появилось слово HERE. Никто не загружал второй снимок.",
        image: "hall",
        alt: "Пустой коридор с освещённым дверным проёмом",
      },
      {
        id: "1279",
        date: "19/04/04(Mon)03:16",
        quote: "1273",
        green: "> все страницы на месте",
        text: "Не все. В журнале есть запись №017, а в каталоге — пустая строка. Посмотрите, что осталось от IMAGE_017.",
      },
      {
        id: "1280",
        date: "19/04/04(Mon)03:17",
        quote: "1278",
        text: "№000: «Комнаты меняются, когда в них возвращаются».",
      },
    ],
  },
  {
    id: "1284",
    title: "Ноль — тоже номер",
    board: "dev",
    posts: [
      {
        id: "1284",
        date: "20/04/04(Tue)01:07",
        text: "В старом коде первая запись имеет индекс 0. Может, он не посторонний. Может, это самая первая версия владельца, которую забыли при обновлении?",
        image: "disk",
        alt: "Архивный рисунок дискеты с выцветшей наклейкой 000",
      },
      {
        id: "1285",
        date: "20/04/04(Tue)01:09",
        quote: "1275",
        green: "> место существует",
        text: "№000: «Ты почти вспомнил». У него не было прав писать сообщения. Только читать. В AFTER.TXT есть четыре строки, которые он перечитывал чаще всего.",
      },
    ],
  },
];
export const imageSource = (name: string) =>
  `/archive/${name}.${name === "corridor" ? "png" : "svg"}`;
