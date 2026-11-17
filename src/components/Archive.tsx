import { useEffect, useRef, useState } from "react";
import { portfolio } from "../data";
import { validEcho } from "../state";
import { boards, threads, imageSource, type ArchivePage } from "../archiveData";
import ArchiveThreads from "./ArchiveThreads";
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
  const [settings, setSettings] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hidden, setHidden] = useState(false);
  const [opened, setOpened] = useState("readme");
  const [thread, setThread] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const heading = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [page, thread]);
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
            aria-current={page === p ? "page" : undefined}
            onClick={() => navigate(p)}
          >
            /{p}/
          </button>
        ),
      )}
    </nav>
  );
  return (
    <div className="archive-board">
      <a className="skip-link" href="#archive-main">
        К содержимому
      </a>
      <header className="ib-topbar">
        <span>[ archive://duality/ ]</span>
        <div>
          <button
            onClick={() => {
              setSettings(!settings);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            aria-expanded={settings}
          >
            Настройки
          </button>
          <span> / </span>
          <button onClick={onExit}>Завершить сеанс</button>
        </div>
      </header>
      <div className="ib-shell">
        <header className="ib-masthead">
          <h1 className="ib-brand">
            <button
              className="ib-logo"
              onClick={() => navigate("home")}
              aria-label="DUALITY ARCHIVE — главная"
            >
              <span className="ib-emblem" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>
                DUALITY <b>ARCHIVE</b>
              </span>
            </button>
          </h1>
          <p>Recovered from an unknown server</p>
        </header>
        {nav()}
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
        <main id="archive-main" ref={heading} tabIndex={-1} className="ib-main">
          {page === "home" && (
            <>
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
                  {threads.map((t) => (
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
              <h2>Каталог работ / 02 записи</h2>
              <p>Названия и адреса сохранены без изменений.</p>
              {portfolio.projects.map((p) => (
                <article className="ib-project" key={p.id}>
                  <span className="ib-record">
                    RECORD_{p.id} / STATUS: ONLINE
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div>{p.tags.join(" / ")}</div>
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
                    target={p.kind === "cut" ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {p.kind === "cut"
                      ? "Открыть CUT CULTURE ↗"
                      : "Открыть обычное портфолио ↗"}
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
                DUALITY. Пользователь №000, сервер и архивные события вымышлены.
                Даты относятся к истории, а не к реальному опыту автора.
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
                      Мы думали, №000 — это ошибка счётчика. Но счётчик считал
                      посетителей, а не пользователей.
                    </p>
                    <p>
                      Он не ждал конкретного человека. Он ждал, что кто-нибудь
                      останется достаточно долго, чтобы прочитать.
                    </p>
                    <p>
                      AFTER.TXT содержит последнее слово. Читайте начала строк.
                      Четыре латинские буквы.
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
                      <button className="retro-button">Оставить свет</button>
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
                    <strong>LIGHT_KEEPER / СКРЫТАЯ ЗАПИСЬ ВОССТАНОВЛЕНА</strong>
                    <p>
                      «Теперь я вспомнил. Я был первой версией. Не ошибкой и не
                      призраком. Просто началом, которое забыли сохранить.
                      Спасибо за свет».
                    </p>
                    <span>Необязательная загадка пройдена. Архив цел.</span>
                  </div>
                )}
              </div>
            </>
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
                  18.04.2004 — Найдены три обсуждения. Записи пользователя №000
                  появились после восстановления.
                </p>
                <p>19.04.2004 — Контрольная сумма IMAGE_017 не совпадает.</p>
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
              <div className="ib-box-body">
                <p>Регистрация: раньше первой записи. Права: только чтение.</p>
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
      <ArchiveImage image={attachment} onClose={() => setAttachment(null)} />
    </div>
  );
}
