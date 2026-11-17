import { useState } from "react";
const versions = {
  "2003": {
    name: "ORIGINAL",
    tone: "original",
    thread:
      "No.003 / Anonymous: Кто будет модератором раздела? Пока форум открыт для всех.",
    file: "WELCOME.TXT",
    text: "Первоначальный форум. Запись служебного администратора существовала; настоящее имя автора портфолио неизвестно.",
  },
  "2004": {
    name: "INCIDENT",
    tone: "incident",
    thread:
      "No.1273 / Anonymous: Ответ №000 появился раньше создания темы. Время камеры — 00:01, сервера — 00:02.",
    file: "SERVER.LOG",
    text: "00:03 — запрос удаления учётной записи №000. 00:04 — сервер остановлен.",
  },
  "2007": {
    name: "RECOVERY",
    tone: "recovery",
    thread:
      "No.1390 / Anonymous: Таблица пользователей отсутствует в образе. Повторное восстановление завершилось ошибкой.",
    file: "RECOVERY.LOG",
    text: "[Запись о создателе отсутствует.] Дамп загружен без администратора; копия не смогла завершить ответ.",
  },
  "2026": {
    name: "RESTORED",
    tone: "restored",
    thread:
      "No.1410 / Anonymous: Сайт вернулся. Это кто-то выложил старый HTML?",
    file: "RESTORED.TXT",
    text: "Архив появился внутри портфолио. Старые документы снова доступны для чтения.",
  },
} as const;
type Year = keyof typeof versions;
export default function History({
  onFile,
}: {
  onFile: (name: string) => void;
}) {
  const [year, setYear] = useState<Year>("2003");
  const v = versions[year];
  return (
    <div>
      <h3>/history/ — версии архива</h3>
      <div className="incident-choice">
        {(Object.keys(versions) as Year[]).map((y) => (
          <button key={y} aria-pressed={year === y} onClick={() => setYear(y)}>
            {y} — {versions[y].name}
          </button>
        ))}
      </div>
      <section className={`history-version history-${v.tone}`}>
        <header>
          DUALITY ARCHIVE / {year} / {v.name}
        </header>
        <h4>Треды</h4>
        <p>{v.thread}</p>
        <h4>Файлы</h4>
        <button onClick={() => onFile(v.file)}>Открыть {v.file}</button>
        <pre>{v.text}</pre>
        <p>История и даты этого раздела вымышлены.</p>
      </section>
    </div>
  );
}
