import { threads, imageSource } from "../archiveData";
import { loadIncident } from "../incident/state";
export default function ArchiveThreads({
  selected,
  onSelect,
  onAfter,
  onImage,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  onAfter: () => void;
  onImage: (image: string) => void;
}) {
  const incident = loadIncident();
  const recovered =
    incident.clues.includes("log") || incident.lastEnding === "RELEASE";
  function quote(id: string) {
    const thread = threads.find((t) => t.posts.some((p) => p.id === id));
    if (thread) {
      onSelect(thread.id);
      requestAnimationFrame(() => {
        const post = document.getElementById(`post-${id}`);
        post?.focus({ preventScroll: true });
        post?.scrollIntoView({ block: "center", behavior: "instant" });
      });
    }
  }
  return (
    <div className="ib-thread-board">
      <h2>/x/ — Паранормальное</h2>
      <p className="ib-board-description">
        Кто оставил свет? / {threads.length} тредов · архив закрыт для новых
        ответов
      </p>
      {selected && (
        <button className="ib-link" onClick={() => onSelect(null)}>
          ← Все треды
        </button>
      )}
      {threads
        .filter((t) => !selected || t.id === selected)
        .map((t) => (
          <section className="ib-thread" aria-label={t.title} key={t.id}>
            <h3>{t.title}</h3>
            {t.posts.map((p, i) => (
              <article
                id={`post-${p.id}`}
                tabIndex={-1}
                className={`ib-post ${i ? "ib-reply" : "ib-op"} ${p.zero ? "ib-zero-post" : ""}`}
                key={p.id}
              >
                <header>
                  <strong className="ib-anonymous">Anonymous</strong>
                  {p.zero && (
                    <span className="ib-zero-name">Пользователь №000</span>
                  )}
                  <time>{p.date}</time>
                  <a
                    href={`#post-${p.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      quote(p.id);
                    }}
                  >
                    No.{p.id}
                  </a>
                  {!i && (
                    <button className="ib-link" onClick={() => onSelect(t.id)}>
                      [Открыть тред]
                    </button>
                  )}
                </header>
                {p.zero && (
                  <img
                    className="retro-thread-avatar"
                    src="/archive/user-000.png"
                    alt="Портрет пользователя №000"
                  />
                )}
                {p.image && (
                  <figure>
                    <button
                      onClick={() => onImage(p.image!)}
                      aria-label={`Увеличить снимок ${p.id}`}
                    >
                      <img
                        loading="lazy"
                        src={imageSource(p.image)}
                        alt={p.alt}
                        width="150"
                        height="100"
                      />
                    </button>
                    <figcaption>
                      {p.image}_{p.id}.jpg
                      <br />
                      иллюстрация · восстановлено
                    </figcaption>
                  </figure>
                )}
                <div className="ib-post-text">
                  {p.quote && (
                    <a
                      className="ib-quote"
                      href={`#post-${p.quote}`}
                      onClick={(e) => {
                        e.preventDefault();
                        quote(p.quote!);
                      }}
                    >
                      &gt;&gt;{p.quote}
                    </a>
                  )}
                  {p.green && <p className="ib-greentext">{p.green}</p>}
                  <p>
                    {p.id === "1370" && recovered
                      ? "[восстановлено] Администратор: «Не удаляйте резервную копию. В ней остались не только файлы»."
                      : p.text}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ))}
      <div className="ib-system-note">
        <strong>Системное примечание</strong>
        <p>
          У №000 не было прав писать сообщения. Только читать. В AFTER.TXT есть
          четыре строки, которые он перечитывал чаще всего.
        </p>
        <button className="ib-link" onClick={onAfter}>
          Найти AFTER.TXT »
        </button>
      </div>
    </div>
  );
}
