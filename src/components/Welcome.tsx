import { Arrow, Mark } from "./Mark";
export default function Welcome({
  onContinue,
  onSecret,
}: {
  onContinue: () => void;
  onSecret: () => void;
}) {
  return (
    <div className="welcome">
      <header className="welcome-header">
        <a className="wordmark" href="#" aria-label="DUALITY, главная">
          <Mark small /> DUALITY<span className="reg">®</span>
        </a>
        <span className="micro">PERSONAL SPACE / VOL. 01</span>
      </header>
      <main className="welcome-main">
        <div className="eyebrow">
          <span className="status-dot" /> ДОБРО ПОЖАЛОВАТЬ В МОЁ ПРОСТРАНСТВО
        </div>
        <h1>
          Всё начинается
          <br />с <em>любопытства.</em>
        </h1>
        <p>
          Идеи обретают форму. Код становится опытом.
          <br />
          Рад, что вы здесь.
        </p>
        <button className="pill" onClick={onContinue}>
          Продолжить <Arrow />
        </button>
        <div className="welcome-sculpture" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="sculpture-core" />
          <span className="coordinate">
            FIG. 01 — TWO SIDES OF THE SAME THING
          </span>
        </div>
      </main>
      <footer className="welcome-footer">
        <span>DESIGNED TO BE EXPLORED.</span>
        <button
          className="secret-hit"
          aria-label="Исследовать деталь"
          onClick={onSecret}
        >
          <span />
        </button>
        <span>© {new Date().getFullYear()} DUALITY</span>
      </footer>
    </div>
  );
}
