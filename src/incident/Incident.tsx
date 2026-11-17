import { useEffect, useState } from "react";
import {
  add,
  chapter,
  clearIncidentMemory,
  loadIncident,
  saveIncident,
  steps,
  type Ending,
  type IncidentSave,
} from "./state";
import Desktop from "./Desktop";
import History from "./History";
import MemoryCase from "./MemoryCase";
import MemoryProtocol from "./MemoryProtocol";
import "./incident.css";
export type View =
  | "journal"
  | "forum"
  | "recovery"
  | "cctv"
  | "system"
  | "history"
  | "dialogue"
  | "decision"
  | "audio";
const chapterNames = [
  "I — RESTORED",
  "II — THE MODERATOR",
  "III — IMAGE_017",
  "IV — THE LAST FRAME",
  "V — SYSTEM RECOVERY",
  "VI — USER 000",
  "VII — THE DECISION",
];
const titles = [
  "Найдите первое сообщение №000.",
  "Прочитайте заметки модератора.",
  "Восстановите изображение.",
  "Найдите фигуру на CAM_03 и сверьте время.",
  "Откройте ОС и разблокируйте терминал.",
  "Поговорите с №000.",
  "Выберите судьбу архива.",
];
const hints: Record<string, string[]> = {
  image: [
    "Поменяйте соседние части местами.",
    "Части пронумерованы как в исходном файле.",
    "Порядок: 1, 2, 3, 4, 5, 6.",
  ],
  log: [
    "Сравните журнал камеры и сервера.",
    "Камера опережает сервер на минуту.",
    "Заполните 00:01 и 00:02.",
  ],
  final: [
    "Вспомните последнюю запись администратора из /audio/.",
    "Соедините названное слово и четыре цифры времени CAM_03.",
    "Слово MEMORY и метка 00:01 дают MEMORY-0001.",
  ],
  memory: [
    "Начните с первой версии форума.",
    "Восстановление было до повторного открытия.",
    "2003, 2004, 2007, 2026. Камера зафиксировала фигуру в 00:01.",
  ],
};
export default function Incident({
  initialView = "journal",
  onViewChange,
}: {
  initialView?: View;
  onViewChange?: (view: View) => void;
}) {
  const [save, setSave] = useState(loadIncident);
  const [view, setView] = useState<View>(initialView);
  const [previousVisit] = useState(() =>
    loadIncident().visited.includes("journal"),
  );
  const [cam, setCam] = useState("CAM_01");
  const [time, setTime] = useState("00:00");
  const [zoom, setZoom] = useState(false);
  const [pieces, setPieces] = useState([2, 1, 3, 4, 6, 5]);
  const [selected, setSelected] = useState<number | null>(null);
  const [log1, setLog1] = useState("");
  const [log2, setLog2] = useState("");
  const [memory, setMemory] = useState("");
  const [memoryTime, setMemoryTime] = useState("");
  const [hint, setHint] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [dialogue, setDialogue] = useState(
    () =>
      save.choices
        .filter((choice) =>
          [
            "Я помогу вспомнить",
            "Что случилось в 2007?",
            "Я не уверен, что верю тебе",
          ].includes(choice),
        )
        .at(-1) || "",
  );
  const [finalAnswer, setFinalAnswer] = useState("");
  const [reset, setReset] = useState(false);
  const [erase, setErase] = useState(false);
  useEffect(() => {
    if (initialView === "journal")
      update((s) => ({ ...s, visited: add(s.visited, "journal") }));
  }, []);
  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  useEffect(() => {
    if (save.memory.timerDeadline === null || save.memory.events.includes("midnight")) return;
    const timer = window.setTimeout(() => {
      update((s) => ({ ...s, memory: { ...s.memory, events: add(s.memory.events, "midnight"), evidence: add(s.memory.evidence, "midnight") } }));
    }, Math.max(0, Math.min(2147483647, save.memory.timerDeadline - Date.now())));
    return () => window.clearTimeout(timer);
  }, [save.memory.timerDeadline, save.memory.events]);
  function changeView(next: View) {
    setView(next);
    onViewChange?.(next);
  }
  function update(fn: (s: IncidentSave) => IncidentSave) {
    setSave((s) => {
      const latest = loadIncident();
      const n = fn({
        ...s,
        visited: [...new Set([...s.visited, ...latest.visited])],
        threads: [...new Set([...s.threads, ...latest.threads])],
        files: [...new Set([...s.files, ...latest.files])],
        memory: latest.memory,
      });
      return saveIncident(n);
    });
  }
  function clue(id: string) {
    update((s) => ({ ...s, clues: add(s.clues, id) }));
  }
  function file(name: string) {
    update((s) => ({ ...s, files: add(s.files, name) }));
  }
  function solve(id: string) {
    clue(id);
    setFeedback("Запись восстановлена и добавлена в журнал.");
  }
  function resetProgress(eraseAll = false) {
    if (eraseAll) setSave(clearIncidentMemory());
    else update((s) => ({
      ...s,
      visited: [],
      threads: [],
      files: [],
      clues: [],
      choices: [],
      systemUnlocked: false,
      lastEnding: null,
      memory: { ...s.memory, evidence: [], recovered: [], changes: [], nullChoices: [], timerDeadline: null, adminUnlocked: false, events: [] },
    }));
    setReset(false);
    setErase(false);
    setPieces([2, 1, 3, 4, 6, 5]);
    setSelected(null);
    setLog1("");
    setLog2("");
    setMemory("");
    setMemoryTime("");
    setHint({});
    setFeedback("");
    setDialogue("");
    setFinalAnswer("");
    setCam("CAM_01");
    setTime("00:00");
    setZoom(false);
    changeView("journal");
  }
  const current = chapter(save);
  const memoryEndingReady = save.memory.recovered.includes("LETTER") &&
    ["forum", "camera000", "midnight", "null", "admin", "contradiction"].every((item) => save.memory.evidence.includes(item)) &&
    save.memory.events.includes("null-complete") && save.memory.adminUnlocked;
  const messages = save.systemUnlocked
    ? "Я помню этот рабочий стол. Но не помню, кто вернулся."
    : save.clues.includes("log")
      ? "Теперь ты знаешь, что произошло. Кажется."
      : save.clues.includes("image")
        ? "На снимке лестница. Я помню её иначе."
        : save.files.length
          ? "Ты не должен был это открывать. Хотя... это может помочь."
          : "Здесь никого нет.";
  const hintBlock = (id: string) => (
    <div className="incident-hint">
      <button
        onClick={() =>
          setHint((h) => ({ ...h, [id]: Math.min(3, (h[id] || 0) + 1) }))
        }
      >
        Подсказка {hint[id] || 0}/3
      </button>
      {hints[id].slice(0, hint[id] || 0).map((t) => (
        <p key={t}>{t}</p>
      ))}
    </div>
  );
  function finish(e: Ending) {
    update((s) => ({
      ...s,
      endings: add(s.endings, e) as Ending[],
      lastEnding: e,
      clues: add(s.clues, "decision"),
      choices: add(s.choices, e),
    }));
  }
  return (
    <section className="incident">
      <h2>DUALITY: INCIDENT 000</h2>
      <p>
        Восстановленная копия · действия и улики хранятся только в этом
        браузере.
      </p>
      <nav className="incident-nav" aria-label="Разделы INCIDENT 000">
        {(
          [
            ["journal", "/journal/"],
            ["forum", "/threads/"],
            ["recovery", "/recovery/"],
            ["cctv", "/cctv/"],
            ["system", "/system/"],
            ["history", "/history/"],
            ["audio", "/audio/"],
            ["dialogue", "/user_000/"],
            ["decision", "/ending/"],
          ] as [View, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => {
              changeView(v);
              setFeedback("");
              update((s) => ({ ...s, visited: add(s.visited, v) }));
            }}
            aria-current={view === v ? "page" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === "journal" && (
        <>
          <div className="incident-panel">
            <h3>
              {current < 7 ? chapterNames[current] : "РАССЛЕДОВАНИЕ ЗАВЕРШЕНО"}
            </h3>
            <p>
              {current < 7
                ? titles[current]
                : "Все главы пройдены. Финалы можно просматривать и открывать повторно."}
            </p>
            <p>№000: «{messages}»</p>
            <p>
              {previousVisit
                ? "Этот браузер уже открывал журнал."
                : "Этот файл никто не открывал с 2004 года."}
            </p>
          </div>
          <div className="incident-journal">
            <strong>INVESTIGATION.TXT</strong>
            <p>
              Глава: {Math.min(current + 1, 7)}/7 · улик: {save.clues.length}
            </p>
            <p>
              Входов в архив: {save.memory.visits} · максимальная глава: {save.memory.highestChapter}/7
              {save.memory.visits > 1 && <> · Ты снова здесь.</>}
            </p>
            <MemoryCase view="journal" save={save} update={update} />
            <MemoryProtocol view="journal" save={save} update={update} />
            {steps.map((s, i) => (
              <p key={s}>
                [{save.clues.includes(s) ? "X" : " "}] {chapterNames[i]} —{" "}
                {titles[i]}
              </p>
            ))}
            <p>
              Файлы: {save.files.join(", ") || "нет"}
              <br />
              Треды: {save.threads.join(", ") || "нет"}
              <br />
              Концовки: {save.endings.join(", ") || "нет"}
              <br />
              Ответы: {save.choices.join(", ") || "нет"}
            </p>
            {save.legacyInvestigation > 0 && (
              <p>
                Импортировано старое расследование: {save.legacyInvestigation}
                /6; прежние данные сохранены.
              </p>
            )}
            <button onClick={() => setReset(true)}>
              Сбросить игровой прогресс
            </button>
            {reset && (
              <div role="alert">
                <p>
                  Сбросить расследование? Открытые концовки и прежние сохранения
                  останутся.
                </p>
                <button onClick={() => resetProgress()}>Да, начать заново</button>{" "}
                <button onClick={() => setReset(false)}>Отмена</button>
              </div>
            )}
            <button onClick={() => setErase(true)}>Удалить все игровые воспоминания</button>
            {erase && (
              <div role="alert">
                <p>Удалить прогресс INCIDENT, посещения, выборы и открытые концовки на этом устройстве? Доступ к архиву, настройки и другие сохранения останутся.</p>
                <button onClick={() => resetProgress(true)}>Да, удалить воспоминания</button>{" "}
                <button onClick={() => setErase(false)}>Отмена</button>
              </div>
            )}
          </div>
        </>
      )}
      {view === "forum" && (
        <>
          <MemoryCase view="forum" save={save} update={update} />
          <article className="incident-panel">
            <h3>No.1273 / 17.04.2004 00:01</h3>
            <p>Anonymous: «На форуме снова пропала аватарка. У кого так же?»</p>
            <p>
              Anonymous: «У меня загрузилось. Только ответ №000 был здесь до
              создания темы».
            </p>
            <button
              onClick={() => {
                clue("thread");
                update((s) => ({ ...s, threads: add(s.threads, "1273") }));
              }}
            >
              Прочитать ответ №000
            </button>
            {save.clues.includes("thread") && (
              <p>№000: «Я не уверен, что ответил первым. Проверь журнал».</p>
            )}
          </article>
          <article className="incident-panel">
            <h3>No.1290 / MODERATOR.LOG</h3>
            <p>
              Модератор: «Админ нажал удалить 000 в 00:03. В 00:04 форум упал.
              Дамп уже был сделан».
            </p>
            <p>
              Anonymous: «Вряд ли удаление пользователя может выключить весь
              сервер. Проверьте диск».
            </p>
            <button
              onClick={() => {
                file("MODERATOR.LOG");
                clue("moderator");
              }}
            >
              Сохранить заметку модератора
            </button>
          </article>
        </>
      )}
      {view === "recovery" && (
        <>
          <MemoryCase view="recovery" save={save} update={update} />
          <article className="incident-panel">
            <h3>IMAGE_017.JPG</h3>
            <p>
              Нажмите два фрагмента, чтобы поменять их местами. Восстановите
              порядок от 1 до 6.
            </p>
            <div className="recovery-pieces">
              {pieces.map((n, i) => (
                <button
                  key={i}
                  aria-label={`Фрагмент ${n}, позиция ${i + 1}`}
                  aria-pressed={selected === i}
                  style={{
                    backgroundPosition: `${((n - 1) % 3) * 50}% ${Math.floor((n - 1) / 3) * 100}%`,
                  }}
                  onClick={() => {
                    if (selected === null) setSelected(i);
                    else {
                      const copy = [...pieces];
                      [copy[i], copy[selected]] = [copy[selected], copy[i]];
                      setPieces(copy);
                      setSelected(null);
                    }
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (pieces.every((n, i) => n === i + 1)) {
                  file("IMAGE_017.JPG");
                  solve("image");
                } else setFeedback("Фрагменты пока не на своих местах.");
              }}
            >
              Проверить изображение
            </button>
            <button
              onClick={() => {
                setPieces([2, 1, 3, 4, 6, 5]);
                setSelected(null);
              }}
            >
              Повторить изображение
            </button>
            {hintBlock("image")}
            {save.clues.includes("image") && (
              <>
                <div className="camera-frame">
                  <img
                    src="/archive/camera-stair.svg"
                    alt="Восстановленный кадр лестницы"
                  />
                  <span
                    className="camera-figure"
                    role="img"
                    aria-label="Фигура на лестнице"
                  />
                  <span className="camera-caption">CAM_03 / 00:01</span>
                </div>
                <p>На обороте: CAM_03 / 00:01. Сверьте с журналом 00:02.</p>
              </>
            )}
          </article>
          <article className="incident-panel">
            <h3>LOG_2004.TXT</h3>
            <p>
              Восстановите пропуски: CAM_03 увидела фигуру до создания треда.
              Проверьте CAM_03 и SERVER.LOG в терминале или заметке модератора.
            </p>
            <label>
              Камера{" "}
              <input
                value={log1}
                onChange={(e) => setLog1(e.target.value)}
                placeholder="00:00"
              />
            </label>
            <label>
              Сервер{" "}
              <input
                value={log2}
                onChange={(e) => setLog2(e.target.value)}
                placeholder="00:00"
              />
            </label>
            <button
              onClick={() => {
                if (log1 === "00:01" && log2 === "00:02") {
                  file("LOG_2004.TXT");
                  solve("log");
                } else setFeedback("Время не совпало.");
              }}
            >
              Восстановить журнал
            </button>
            <button
              onClick={() => {
                setLog1("");
                setLog2("");
              }}
            >
              Повторить журнал
            </button>
            {hintBlock("log")}
          </article>
          <article className="incident-panel">
            <h3>MEMORY.DAT</h3>
            <p>
              Введите годы четырёх версий архива через запятую в порядке событий
              и укажите время кадра CAM_03. Данные есть в /history/, C:\RECOVERY
              и журнале камер.
            </p>
            <label>
              Порядок{" "}
              <input
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="0000,0000,0000,0000"
              />
            </label>
            <label>
              Время кадра CAM_03{" "}
              <input
                value={memoryTime}
                onChange={(e) => setMemoryTime(e.target.value)}
                placeholder="00:00"
              />
            </label>
            <button
              onClick={() => {
                if (
                  memory.replace(/\s/g, "") === "2003,2004,2007,2026" &&
                  memoryTime.trim() === "00:01"
                ) {
                  file("MEMORY.DAT");
                  solve("memory");
                } else setFeedback("Порядок не совпал.");
              }}
            >
              Проверить последовательность
            </button>
            <button
              onClick={() => {
                setMemory("");
                setMemoryTime("");
              }}
            >
              Повторить последовательность
            </button>
            {hintBlock("memory")}
          </article>
          <p className="incident-error" role="status">
            {feedback}
          </p>
        </>
      )}
      {view === "cctv" && (
        <div className="incident-panel">
          <MemoryCase view="cctv" save={save} update={update} />
          <h3>Архивные кадры наблюдения</h3>
          <p>
            Это отдельные неподвижные кадры, не видеозапись. Сверьте CAM_03 с
            меткой 00:01 на IMAGE_017.
          </p>
          <label>
            Камера{" "}
            <select value={cam} onChange={(e) => setCam(e.target.value)}>
              {[
                ["CAM_01", "CORRIDOR"],
                ["CAM_02", "SERVER ROOM"],
                ["CAM_03", "STAIRWELL"],
                ["CAM_04", "UNKNOWN"],
              ].map(([c, label]) => (
                <option value={c} key={c}>
                  {c} — {label}
                </option>
              ))}
            </select>
          </label>{" "}
          <label>
            Время{" "}
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {["00:00", "00:01", "00:02", "00:03"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <input
            type="range"
            min="0"
            max="3"
            value={Number(time.slice(-2))}
            onChange={(e) => setTime("00:0" + e.target.value)}
            aria-label="Временная шкала"
          />
          <div
            className={`camera-frame ${zoom ? "camera-zoom" : ""}`}
            style={{ maxWidth: 560 }}
          >
            <img
              src={
                cam === "CAM_01"
                  ? "/archive/corridor.png"
                  : cam === "CAM_02"
                    ? "/archive/camera-server.svg"
                    : cam === "CAM_03"
                      ? "/archive/camera-stair.svg"
                      : "/archive/camera-unknown.svg"
              }
              alt={`${cam} — архивный неподвижный кадр`}
            />
            {cam === "CAM_03" && time === "00:01" && (
              <span
                className="camera-figure"
                aria-label="Фигура на лестнице"
                role="img"
              />
            )}
            <span className="camera-caption">
              {cam} / {time} / 17.04.2004
            </span>
          </div>
          {cam === "CAM_04" && (
            <p>Помещение на кадре отсутствует на сохранившемся плане здания.</p>
          )}
          <button onClick={() => setZoom(!zoom)} aria-pressed={zoom}>
            {zoom ? "Уменьшить" : "Увеличить"}
          </button>
          {save.clues.includes("camera") && (
            <p>В подписи восстановленного кадра: USER_000 / CAM_03 / 00:01.</p>
          )}
          {cam === "CAM_03" && time === "00:01" && (
            <button
              onClick={() => {
                file("CAM_03_0001");
                solve("camera");
              }}
            >
              Сохранить кадр как улику
            </button>
          )}
        </div>
      )}
      {view === "system" &&
        (save.systemUnlocked ? (
          <>
            <p>
              Виртуальная система изолирована от устройства. Все файлы — часть
              истории.
            </p>
            <Desktop
              onFile={file}
              administrator={save.lastEnding === "REPLACEMENT"}
              onRecover={() => changeView("recovery")}
              onUnlock={() => solve("system")}
            />
          </>
        ) : (
          <div className="incident-panel">
            <h3>SYSTEM_RECOVERY.EXE</h3>
            <p>
              Для входа сначала восстановите IMAGE_017 и найдите метку на
              CAM_03.
            </p>
            <button
              disabled={
                !save.clues.includes("image") || !save.clues.includes("camera")
              }
              onClick={() => update((s) => ({ ...s, systemUnlocked: true }))}
            >
              Запустить виртуальную систему
            </button>
          </div>
        ))}
      {view === "history" && (
        <div className="incident-panel">
          <History onFile={file} />
        </div>
      )}
      {view === "audio" && (
        <div className="incident-panel">
          <h3>/audio/ — архив записей</h3>
          <p>
            Синтезированные звуки и голоса для вымышленной истории.
            Воспроизведение запускается только вручную.
          </p>
          {[
            [
              "modem",
              "01 — Подключение модема",
              "[синтезированный сигнал соединения]",
            ],
            [
              "answerphone",
              "02 — Автоответчик",
              "Hello. You have reached the archive. The administrator is not available. Please leave a message. / Вы позвонили в архив. Администратор недоступен. Оставьте сообщение.",
            ],
            [
              "system",
              "03 — Системная запись",
              "System error. Message received before thread creation. Timestamp zero zero zero one. / Ответ получен до создания треда. Время 00:01.",
            ],
            [
              "server",
              "04 — Серверная",
              "[синтезированный шум серверного помещения]",
            ],
            [
              "admin",
              "05 — Последнее сообщение администратора",
              "This is the administrator. The recovery code is zero zero zero, zero one zero two. Do not erase the backup. The final word is memory. / Код восстановления: 000-0102. Не удаляйте копию. Последнее слово — MEMORY.",
            ],
          ].map(([id, title, transcript]) => (
            <article key={id}>
              <h4>{title}</h4>
              <audio
                controls
                preload="none"
                src={`/archive/audio/${id}.mp3`}
                onPlay={() => file(`AUDIO_${id.toUpperCase()}`)}
              >
                Аудио не поддерживается браузером.
              </audio>
              <details>
                <summary>Расшифровка</summary>
                <p>{transcript}</p>
              </details>
            </article>
          ))}
        </div>
      )}
      {view === "dialogue" && (
        <div className="incident-panel">
          <MemoryProtocol view="dialogue" save={save} update={update} />
          <h3>Соединение с №000</h3>
          <p>№000: «{messages}»</p>
          {save.clues.includes("system") ? (
            <>
              <p>
                «Копия содержит мои воспоминания. Я администратор? Или только
                его незавершённый ответ? Я не знаю. Я боюсь, что удаление
                оставит кого-то здесь».
              </p>
              <div className="incident-choice">
                {[
                  "Я помогу вспомнить",
                  "Что случилось в 2007?",
                  "Я не уверен, что верю тебе",
                ].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => {
                      setDialogue(choice);
                      update((s) => ({
                        ...s,
                        choices: [
                          ...s.choices.filter((item) => item !== choice),
                          choice,
                        ],
                      }));
                      clue("dialogue");
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              {dialogue && (
                <p>
                  №000: «
                  {dialogue === "Что случилось в 2007?"
                    ? "Копия загрузилась без администратора. Я ждал ответа."
                    : dialogue === "Я помогу вспомнить"
                      ? "Помоги. Только не удаляй единственную копию, пока мы не узнаем, кто в ней остался."
                      : "Я тоже не уверен, что я настоящий. Возможно, я только эхо ответа."}
                  »
                </p>
              )}
            </>
          ) : (
            <p>Связь неустойчива. Разблокируйте терминал в /system/.</p>
          )}
        </div>
      )}
      {view === "decision" && (
        <div className="incident-panel">
          <h3>VII — THE DECISION</h3>
          {current < 6 ? (
            <p>
              Сначала восстановите информацию в первых шести главах. Текущая
              цель: {titles[current]} Все разделы остаются доступны.
            </p>
          ) : !save.clues.includes("finalkey") ? (
            <>
              <p>
                Соедините слово из последней записи администратора в /audio/ и
                четыре цифры времени кадра CAM_03 без двоеточия, через дефис.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (finalAnswer.trim().toUpperCase() === "MEMORY-0001") {
                    clue("finalkey");
                    setFeedback("");
                  } else
                    setFeedback(
                      "Ключ не совпал. Сверьте запись и метку камеры.",
                    );
                }}
              >
                <label htmlFor="final-answer">Последний ключ</label>
                <input
                  id="final-answer"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  autoComplete="off"
                />
                <button>Проверить ключ</button>
                <p role="status">{feedback}</p>
              </form>
              {hintBlock("final")}
            </>
          ) : (
            <>
              <p>
                Архив просит нового администратора. Удаление скроет копию и
                оборвёт разговор; освобождение вернёт утраченные записи; замена
                сохранит систему, но назначит ваш игровой профиль пользователем
                №000.
              </p>
              <div className="incident-choice">
                <button onClick={() => finish("PURGE")}>Удалить архив</button>
                <button onClick={() => finish("RELEASE")}>
                  Освободить №000
                </button>
                <button onClick={() => finish("REPLACEMENT")}>
                  Стать администратором
                </button>
                {memoryEndingReady && <button onClick={() => finish("MEMORY_PROTOCOL")}>Запустить MEMORY PROTOCOL</button>}
              </div>
            </>
          )}
          {save.lastEnding && (
            <div
              className={`incident-ending ending-${save.lastEnding.toLowerCase()}`}
              role="status"
            >
              {save.lastEnding === "PURGE" ? (
                <>
                  <strong>ARCHIVE DELETED</strong>
                  <p>
                    Список записей пуст. Соединение с №000 оборвалось до ответа.
                    Главная страница больше не показывает архив.
                  </p>
                  <p>На пустом экране остаётся строка:</p>
                  <strong>1 FILE REMAINS</strong>
                  <p>
                    Единственный оставшийся файл позволяет начать расследование
                    заново.
                  </p>
                </>
              ) : save.lastEnding === "RELEASE" ? (
                <>
                  <strong>RELEASE</strong>
                  <p>
                    Восстановлена часть воспоминаний администратора. №000
                    отвечает: «Теперь я могу уйти. Сохрани записи, которые ещё
                    можно прочитать».
                  </p>
                  <p>
                    В треде №1370 снова доступен удалённый ответ. По одной копии
                    невозможно установить, был ли голос человеком или его
                    сохранённой памятью.
                  </p>
                </>
              ) : save.lastEnding === "REPLACEMENT" ? (
                <>
                  <strong>WELCOME BACK, ADMINISTRATOR</strong>
                  <p>
                    Игровой профиль получил номер №000. Архив ждёт ваших
                    решений.
                  </p>
                  <p>
                    Терминал теперь узнаёт администратора. В старой переписке
                    остаётся ответ, написанный до того, как вы приняли это
                    решение.
                  </p>
                </>
              ) : (
                <>
                  <strong>MEMORY PROTOCOL</strong>
                  {save.memory.recovered.includes("CASE_LOG") && <p>Восстановленный SERVER_2007.LOG показывает: копия предшествовала попытке восстановления 2007 года.</p>}
                  {save.memory.recovered.includes("CASE_PHOTO") && <p>На фотографии комната не совпадает со схемой: место могло сохраниться только в записи.</p>}
                  {save.memory.recovered.includes("CASE_VOICE") && <p>Восстановленная расшифровка оставляет вопрос без ответа: кто просил записать след?</p>}
                  <p>Записи сходятся: копия существовала до удаления, а сигнал появился до команды восстановления. Архив мог сохранять не человека целиком, а способ отвечать вместо него.</p>
                  <p>NULL: «Если кто-то продолжает разговор, значит ли это, что кто-то вернулся?» Ответ остаётся в журнале, но его источник по-прежнему неизвестен.</p>
                </>
              )}
              <p>Открытые финалы: {save.endings.join(", ")}</p>
              <button onClick={() => setReset(true)}>
                Начать заново, сохранив концовки
              </button>
              {reset && (
                <div role="alert">
                  <p>Начать заново? Открытые концовки останутся.</p>
                  <button onClick={() => resetProgress()}>
                    Да, начать заново
                  </button>{" "}
                  <button onClick={() => setReset(false)}>Отмена</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
