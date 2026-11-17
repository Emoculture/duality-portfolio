import { useState } from "react";
import { files, names } from "./files";
export default function Terminal({
  onUnlock,
  onRecover,
  administrator,
}: {
  onUnlock: () => void;
  onRecover: () => void;
  administrator: boolean;
}) {
  const [dir, setDir] = useState("C:\\ARCHIVE");
  const [line, setLine] = useState("");
  const [out, setOut] = useState<string[]>([
    "DUALITY RECOVERY TERMINAL / virtual filesystem",
    "Введите help.",
  ]);
  const [commands, setCommands] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  function run(raw: string) {
    const [command, ...rest] = raw.trim().split(/\s+/);
    const arg = rest.join(" ").toUpperCase();
    let answer = "";
    switch (command?.toLowerCase()) {
      case "help":
        answer = "help dir cd type cls whoami date recover trace status unlock";
        break;
      case "dir":
        answer =
          Object.keys(files[dir]).join("  ") +
          "\nКаталоги: " +
          names.join("  ");
        break;
      case "cd": {
        const target =
          arg === ".."
            ? "C:\\ARCHIVE"
            : arg.startsWith("C:")
              ? arg
              : "C:\\" + arg;
        if (names.includes(target)) {
          setDir(target);
          answer = target;
        } else answer = "Каталог не найден.";
        break;
      }
      case "type":
        answer = files[dir][arg] || "Файл не найден в текущем каталоге.";
        break;
      case "cls":
        setOut([]);
        return;
      case "whoami":
        answer = administrator
          ? "ADMINISTRATOR / №000"
          : "GUEST / локальный игровой профиль";
        break;
      case "date":
        answer = "17.04.2004 / архивная метка";
        break;
      case "recover":
        if (arg === "IMAGE_017.JPG") {
          answer = "Открываю восстановление изображения.";
          onRecover();
        } else answer = "Используйте recover IMAGE_017.JPG";
        break;
      case "trace":
        answer =
          arg === "000"
            ? "Трассировка: CAM_03 00:01 → SERVER 00:02 → ADMIN 00:03."
            : "Используйте trace 000";
        break;
      case "status":
        answer =
          "Архив доступен только для чтения. Система восстановлена частично.";
        break;
      case "unlock":
        if (arg === "000-0102") {
          answer = "Код принят. Доступ администратора восстановлен.";
          onUnlock();
        } else answer = "Неверный код. Смотрите C:\\USERS\\ADMIN_NOTES.TXT.";
        break;
      default:
        answer = "Неизвестная команда. Введите help.";
    }
    setOut((o) => [...o, `${dir}> ${raw}`, answer]);
  }
  return (
    <div>
      <div
        className="terminal-output"
        aria-label="Вывод терминала"
        aria-live="polite"
      >
        {out.map((v, i) => (
          <pre key={i}>{v}</pre>
        ))}
      </div>
      <form
        className="terminal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!line.trim()) return;
          run(line);
          setCommands((c) => [...c, line]);
          setIndex(commands.length + 1);
          setLine("");
        }}
      >
        <label htmlFor="terminal-command">{dir}&gt;</label>
        <input
          id="terminal-command"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const n = Math.max(0, index - 1);
              setIndex(n);
              setLine(commands[n] || "");
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = Math.min(commands.length, index + 1);
              setIndex(n);
              setLine(commands[n] || "");
            }
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <button>Выполнить</button>
      </form>
    </div>
  );
}
