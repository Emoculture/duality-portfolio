import { portfolio as p } from "../data";
import { Arrow, Mark } from "./Mark";
export default function Portfolio({
  onWelcome,
  discovered,
  onArchive,
  reduced,
  onReduced,
}: {
  onWelcome: () => void;
  discovered: boolean;
  onArchive: () => void;
  reduced: boolean;
  onReduced: () => void;
}) {
  return (
    <div className="portfolio">
      <header className="site-header">
        <button className="wordmark plain" onClick={onWelcome}>
          <Mark small /> DUALITY<span className="reg">®</span>
        </button>
        <nav aria-label="Основная навигация">
          <a href="#about">Обо мне</a>
          <a href="#skills">Навыки</a>
          <a href="#projects">Проекты</a>
          <a href="#services">Услуги</a>
        </nav>
        <a className="header-contact" href="#contact">
          Давайте поговорим <Arrow />
        </a>
      </header>
      <main>
        <section className="hero section" id="home">
          <div className="eyebrow">
            <span className="status-dot" /> DIGITAL CRAFT & HUMAN CONNECTION
          </div>
          <h1>
            Создаю цифровое.
            <br />
            <span className="serif">Сохраняю человеческое.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              Разработка, дизайн и немного любопытства.
              <br />
              Превращаю идеи в интерфейсы,
              <br />
              которые хочется исследовать.
            </p>
            <a className="pill" href="#projects">
              Избранные проекты <span>↓</span>
            </a>
            <span className="hero-index micro">
              INDEPENDENT DEVELOPER
              <br />
              BASED ON THE INTERNET
            </span>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-label">DUALITY / EXPLORATION 001</div>
            <div className="giant-d">
              D<span>D</span>
            </div>
            <div className="art-bottom">
              <span>FORM FOLLOWS CURIOSITY</span>
              <span>↙ 55° / 37° ↗</span>
            </div>
          </div>
        </section>
        <section className="section about-grid" id="about">
          <div className="section-kicker">01 / ОБО МНЕ</div>
          <div>
            <h2>
              За каждым интерфейсом —<br />
              <span className="serif">человек и его идея.</span>
            </h2>
            <p className="body-copy">{p.about}</p>
            <div className="identity">
              <Mark small />
              <div>
                <strong>{p.name}</strong>
                <small>{p.role} · данные для редактирования</small>
              </div>
            </div>
          </div>
        </section>
        <section className="section skills-section" id="skills">
          <div className="section-kicker">02 / ИНСТРУМЕНТЫ</div>
          <h2>
            Хорошие идеи.
            <br />
            <span className="serif">Подходящие инструменты.</span>
          </h2>
          <p className="muted">
            Стек этого сайта и направления работы. Уточните список под свой
            опыт.
          </p>
          <div className="skills">
            {p.skills.map((s) => (
              <span key={s}>
                {s}
                <span aria-hidden="true">↗</span>
              </span>
            ))}
          </div>
        </section>
        <section className="section" id="projects">
          <div className="section-heading">
            <div>
              <div className="section-kicker">03 / ИЗБРАННОЕ</div>
              <h2>
                Из идеи <span className="serif">в реальность.</span>
              </h2>
            </div>
            <span className="micro">SELECTED WORK / 01—02</span>
          </div>
          <div className="project-grid">
            {p.projects.map((project) => (
              <article className="project" key={project.id}>
                <a
                  className={`project-visual ${project.kind}`}
                  href={project.href}
                  target={project.kind === "cut" ? "_blank" : undefined}
                  rel={project.kind === "cut" ? "noreferrer" : undefined}
                  aria-label={`Открыть ${project.title}`}
                >
                  <span className="project-number">PROJECT / {project.id}</span>
                  {project.kind === "cut" ? (
                    <div className="cut-art">
                      <span>LESS TALK.</span>
                      <strong>
                        MORE
                        <br />
                        CULTURE.
                      </strong>
                      <i>THE CUT CULTURE PROJECT</i>
                    </div>
                  ) : (
                    <div className="duality-art">
                      <Mark />
                      <span>
                        two sides.
                        <br />
                        <em>one identity.</em>
                      </span>
                    </div>
                  )}
                  <span className="round-arrow">
                    <Arrow />
                  </span>
                </a>
                <div className="project-meta">
                  <h3>{project.title}</h3>
                  <span className="micro">{project.category}</span>
                </div>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section" id="services">
          <div className="section-kicker">04 / ЧЕМ МОГУ ПОМОЧЬ</div>
          <h2>
            От первой мысли
            <br />
            <span className="serif">до последнего пикселя.</span>
          </h2>
          <div className="services">
            {p.services.map((s, i) => (
              <article key={s.title}>
                <span className="micro">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>
        <section className="section contact-section" id="contact">
          <div className="eyebrow">
            <span className="status-dot" /> СЛЕДУЮЩИЙ ПРОЕКТ МОЖЕТ БЫТЬ ВАШИМ
          </div>
          <h2>
            Есть идея?
            <br />
            <span className="serif">Давайте обсудим.</span>
          </h2>
          {p.email ? (
            <a className="pill" href={`mailto:${p.email}`}>
              Написать <Arrow />
            </a>
          ) : (
            <p className="contact-placeholder">
              Контакт скоро появится здесь.
              <br />
              <small>Владельцу: добавьте email в src/data.ts.</small>
            </p>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <span className="wordmark">
          <Mark small /> DUALITY
        </span>
        <span className="micro">
          © {new Date().getFullYear()} · MADE WITH CURIOSITY
        </span>
        <div className="footer-actions">
          <button onClick={onReduced} aria-pressed={reduced}>
            Меньше анимаций: {reduced ? "вкл" : "выкл"}
          </button>
          {discovered && (
            <button onClick={onArchive}>Вернуться в архив ↗</button>
          )}
          <a href="#home">Наверх ↑</a>
        </div>
      </footer>
    </div>
  );
}
