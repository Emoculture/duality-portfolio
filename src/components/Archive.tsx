import { useState } from "react";
import { portfolio } from "../data";
import { validEcho } from "../state";
type Page = "home" | "projects" | "threads" | "about" | "files";
const messages = [
  {
    id: "001",
    date: "17/04/04 00:01",
    name: "Anonymous",
    title: "Кто-нибудь помнит этот адрес?",
    text: "Нашёл резервную копию на старом диске. Все страницы на месте, но в списке пользователей только одна запись. Нулевая.",
  },
  {
    id: "002",
    date: "17/04/04 00:03",
    name: "Anonymous",
    title: "re: Кто-нибудь помнит этот адрес?",
    text: "На снимке нет людей. Но монитор включён. Кто-то должен был его включить.",
  },
  {
    id: "000",
    date: "17/04/04 --:--",
    name: "Пользователь №000",
    title: "re: вы всё ещё здесь",
    text: "Это не резервная копия человека. Это резервная копия места, в котором его ждали. Пока кто-то открывает страницу, место существует.",
  },
];
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
  const [page, setPage] = useState<Page>("home");
  const [settings, setSettings] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hidden, setHidden] = useState(false);
  const [opened, setOpened] = useState("readme");
  return (
    <div className="archive">
      <a className="skip-link" href="#archive-main">
        К содержимому
      </a>
      <header className="browser-chrome">
        <div className="window-bar">
          <span>DUALITY ARCHIVE — Internet Explorer [offline]</span>
          <button onClick={onExit} aria-label="Завершить сеанс">
            ×
          </button>
        </div>
        <div className="browser-toolbar">
          <button onClick={onExit}>← Завершить сеанс</button>
          <button onClick={() => setPage("home")}>⌂ Домой</button>
          <button
            onClick={() => setSettings(!settings)}
            aria-expanded={settings}
          >
            Настройки
          </button>
        </div>
        <div className="address-bar">
          <span>Адрес</span>
          <span>archive://duality/{page}/</span>
          <span>↵</span>
        </div>
      </header>
      <div className="archive-shell">
        <div className="archive-masthead">
          <div>
            <span className="archive-eyebrow">
              RECOVERED PERSONAL DIRECTORY / EST. 2004
            </span>
            <h1>
              duality<span>_archive</span>
            </h1>
            <p>некоторые страницы помнят больше, чем должны.</p>
          </div>
          <div className="archive-stamp">
            LAST SEEN
            <br />
            <strong>17.04.2004</strong>
            <br />
            USER: 000
          </div>
        </div>
        <nav className="archive-nav" aria-label="Разделы архива">
          {(["home", "projects", "threads", "about", "files"] as Page[]).map(
            (p) => (
              <button
                key={p}
                className={page === p ? "selected" : ""}
                aria-current={page === p ? "page" : undefined}
                onClick={() => setPage(p)}
              >
                /{p}/
              </button>
            ),
          )}
        </nav>
        {settings && (
          <section className="archive-settings">
            <h2>Настройки сеанса</h2>
            <button
              className="retro-button"
              onClick={onReduced}
              aria-pressed={reduced}
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
          </section>
        )}
        <div className="archive-layout">
          <aside className="archive-sidebar">
            <div className="panel-title">СОСТОЯНИЕ УЗЛА</div>
            <dl>
              <dt>сервер</dt>
              <dd>локальная копия</dd>
              <dt>соединение</dt>
              <dd>
                <span className="archive-dot" /> установлено
              </dd>
              <dt>посетителей</dt>
              <dd>000001</dd>
              <dt>последний вход</dt>
              <dd>сейчас</dd>
            </dl>
            <div
              className="sidebar-art"
              role="img"
              aria-label="Стилизованный пустой дверной проём"
            >
              <div />
              <span>IS ANYBODY THERE?</span>
            </div>
            <p className="sidebar-note">
              Если изображение кажется знакомым, это ещё ничего не значит.
            </p>
            <div className="old-badge">
              BEST VIEWED
              <br />
              WITH CURIOSITY
            </div>
            <button className="text-link" onClick={() => setHidden(!hidden)}>
              №000
            </button>
            {hidden && (
              <p className="hidden-message">
                «Спасибо, что заметили. Я не хотел исчезнуть между двумя
                версиями себя».
              </p>
            )}
          </aside>
          <main id="archive-main" className="archive-main" key={page}>
            <div className="path-line">
              INDEX &gt; {page.toUpperCase()} <span>[ READ ONLY ]</span>
            </div>
            {page === "home" && (
              <>
                <div className="archive-notice">
                  ВАЖНО: архив восстановлен не полностью. Не закрывайте
                  любопытство.
                </div>
                <h2>Вы нашли другую сторону.</h2>
                <p>
                  Этот каталог обнаружен на заброшенном сервере. Владелец
                  неизвестен. Его работы остались, а имя исчезло из каждого
                  файла.
                </p>
                <p>
                  Мы сохранили структуру, ссылки и то, что удалось прочитать.
                  Сообщения пользователя №000 появились уже после
                  восстановления.
                </p>
                <div
                  className="archive-hero-art"
                  role="img"
                  aria-label="Авторская иллюстрация монитора в пустой комнате"
                >
                  <div className="monitor">
                    <span>
                      YOU ARE
                      <br />
                      STILL HERE<span className="cursor">_</span>
                    </span>
                  </div>
                  <div className="floor-grid" />
                  <small>
                    CAPTURE_000 / SOURCE UNKNOWN / LOCAL ILLUSTRATION
                  </small>
                </div>
                <h3>Журнал восстановления</h3>
                <div className="archive-row">
                  <time>17.04.2004</time>
                  <span>Каталог проектов восстановлен.</span>
                  <button onClick={() => setPage("projects")}>открыть »</button>
                </div>
                <div className="archive-row">
                  <time>18.04.2004</time>
                  <span>Найдены три сообщения.</span>
                  <button onClick={() => setPage("threads")}>читать »</button>
                </div>
                <div className="archive-row">
                  <time>--.--.----</time>
                  <span>Появился файл, которого не было.</span>
                  <button onClick={() => setPage("files")}>проверить »</button>
                </div>
              </>
            )}
            {page === "projects" && (
              <>
                <h2>Каталог работ / 02 записи</h2>
                <p>Названия и адреса сохранены без изменений.</p>
                {portfolio.projects.map((p) => (
                  <article className="archive-project" key={p.id}>
                    <span className="record-id">
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
                <p className="redacted">
                  [ Имя автора не найдено. Работы — найдены. ]
                </p>
              </>
            )}
            {page === "threads" && (
              <>
                <h2>/threads/ — кто оставил свет?</h2>
                <p className="archive-meta">
                  3 треда · архив закрыт для новых ответов
                </p>
                {messages.map((m) => (
                  <article
                    className={`thread ${m.id === "000" ? "user-zero" : ""}`}
                    key={m.id}
                  >
                    <header>
                      <strong>{m.name}</strong>
                      <time>{m.date}</time>
                      <span>No.{m.id}</span>
                    </header>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                  </article>
                ))}
                <article className="thread">
                  <header>
                    <strong>Anonymous</strong>
                    <time>19/04/04 03:12</time>
                    <span>No.017</span>
                  </header>
                  <h3>Тред #017 / комната без адреса</h3>
                  <p>
                    Сравнил два снимка. На первом монитор был выключен. На
                    втором появилось слово HERE. Никто не загружал второй
                    снимок.
                  </p>
                  <p className="archive-meta">
                    Ответ №000: «Комнаты меняются, когда в них возвращаются».
                  </p>
                </article>
                <article className="thread">
                  <header>
                    <strong>Anonymous</strong>
                    <time>20/04/04 01:07</time>
                    <span>No.024</span>
                  </header>
                  <h3>Тред #024 / ноль — тоже номер</h3>
                  <p>
                    В старом коде первая запись имеет индекс 0. Может, он не
                    посторонний. Может, это самая первая версия владельца,
                    которую забыли при обновлении?
                  </p>
                  <p className="archive-meta">
                    Ответ №000: «Ты почти вспомнил».
                  </p>
                </article>
                <div className="thread">
                  <strong>Системное примечание</strong>
                  <p>
                    У №000 не было прав писать сообщения. Только читать. В файле
                    AFTER.TXT есть четыре строки, которые он перечитывал чаще
                    всего.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setPage("files");
                      setOpened("after");
                    }}
                  >
                    Найти AFTER.TXT »
                  </button>
                </div>
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
                <div className="file-note">
                  <strong>{portfolio.name}</strong>
                  <p>{portfolio.about}</p>
                </div>
                <h3>Сохранившиеся инструменты</h3>
                <p>{portfolio.skills.join(" · ")}</p>
                <p>
                  Изображения нарисованы средствами CSS специально для этого
                  сайта. Чужие фотографии и внешние медиа не используются.
                </p>
                <button className="retro-button" onClick={onExit}>
                  Вернуться в обычное портфолио
                </button>
              </>
            )}
            {page === "files" && (
              <>
                <h2>Индекс файлов</h2>
                <div className="file-tabs">
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
                <div className="archive-document">
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
                    <div className="puzzle-reward" role="status">
                      <strong>
                        LIGHT_KEEPER / СКРЫТАЯ ЗАПИСЬ ВОССТАНОВЛЕНА
                      </strong>
                      <p>
                        «Теперь я вспомнил. Я был первой версией. Не ошибкой и
                        не призраком. Просто началом, которое забыли сохранить.
                        Спасибо за свет».
                      </p>
                      <span>Необязательная загадка пройдена. Архив цел.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
        <footer className="archive-footer">
          <span>DUALITY ARCHIVE © 2004–???? · художественный архив</span>
          <button onClick={onExit}>Завершить сеанс ↗</button>
        </footer>
      </div>
      <div className="archive-bottom">
        Готово <span>▣ Локальный архив · без сети</span>
      </div>
    </div>
  );
}
