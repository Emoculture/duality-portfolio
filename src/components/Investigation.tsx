import { useState } from "react";
import "./investigation.css";
const stages = [
  {
    chapter: "01 — Последний активный пользователь",
    title: "Скрытое сообщение",
    body: "17.04.2004 / Anonymous: «Форум опять тормозит. У кого-нибудь ещё пустой ответ под моим постом?»\nAnonymous: «Он не пустой. Выдели место после номера сообщения».",
    prompt: "Найдите сообщение под записью No.1273. Нажмите пустой фрагмент.",
    hint: "В рамке под текстом есть кнопка с номером сообщения.",
    answer: "",
    clue: "ECHO",
  },
  {
    chapter: "02 — Файл, которого не было",
    title: "Восстановить RECOVER.TXT",
    body: "[файл повреждён]\nRE_O_ER\n\nAnonymous: «Копия файла называется RECOVER. В тексте не хватает двух букв, но оригинальное имя сохранилось».",
    prompt: "Введите восстановленное слово целиком.",
    hint: "Имя файла до точки: RECOVER.",
    answer: "RECOVER",
    clue: "17",
  },
  {
    chapter: "03 — Несуществующая дата",
    title: "Сверить журнал",
    body: "SERVER.LOG: 17/04/2004 00:02 — создание треда №1273.\nBACKUP.LOG: 17/04/2004 00:01 — ответ №000 на тред №1273.\nAnonymous: «Как он ответил раньше? Проверь минуты, а не часы».",
    prompt: "На сколько минут ответ опередил создание треда? Введите число.",
    hint: "Разница между 00:01 и 00:02 — одна минута.",
    answer: "1",
    clue: "01",
  },
  {
    chapter: "03 — Несуществующая дата",
    title: "Расшифровать индекс",
    body: "Anonymous: «Нашёл в дампе: 19 20 1 25. Это не адреса, а буквы: A=1, B=2, … Z=26».\nAnonymous: «Попробуй без пробелов».",
    prompt: "Переведите четыре числа в латинские буквы.",
    hint: "19=S, 20=T, 1=A, 25=Y.",
    answer: "STAY",
    clue: "STAY",
  },
  {
    chapter: "04 — Кто восстановил архив?",
    title: "Ключ из сообщений",
    body: "No.1273: «Первое слово в скрытом ответе».\nNo.017: «День последней копии».\nSERVER.LOG: «Минуты, на которые ответ опередил создание, записываются двумя цифрами».",
    prompt: "Соедините три найденные улики в указанном порядке через дефисы.",
    hint: "Смотрите INVESTIGATION.TXT: слово, день и две цифры. Пример формата: WORD-00-00.",
    answer: "ECHO-17-01",
    clue: "COPY",
  },
  {
    chapter: "05 — Последний ответ",
    title: "Последняя проверка",
    body: "REBUILD.LOG / создан после вашего входа: «Я не мог отвечать, пока кто-то не восстановил копию».\n№000: «Я остался в первой версии. Две записи, которые вы уже нашли, объясняют, что произошло».",
    prompt:
      "Соедините через дефис расшифрованное слово из главы 3 и слово из главы 4.",
    hint: "Четвёртая и пятая строки INVESTIGATION.TXT, в этом порядке.",
    answer: "STAY-COPY",
    clue: "LAST_REPLY",
  },
];
const key = "duality.investigation.v1";
function read() {
  try {
    const n = JSON.parse(localStorage.getItem(key) || "0");
    return Number.isInteger(n) ? Math.max(0, Math.min(stages.length, n)) : 0;
  } catch {
    return 0;
  }
}
export default function Investigation() {
  const [done, setDone] = useState(read);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [reveal, setReveal] = useState(false);
  const [hint, setHint] = useState(false);
  function persist(n: number) {
    setDone(n);
    try {
      localStorage.setItem(key, JSON.stringify(n));
    } catch {
      /* session remains usable */
    }
  }
  function complete() {
    persist(done + 1);
    setValue("");
    setError("");
    setHint(false);
    setReveal(false);
  }
  const stage = stages[done];
  return (
    <section className="investigation">
      <h2>THE USER WHO NEVER LEFT</h2>
      <p>Восстановленная переписка / пять глав / архив только для чтения</p>
      <p>
        В 2004 году форум внезапно отключился. Перед этим №000 отвечал в ещё не
        созданных тредах и присылал снимки незнакомых мест. Спустя годы архив
        восстановили. Некоторые сообщения появились снова.
      </p>
      <div className="investigation-layout">
        <div>
          {stage ? (
            <article className="investigation-file">
              <h3>{stage.chapter}</h3>
              <h4>{stage.title}</h4>
              <p className="investigation-copy">{stage.body}</p>
              <p>
                <strong>{stage.prompt}</strong>
              </p>
              {done === 0 ? (
                <>
                  <button
                    className="investigation-hidden"
                    onClick={() => setReveal(true)}
                    aria-label="Открыть скрытое сообщение No.1273"
                  >
                    No.1273 · [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                  </button>
                  {reveal && (
                    <p className="investigation-clue">
                      №000: «ECHO».{" "}
                      <button onClick={complete}>Записать улику</button>
                    </p>
                  )}
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (value.trim().toUpperCase() === stage.answer) complete();
                    else
                      setError("Ответ не совпал. Сверьте данные и подсказку.");
                  }}
                >
                  <label htmlFor="investigation-answer">Ответ</label>
                  <input
                    id="investigation-answer"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                  />
                  <button>Проверить</button>
                  <p role="status">{error}</p>
                </form>
              )}
              <button onClick={() => setHint(!hint)} aria-expanded={hint}>
                Подсказка
              </button>
              {hint && <p>{stage.hint}</p>}
            </article>
          ) : (
            <article className="investigation-file">
              <h3>05 — Последний ответ</h3>
              <p>
                Восстановление не вызвало появление №000: оно дало старой копии
                возможность завершить ответ. Он был первой версией владельца —
                или следом, который архив научился воспроизводить. Отличить одно
                от другого по оставшимся данным нельзя.
              </p>
              <p>
                Последняя строка: «Спасибо за свет. Я ждал не тебя. Я ждал, что
                кто-то прочитает».
              </p>
            </article>
          )}
        </div>
        <aside className="investigation-journal">
          <h3>INVESTIGATION.TXT</h3>
          <p>
            Найдено улик: {done} / {stages.length}
          </p>
          {stages.slice(0, done).map((s, i) => (
            <p key={s.clue}>
              {i + 1}. {s.clue}
            </p>
          ))}
          <p>Улики хранятся в этом браузере.</p>
          <button
            onClick={() => {
              persist(0);
              setValue("");
              setError("");
              setHint(false);
              setReveal(false);
            }}
          >
            Начать расследование заново
          </button>
        </aside>
      </div>
    </section>
  );
}
