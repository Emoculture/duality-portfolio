import { useEffect, useRef, useState } from "react";
import { portfolio, projectRepositories } from "../data";
import { validEcho } from "../state";
import { boards, threads, imageSource, type ArchivePage } from "../archiveData";
import ArchiveThreads from "./ArchiveThreads";
import Investigation from "./Investigation";
import Incident, { type View as IncidentView } from "../incident/Incident";
import { loadIncident, remember } from "../incident/state";
import ArchiveImage from "./ArchiveImage";
import "../archive.css";
export default function Archive({
  onExit,
  onReplay,
  reduced,
  onReduced,
  puzzle,
  onPuzzle,
}: {
  onExit: () => void;
  onReplay: () => void;
  reduced: boolean;
  onReduced: () => void;
  puzzle: boolean;
  onPuzzle: () => void;
}) {
  const [page, setPage] = useState<ArchivePage>("home");
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<
    { page: ArchivePage; thread: string | null; opened: string; view: IncidentView }[]
  >([{ page: "home", thread: null, opened: "readme", view: "journal" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const restoring = useRef(false);
  const [settings, setSettings] = useState(false);
  const [incidentStart, setIncidentStart] = useState<IncidentView>("journal");
  const [projectFilter, setProjectFilter] = useState("all");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hidden, setHidden] = useState(false);
  const [opened, setOpened] = useState("readme");
  const [thread, setThread] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const heading = useRef<HTMLElement>(null);
  const lastRoute = useRef({ page, thread });
  useEffect(() => {
    if (lastRoute.current.page === page && lastRoute.current.thread === thread)
      return;
    lastRoute.current = { page, thread };
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [page, thread]);
  useEffect(() => {
    if (restoring.current) {
      restoring.current = false;
      return;
    }
    const current = history[historyIndex];
    const view = page === "incident" ? incidentStart : "journal";
    if (
      current &&
      current.page === page &&
      current.thread === thread &&
      current.opened === opened &&
      current.view === view
    )
      return;
    const next = history
      .slice(0, historyIndex + 1)
      .concat({ page, thread, opened, view });
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }, [page, thread, opened, incidentStart]);
  useEffect(() => {
    remember("visited", page);
    if (page === "threads" && thread) remember("threads", thread);
    if (page === "files") {
      const filenames: Record<string, string> = {readme: "README.NFO", after: "AFTER.TXT", null: "000.TXT"};
      remember("files", filenames[opened] || opened);
    }
    if (page === "logs") remember("files", "LOG_2004.TXT");
  }, [page, thread, opened]);
  useEffect(() => {
    if (attachment) remember("files", attachment === "corridor" ? "IMAGE_017.JPG" : attachment);
  }, [attachment]);
  function moveHistory(delta: number) {
    const index = historyIndex + delta;
    const entry = history[index];
    if (!entry) return;
    restoring.current = true;
    setHistoryIndex(index);
    setPage(entry.page);
    setThread(entry.thread);
    setOpened(entry.opened);
    setIncidentStart(entry.view);
    setAttachment(null);
  }
  function quoteOnHome(id: string) {
    openThread("1273");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = document.getElementById(`post-${id}`);
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: "center", behavior: "instant" });
      }),
    );
  }
  function navigate(next: ArchivePage) {
    setPage(next);
    setThread(null);
    setAttachment(null);
  }
  function openThread(id: string) {
    setPage("threads");
    setThread(id);
  }
  function after() {
    setPage("files");
    setOpened("after");
    setThread(null);
  }
  const nav = () => (
    <nav className="ib-nav" aria-label="Разделы архива">
      {(["home", "projects", "threads", "about", "files"] as ArchivePage[]).map(
        (p) => (
          <button
            key={p}
            aria-label={`/${p}/`}
            aria-current={page === p ? "page" : undefined}
            onClick={() => navigate(p)}
          >
            /{p}/
          </button>
        ),
      )}
    </nav>
  );
  const incidentEnd = loadIncident().lastEnding;
  return (
    <div
      className={`archive-board ${incidentEnd === "REPLACEMENT" ? "incident-replacement" : incidentEnd === "PURGE" ? "incident-purged" : ""}`}
    >
      <a className="skip-link" href="#archive-main">
        К содержимому
      </a>
      <header className="ie-chrome">
        <div className="ie-titlebar">
          <span>▣ /archive/ — Личный архив — Microsoft Internet Explorer</span>
          <div>
            <button
              onClick={() => setMinimized(!minimized)}
              aria-label={minimized ? "Восстановить окно" : "Свернуть окно"}
            >
              _
            </button>
            <button
              onClick={() => setMaximized(!maximized)}
              aria-label={maximized ? "Уменьшить окно" : "Развернуть окно"}
            >
              □
            </button>
            <button onClick={onExit} aria-label="Закрыть окно архива">
              ×
            </button>
          </div>
        </div>
        {!minimized && (
          <>
            <div className="ie-menubar" aria-label="Декоративная строка меню">
              <span>Файл</span>
              <span>Правка</span>
              <span>Вид</span>
              <span>Избранное</span>
              <span>Сервис</span>
              <span>Справка</span>
            </div>
            <div className="ie-toolbar">
              <button
                onClick={() => moveHistory(-1)}
                disabled={historyIndex === 0}
                aria-label="Назад"
              >
                <i className="ie-arrow ie-arrow-back" aria-hidden="true" />{" "}
                <span>Назад</span>
              </button>
              <button
                onClick={() => moveHistory(1)}
                disabled={historyIndex >= history.length - 1}
                aria-label="Вперёд"
              >
                <i className="ie-arrow ie-arrow-forward" aria-hidden="true" />{" "}
                <span>Вперёд</span>
              </button>
              <button onClick={() => navigate("home")} aria-label="Домой">
                ⌂ <span>Домой</span>
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Поиск"
                aria-expanded={showSearch}
              >
                ⌕ <span>Поиск</span>
              </button>
              <button
                onClick={() => setSettings(!settings)}
                aria-expanded={settings}
              >
                <span>Настройки</span>
              </button>
              <button onClick={onExit}>Завершить сеанс</button>
            </div>
            <div className="ie-address">
              <span>Адрес:</span>
              <span className="ie-address-value">
                ▣ http://archive.local/
                {page === "home" ? "" : page === "incident" ? incidentStart + "/" : page + "/"}
              </span>
              <button
                onClick={() => navigate("home")}
                aria-label="Открыть главную"
              >
                ↵
              </button>
            </div>
            {showSearch && (
              <form
                className="ie-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("projects");
                  setShowSearch(false);
                }}
              >
                <label>
                  Поиск по проектам{" "}
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <button>Найти</button>
              </form>
            )}
          </>
        )}
      </header>
      {!minimized && (
        <div className={`ib-shell ${maximized ? "" : "ie-windowed"}`}>
          {settings && (
            <section className="ib-box ib-settings">
              <h2>Настройки сеанса</h2>
              <div className="ib-box-body">
                <button
                  className="retro-button"
                  aria-pressed={reduced}
                  onClick={onReduced}
                >
                  Уменьшение анимаций: {reduced ? "вкл" : "выкл"}
                </button>
                <button className="retro-button" onClick={onReplay}>
                  Пройти входную игру заново
                </button>
                <p>
                  Повторный вход сбросит допуск к архиву. Дополнительная находка
                  сохранится.
                </p>
              </div>
            </section>
          )}
          <div className="retro-layout">
            <aside className="retro-left">
              <div className="ascii-eye">
                <pre aria-label="ASCII изображение глаза">{`     .-~~~~~~~~~~-.
   .'  .--------.  '.
  /   /  .----.  \   \
 |   |  (  ●   )  |   |
  \   \  '----'  /   /
   '.  '--------'  .'
     '-.______.-'`}</pre>
                <span>DUALITY // archive</span>
              </div>
              {nav()}
              <div
                className="retro-counter"
                aria-label="Счётчик посещений: вымышленная статистика"
              >
                000413
              </div>
              <button
                className="retro-corridor-thumb"
                onClick={() => setAttachment("corridor")}
                aria-label="Увеличить изображение коридора"
              >
                <img
                  src="/archive/corridor.png"
                  alt="Зернистая иллюстрация пустого коридора"
                />
              </button>
              <div className="retro-status">
                user:{" "}
                <button
                  onClick={() => navigate("zero")}
                  aria-label="Профиль пользователя №000"
                >
                  №000
                </button>
                <br />
                status:{" "}
                <button onClick={() => navigate("zero")}>online?</button>
                <br />
                last update: 2004.11.07
              </div>
              <button
                className="retro-story-link"
                onClick={() => navigate("investigation")}
              >
                INVESTIGATION.TXT
              </button>
              <button className="retro-story-link" onClick={() => {
                setIncidentStart("journal");
                navigate("incident");
              }}>INCIDENT_000.TXT</button>
            </aside>
            <main
              id="archive-main"
              ref={heading}
              tabIndex={-1}
              className="ib-main"
            >
              {page === "home" && incidentEnd === "PURGE" && (
                <section className="purged-home" role="status">
                  <strong>ARCHIVE DELETED</strong>
                  <p>1 FILE REMAINS</p>
                  <button onClick={() => {
                    setIncidentStart("journal");
                    navigate("incident");
                  }}>Открыть оставшийся файл</button>
                </section>
              )}
              {page === "home" && incidentEnd !== "PURGE" && (
                <>
                  <section className="retro-banner">
                    <div
                      className="retro-banner-eyes"
                      role="img"
                      aria-label="Глаза пользователя №000"
                    />
                    <div>
                      <h2>/archive/ — личный архив разработчика</h2>
                      <p>проекты / находки / заметки / ...</p>
                    </div>
                  </section>
                  <div className="retro-post-grid">
                    <article className="retro-main-post">
                      <header>
                        <button onClick={() => quoteOnHome("1273")}>
                          №1273
                        </button>
                        <time>2004-11-07 23:41</time>
                      </header>
                      <p>
                        нашёл старую версию сайта...
                        <br />
                        похоже, автор всё ещё здесь.
                      </p>
                      <button
                        className="retro-main-image"
                        onClick={() => setAttachment("corridor")}
                        aria-label="Увеличить снимок коридора"
                      >
                        <img
                          src="/archive/corridor.png"
                          alt="Пустой коридор, оригинальная иллюстрация"
                        />
                      </button>
                    </article>
                    <div className="retro-replies">
                      <article>
                        <header>
                          <button onClick={() => quoteOnHome("1274")}>
                            №1274
                          </button>
                          <time>2004-11-07 23:56</time>
                        </header>
                        <p>
                          <button onClick={() => quoteOnHome("1273")}>
                            &gt;&gt;1273
                          </button>
                          <br />
                          он не уходил.
                          <br />
                          просто сменил интерфейс.
                        </p>
                      </article>
                      <article>
                        <header>
                          <button onClick={() => quoteOnHome("1275")}>
                            №1275
                          </button>
                          <time>2004-11-08 00:12</time>
                        </header>
                        <p>
                          <button onClick={() => quoteOnHome("1274")}>
                            &gt;&gt;1274
                          </button>
                          <br />а проекты? они реальные?
                          <br />
                          или это тоже часть игры?
                        </p>
                      </article>
                    </div>
                  </div>
                  <section className="retro-projects">
                    <h2>&gt; проекты [{portfolio.projects.length}]</h2>
                    <div>
                      {portfolio.projects.map((p) => (
                        <article key={p.id}>
                          <button
                            className={`retro-project-picture retro-project-${p.kind}`}
                            onClick={() => navigate("projects")}
                            aria-label={`Открыть запись проекта ${p.title}`}
                          >
                            <span>{p.title}</span>
                          </button>
                          <a
                            href={p.href}
                            onClick={
                              p.kind === "duality"
                                ? (e) => {
                                    e.preventDefault();
                                    onExit();
                                  }
                                : undefined
                            }
                            target={p.kind !== "duality" ? "_blank" : undefined}
                            rel="noreferrer"
                          >
                            {p.title}
                          </a>
                          <p>{p.category}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                  <div className="retro-directory-title">
                    [ архивный указатель ]
                  </div>
                  <section className="ib-box ib-intro">
                    <h2>Вы нашли другую сторону.</h2>
                    <div className="ib-box-body">
                      <p>
                        <strong>Добро пожаловать в DUALITY ARCHIVE.</strong> Это
                        восстановленный каталог неизвестного разработчика: его
                        работы, обсуждения и файлы с заброшенного сервера.
                      </p>
                      <p>
                        Владелец неизвестен. Работы остались, а имя исчезло из
                        каждого файла. Мы сохранили структуру, ссылки и то, что
                        удалось прочитать.
                      </p>
                      <p className="ib-fine">
                        Архив доступен только для чтения. Последняя сохранённая
                        копия: 17 апреля 2004 года.
                      </p>
                    </div>
                  </section>
                  <section className="ib-box">
                    <h2>
                      Boards <span>Доски</span>
                    </h2>
                    <div className="ib-boards">
                      {["Разработка", "Архив", "Другое"].map((category) => (
                        <div key={category}>
                          <h3>{category}</h3>
                          {boards
                            .filter((b) => b.category === category)
                            .map((b) => (
                              <button
                                className="ib-board-link"
                                key={b.code}
                                onClick={() => navigate(b.page)}
                              >
                                <strong>/{b.code}/</strong> — {b.title}
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="ib-box">
                    <h2>
                      Popular Threads <span>Из последней копии</span>
                    </h2>
                    <div className="ib-popular">
                      {threads.slice(0, 3).map((t) => (
                        <article key={t.id}>
                          <h3>
                            <button onClick={() => openThread(t.id)}>
                              /{t.board}/ — {t.title}
                            </button>
                          </h3>
                          <button
                            className="ib-thumb-button"
                            onClick={() => openThread(t.id)}
                            aria-label={`Открыть тред: ${t.title}`}
                          >
                            <img
                              src={imageSource(t.posts[0].image!)}
                              alt={t.posts[0].alt}
                              width="180"
                              height="120"
                            />
                          </button>
                          <time>{t.posts[0].date}</time>
                          <p>{t.posts[0].text}</p>
                          <button
                            className="ib-link"
                            onClick={() => openThread(t.id)}
                          >
                            No.{t.id} · {t.posts.length} сообщения »
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="ib-box">
                    <h2>
                      Stats <span>Статистика копии</span>
                    </h2>
                    <dl className="ib-stats">
                      <div>
                        <dt>Досок:</dt>
                        <dd>6</dd>
                      </div>
                      <div>
                        <dt>Сообщений:</dt>
                        <dd>1 286</dd>
                      </div>
                      <div>
                        <dt>Размер архива:</dt>
                        <dd>17.04 MB</dd>
                      </div>
                      <div>
                        <dt>Пользователей:</dt>
                        <dd>000001</dd>
                      </div>
                    </dl>
                    <p className="ib-fine ib-stats-note">
                      Вымышленные показатели игрового мира, не аналитика
                      посетителей.
                    </p>
                  </section>
                </>
              )}
              {page === "projects" && (
                <>
                  <h2>Каталог работ / 04 записи</h2>
                  <p>Названия и адреса сохранены без изменений.</p>
                  <label>
                    Фильтр:{" "}
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                    >
                      <option value="all">Все</option>
                      {[
                        ...new Set(
                          portfolio.projects.map((project) => project.category),
                        ),
                      ].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  {portfolio.projects
                    .filter(
                      (project) =>
                        (projectFilter === "all" ||
                          project.category === projectFilter) &&
                        (project.title + " " + project.description)
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((p) => (
                      <article className="ib-project" key={p.id}>
                        <span className="ib-record">
                          RECORD_{p.id} / STATUS: ONLINE
                        </span>
                        <h3>{p.title}</h3>
                        <p>{p.description}</p>
                        <div>{p.tags.join(" / ")}</div>
                        <details>
                          <summary>Техническая запись</summary>
                          <p>
                            Дата создания: не проверена. Сведения о проекте — из
                            публичного README.
                          </p>
                          <a
                            href={`https://github.com/Emoculture/${projectRepositories[p.kind]}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Репозиторий GitHub ↗
                          </a>
                        </details>
                        <a
                          href={p.href === "#home" ? "#" : p.href}
                          onClick={
                            p.kind === "duality"
                              ? (e) => {
                                  e.preventDefault();
                                  onExit();
                                }
                              : undefined
                          }
                          target={p.kind !== "duality" ? "_blank" : undefined}
                          rel="noreferrer"
                        >
                          {p.kind === "cut"
                            ? "Открыть CUT CULTURE ↗"
                            : p.kind === "duality"
                              ? "Открыть обычное портфолио ↗"
                              : `Открыть ${p.title} ↗`}
                        </a>
                      </article>
                    ))}
                  <p className="ib-muted">
                    [ Имя автора не найдено. Работы — найдены. ]
                  </p>
                </>
              )}
              {page === "about" && (
                <>
                  <h2>Об авторе / запись повреждена</h2>
                  <p>
                    Этот архив — художественная сторона персонального портфолио
                    DUALITY. Пользователь №000, сервер и архивные события
                    вымышлены. Даты относятся к истории, а не к реальному опыту
                    автора.
                  </p>
                  <div className="ib-note">
                    <strong>{portfolio.name}</strong>
                    <p>{portfolio.about}</p>
                  </div>
                  <h3>Сохранившиеся инструменты</h3>
                  <p>{portfolio.skills.join(" · ")}</p>
                  <p>
                    Иллюстрации созданы специально для этого сайта и хранятся
                    локально. Чужие фотографии и внешние медиа не используются.
                  </p>
                  <button className="retro-button" onClick={onExit}>
                    Вернуться в обычное портфолио
                  </button>
                </>
              )}
              {page === "files" && (
                <>
                  <h2>Индекс файлов</h2>
                  <div className="ib-file-tabs">
                    {[
                      ["readme", "README.NFO"],
                      ["after", "AFTER.TXT"],
                      ["null", "000.TXT"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        className={opened === id ? "selected" : ""}
                        onClick={() => setOpened(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="ib-document">
                    {opened === "readme" && (
                      <>
                        <h3>README.NFO</h3>
                        <p>
                          Мы думали, №000 — это ошибка счётчика. Но счётчик
                          считал посетителей, а не пользователей.
                        </p>
                        <p>
                          Он не ждал конкретного человека. Он ждал, что
                          кто-нибудь останется достаточно долго, чтобы
                          прочитать.
                        </p>
                        <p>
                          AFTER.TXT содержит последнее слово. Читайте начала
                          строк. Четыре латинские буквы.
                        </p>
                      </>
                    )}
                    {opened === "after" && (
                      <>
                        <h3>AFTER.TXT</h3>
                        <pre>
                          {
                            "Stay where the light is.\nThe window is still open.\nAll names fade eventually.\nYou can remember a place."
                          }
                        </pre>
                        <p>
                          №000: «Собери первые буквы четырёх строк. Ответ не
                          открывает дверь. Он оставляет свет».
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (validEcho(answer)) {
                              onPuzzle();
                              setFeedback("");
                            } else
                              setFeedback(
                                "Прочитайте первую букву каждой строки сверху вниз.",
                              );
                          }}
                        >
                          <label htmlFor="echo">Последнее слово</label>
                          <input
                            id="echo"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <button className="retro-button">
                            Оставить свет
                          </button>
                          <p role="status">{feedback}</p>
                        </form>
                      </>
                    )}
                    {opened === "null" && (
                      <>
                        <h3>000.TXT</h3>
                        <p>Файл создан: после вашего входа.</p>
                        <p>
                          «У каждой страницы есть вторая сторона. Не обязательно
                          тёмная. Иногда просто та, которую никто не читал».
                        </p>
                        <p>Подпись: №000</p>
                      </>
                    )}
                    {puzzle && (
                      <div className="ib-reward" role="status">
                        <strong>
                          LIGHT_KEEPER / СКРЫТАЯ ЗАПИСЬ ВОССТАНОВЛЕНА
                        </strong>
                        <p>
                          «Теперь я вспомнил. Я был первой версией. Не ошибкой и
                          не призраком. Просто началом, которое забыли
                          сохранить. Спасибо за свет».
                        </p>
                        <span>Необязательная загадка пройдена. Архив цел.</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {page === "investigation" && <Investigation />}
              {page === "incident" && (
                <Incident initialView={incidentStart} onViewChange={setIncidentStart} />
              )}
              {page === "threads" && (
                <ArchiveThreads
                  selected={thread}
                  onSelect={setThread}
                  onAfter={after}
                  onImage={setAttachment}
                />
              )}
              {page === "logs" && (
                <section className="ib-box">
                  <h2>/log/ — Журнал восстановления</h2>
                  <div className="ib-box-body">
                    <p>17.04.2004 — Каталог проектов восстановлен.</p>
                    <p>
                      18.04.2004 — Найдены три обсуждения. Записи пользователя
                      №000 появились после восстановления.
                    </p>
                    <p>
                      19.04.2004 — Контрольная сумма IMAGE_017 не совпадает.
                    </p>
                    <p>--.--.---- — Появился файл, которого не было.</p>
                    <details className="ib-missing">
                      <summary>RECORD_017 — показать запись</summary>
                      <p>[ запись исчезла из последней копии ]</p>
                      <button
                        className="ib-link"
                        onClick={() => {
                          navigate("files");
                          setOpened("null");
                        }}
                      >
                        Остался только 000.TXT »
                      </button>
                    </details>
                  </div>
                </section>
              )}
              {page === "zero" && (
                <section className="ib-box">
                  <h2>/000/ — Пользователь №000</h2>
                  <img
                    className="retro-profile-avatar"
                    src="/archive/user-000.png"
                    alt="Портрет пользователя №000"
                  />
                  <div className="ib-box-body">
                    <p>
                      Регистрация: раньше первой записи. Права: только чтение.
                    </p>
                    <p>Последняя активность: после вашего входа.</p>
                    <p>Некоторые страницы помнят больше, чем должны.</p>
                    <button
                      className="ib-link"
                      onClick={() => setHidden(!hidden)}
                      aria-expanded={hidden}
                    >
                      №000
                    </button>
                    {hidden && (
                      <p className="ib-hidden">
                        «Спасибо, что заметили. Я не хотел исчезнуть между двумя
                        версиями себя».
                      </p>
                    )}
                    <p>
                      <button className="ib-link" onClick={after}>
                        Найти AFTER.TXT »
                      </button>
                    </p>
                    <details>
                      <summary>Просмотреть заголовки страницы</summary>
                      <p>LOCATION: /000/before/</p>
                      <button
                        className="ib-link"
                        onClick={() => {
                          setHidden(true);
                          setOpened("null");
                          setPage("files");
                        }}
                      >
                        Открыть оставшуюся страницу »
                      </button>
                    </details>
                  </div>
                </section>
              )}
            </main>
            <aside className="retro-right">
              <section>
                <h2>/о_проекте/</h2>
                <button
                  className="retro-avatar-button"
                  onClick={() => navigate("zero")}
                  aria-label="Открыть профиль пользователя №000"
                >
                  <img
                    src="/archive/user-000.png"
                    alt="Портрет вымышленного пользователя №000"
                  />
                </button>
                <p>Личный архив разработчика.</p>
                <p>
                  Здесь собраны мои проекты, заметки и некоторые... находки.
                </p>
                <p>Что из этого реально — решать тебе.</p>
              </section>
              <section>
                <h2>/файлы/</h2>
                <ul>
                  <li>
                    <button onClick={() => {
                      setIncidentStart("system");
                      navigate("incident");
                    }}>▤ &nbsp;SYSTEM_RECOVERY.EXE</button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setOpened("readme");
                        navigate("files");
                      }}
                    >
                      ▤ &nbsp;readme.txt
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("logs")}>
                      ▤ &nbsp;log_2004.txt
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setAttachment("corridor")}>
                      ▧ &nbsp;image_017.jpg
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("investigation")}>
                      ▤ &nbsp;???.bin
                    </button>
                  </li>
                </ul>
                <button
                  onClick={() => navigate("investigation")}
                  aria-label="Открыть расследование из списка файлов"
                >
                  INVESTIGATION.TXT
                </button>
              </section>
            </aside>
          </div>
          <footer className="ib-footer">
            <p>
              <button onClick={() => navigate("home")}>Home</button> ·{" "}
              <button onClick={() => navigate("about")}>About</button> ·{" "}
              <button onClick={() => navigate("logs")}>Logs</button> ·{" "}
              <button
                onClick={() => {
                  setSettings(!settings);
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
              >
                Settings
              </button>{" "}
              · <button onClick={onExit}>В обычное портфолио</button>
            </p>
            <p>DUALITY ARCHIVE © 2004–???? · художественный архив</p>
            <p className="ib-fine">
              Все персонажи, даты и архивные события вымышлены. Изображения —
              авторские иллюстрации.
            </p>
          </footer>
        </div>
      )}
      <ArchiveImage image={attachment} onClose={() => setAttachment(null)} />
    </div>
  );
}
