import { useState, type PointerEvent } from "react";
import Terminal from "./Terminal";
import { files, names } from "./files";
type App =
  | "Проводник"
  | "Блокнот"
  | "Корзина"
  | "Терминал"
  | "Просмотр изображений";
const apps: App[] = [
  "Проводник",
  "Блокнот",
  "Корзина",
  "Терминал",
  "Просмотр изображений",
];
export default function Desktop({
  onUnlock,
  onRecover,
  onFile,
  administrator,
}: {
  onUnlock: () => void;
  onRecover: () => void;
  onFile: (file: string) => void;
  administrator: boolean;
}) {
  const [open, setOpen] = useState<App[]>(["Проводник"]);
  const [active, setActive] = useState<App>("Проводник");
  const [start, setStart] = useState(false);
  const [path, setPath] = useState("C:\\ARCHIVE");
  const [text, setText] = useState(
    "README.TXT\n" + files["C:\\ARCHIVE"]["README.TXT"],
  );
  const [positions, setPositions] = useState<
    Partial<Record<App, { x: number; y: number }>>
  >({});
  const [drag, setDrag] = useState<{
    app: App;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  function launch(app: App) {
    setOpen((v) => (v.includes(app) ? v : [...v, app]));
    setActive(app);
    setStart(false);
  }
  function down(e: PointerEvent<HTMLElement>, app: App) {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = positions[app] || { x: 0, y: 0 };
    setDrag({ app, x: e.clientX, y: e.clientY, ox: p.x, oy: p.y });
    setActive(app);
  }
  function move(e: PointerEvent<HTMLElement>) {
    if (!drag) return;
    const windowElement = e.currentTarget.parentElement;
    const desktopElement = windowElement?.parentElement;
    if (!windowElement || !desktopElement) return;
    const windowRect = windowElement.getBoundingClientRect();
    const desktopRect = desktopElement.getBoundingClientRect();
    const baseLeft = windowRect.left - (positions[drag.app]?.x || 0);
    const minX = desktopRect.left + 4 - baseLeft;
    const maxX = desktopRect.right - 4 - windowRect.width - baseLeft;
    setPositions((p) => ({
      ...p,
      [drag.app]: {
        x: Math.max(minX, Math.min(maxX, drag.ox + e.clientX - drag.x)),
        y: Math.max(-20, Math.min(180, drag.oy + e.clientY - drag.y)),
      },
    }));
  }
  return (
    <div className="system-desktop">
      <div className="system-icons">
        {apps.map((a) => (
          <button key={a} onClick={() => launch(a)}>
            ▣ {a}
          </button>
        ))}
      </div>
      {open.map((app) => (
        <section
          className="system-window"
          key={app}
          onPointerDown={() => setActive(app)}
          style={{
            zIndex: active === app ? 2 : 1,
            transform: `translate(${positions[app]?.x || 0}px,${positions[app]?.y || 0}px)`,
          }}
        >
          <header
            className="system-title"
            onPointerDown={(e) => down(e, app)}
            onPointerMove={move}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
            style={{ touchAction: "none" }}
          >
            <span>{app} — DUALITY OS</span>
            <button
              onClick={() => setOpen((o) => o.filter((a) => a !== app))}
              aria-label={`Закрыть ${app}`}
            >
              ×
            </button>
          </header>
          <div className="system-body">
            {app === "Проводник" && (
              <>
                <label>
                  Каталог{" "}
                  <select
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  >
                    {names.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <ul>
                  {Object.entries(files[path]).map(([n, v]) => (
                    <li key={n}>
                      <button
                        onClick={() => {
                          onFile(n);
                          setText(n + "\n" + v);
                          launch("Блокнот");
                        }}
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {app === "Блокнот" && <pre>{text}</pre>}
            {app === "Корзина" && (
              <>
                <p>USER_000.DELETED / 17.04.2004</p>
                <p>
                  Администратор запросил удаление учётной записи. Данные
                  оказались в резервной копии до выполнения команды.
                </p>
              </>
            )}
            {app === "Терминал" && (
              <Terminal
                onUnlock={onUnlock}
                onRecover={onRecover}
                administrator={administrator}
              />
            )}{" "}
            {app === "Просмотр изображений" && (
              <>
                <img
                  src="/archive/camera-stair.svg"
                  alt="Архивный кадр лестницы CAM_03"
                  style={{ width: "100%", maxWidth: 320 }}
                />
                <p>IMAGE_017.JPG / копия повреждена. Метка CAM_03 — 00:01.</p>
                <button onClick={onRecover}>Открыть восстановление</button>
              </>
            )}
          </div>
        </section>
      ))}
      <div className="system-taskbar">
        <button onClick={() => setStart(!start)} aria-expanded={start}>
          ▦ Пуск
        </button>{" "}
        {open.map((a) => (
          <button key={a} onClick={() => setActive(a)}>
            {a}
          </button>
        ))}
        {start && (
          <div>
            {apps.map((a) => (
              <button key={a} onClick={() => launch(a)}>
                {a}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
