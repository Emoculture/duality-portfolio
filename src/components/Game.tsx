import { useEffect, useRef, useState } from "react";
import { validPassword } from "../state";
const files = [
  "README.TXT",
  "LOG_2004.TXT",
  "IMAGE_017.JPG",
  "ACCESS.EXE",
] as const;
type File = (typeof files)[number];
export default function Game({
  onExit,
  onWin,
}: {
  onExit: () => void;
  onWin: () => void;
}) {
  const [file, setFile] = useState<File | null>("README.TXT");
  const [visited, setVisited] = useState<File[]>(["README.TXT"]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [granted, setGranted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [file]);
  useEffect(() => {
    if (granted) {
      const t = setTimeout(onWin, 1400);
      return () => clearTimeout(t);
    }
  }, [granted, onWin]);
  function open(f: File) {
    setFile(f);
    setVisited((v) => (v.includes(f) ? v : [...v, f]));
  }
  return (
    <main className={`desktop ${granted ? "crt-transition" : ""}`}>
      <div className="desktop-top">
        <span>DUALITY RECOVERY / OFFLINE SESSION</span>
        <button onClick={onExit}>В обычное портфолио ↗</button>
      </div>
      <div className="desktop-icons">
        {files.map((f, i) => (
          <button className="desktop-icon" key={f} onClick={() => open(f)}>
            <span aria-hidden="true">{["▤", "▥", "▧", "▣"][i]}</span>
            {f}
            {visited.includes(f) && <small>открыт</small>}
          </button>
        ))}
      </div>
      <div className="desktop-watermark" aria-hidden="true">
        duality<span>personal computer</span>
      </div>
      {file && (
        <section className="retro-window" aria-label={file}>
          <div className="window-bar">
            <span>▣ {file}</span>
            <button onClick={() => setFile(null)} aria-label="Закрыть файл">
              ×
            </button>
          </div>
          <div className="window-menu">
            Файл <span>Правка</span>
            <span>Просмотр</span>
          </div>
          <div className="window-content">
            <h1 tabIndex={-1} ref={heading}>
              {file}
            </h1>
            {file === "README.TXT" && (
              <>
                <p>Если вы читаете это, резервная копия всё ещё жива.</p>
                <p>
                  Сервер забыл имя владельца. Остался только пользователь №000.
                  Он оставил три части ключа — по одной в каждом документе.
                </p>
                <div className="file-note">
                  ФРАГМЕНТ 1 / 3: <strong>ECHO</strong>
                </div>
                <p>
                  Порядок: README → журнал → изображение.
                  <br />
                  Между частями поставьте дефисы.
                </p>
                <p>
                  В журнале ищите месяц последнего успешного соединения. На
                  изображении — номер канала. Откройте ACCESS.EXE, когда ключ
                  будет собран.
                </p>
                <small>
                  Подсказки остаются доступными. Ограничения по времени нет.
                </small>
              </>
            )}
            {file === "LOG_2004.TXT" && (
              <>
                <p className="log-text">
                  [2004-04-17 00:00] BOOT OK
                  <br />
                  [2004-04-17 00:01] CONNECT OK
                  <br />
                  [2004-04-17 00:02] USER 000 JOINED
                  <br />
                  [2004-04-17 00:03] OWNER NOT FOUND
                  <br />
                  [2004-04-17 00:04] DO NOT CLOSE THE WINDOW
                </p>
                <div className="file-note">
                  ФРАГМЕНТ 2 / 3: месяц соединения,
                  <br />
                  две цифры — <strong>04</strong>.
                </div>
                <p>
                  №000: «Не путай дату и время. Последнюю часть я оставил на
                  снимке».
                </p>
              </>
            )}
            {file === "IMAGE_017.JPG" && (
              <>
                <div
                  className="evidence-image"
                  role="img"
                  aria-label="Авторская иллюстрация: пустой коридор, на экране надпись CHANNEL 17"
                >
                  <div className="hallway" />
                  <span>
                    NO SIGNAL
                    <br />
                    <strong>CHANNEL 17</strong>
                  </span>
                  <small>17.04.2004 / CAM_017</small>
                </div>
                <p>
                  На обороте: «Третья часть — номер канала, две цифры. Это
                  рисунок, а не фотография. Я не помню это место».
                </p>
                <div className="file-note">
                  ФРАГМЕНТ 3 / 3: <strong>17</strong>
                </div>
              </>
            )}
            {file === "ACCESS.EXE" && (
              <>
                <p>RECOVERY TERMINAL v0.0.4</p>
                <p>
                  Введите три части через дефис.
                  <br />
                  Порядок: README → LOG → IMAGE.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (validPassword(password)) {
                      setGranted(true);
                      setError("");
                    } else
                      setError(
                        "Ключ не совпал. Проверьте порядок частей и дефисы.",
                      );
                  }}
                >
                  <label htmlFor="password">Ключ доступа</label>
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="XXXX-00-00"
                    disabled={granted}
                  />
                  <button className="retro-button" disabled={granted}>
                    Открыть архив →
                  </button>
                  <p className="error" role="alert">
                    {error}
                  </p>
                </form>
              </>
            )}
          </div>
          <div className="window-status">
            {visited.filter((f) => f !== "ACCESS.EXE").length} / 3 документов
            исследовано <span>LOCAL DISK (C:)</span>
          </div>
        </section>
      )}
      {granted && (
        <div className="grant" role="status">
          <strong>ACCESS GRANTED</strong>
          <span>Пользователь №000 ожидает вас.</span>
        </div>
      )}
      <footer className="taskbar">
        <button onClick={() => open("README.TXT")}>▦ Пуск</button>
        <span>{file || "Рабочий стол"}</span>
        <time>00:00</time>
      </footer>
    </main>
  );
}
