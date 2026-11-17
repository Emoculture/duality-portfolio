import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { add, loadIncident, saveIncident } from "../incident/state";
import type { ArchivePage } from "../archiveData";
import type { DecayStage } from "../incident/ArchiveDecayEngine";
import { playArchiveClick } from "./SoundSetting";
import "./archive-desktop.css";

type WindowName = "browser" | "navigator" | "memory" | "you";
const titles: Record<WindowName, string> = { browser: "ARCHIVE.EXE", navigator: "Проводник", memory: "MEMORY.LOG", you: "YOU" };
const links: [string, ArchivePage][] = [["Главная", "home"], ["Проекты", "projects"], ["Треды", "threads"], ["Об авторе", "about"], ["Файлы", "files"], ["Расследование", "incident"]];

export default function ArchiveDesktop({ children, stage, navigate, onExit }: { children: ReactNode; stage: DecayStage; navigate: (page: ArchivePage) => void; onExit: () => void }) {
  const desktop = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<WindowName[]>(["browser"]);
  const [order, setOrder] = useState<WindowName[]>(["browser"]);
  const [positions, setPositions] = useState<Record<WindowName, { x: number; y: number }>>({ browser: { x: 0, y: 0 }, navigator: { x: 110, y: 80 }, memory: { x: 180, y: 140 }, you: { x: 240, y: 170 } });
  const dragging = useRef<{ name: WindowName; startX: number; startY: number; x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(0);
  const [start, setStart] = useState(false);
  const [sound, setSound] = useState(false);
  const focus = useCallback((name: WindowName) => {
    setOpen((values) => values.includes(name) ? values : [...values, name]);
    setOrder((values) => [...values.filter((value) => value !== name), name]);
    setStart(false);
  }, []);
  function launch(name: WindowName) { if (!open.includes(name)) playArchiveClick("open"); focus(name); }
  useEffect(() => {
    const changed = () => setFull(document.fullscreenElement === desktop.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setClock((value) => (value + 1) % 60), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    const refresh = () => { try { setSound(localStorage.getItem("duality.sound.enabled") === "true"); } catch { setSound(false); } };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("duality:sound", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("duality:sound", refresh); };
  }, []);
  useEffect(() => {
    const clamp = () => setPositions((p) => ({
      browser: { x: Math.max(-60, Math.min(0, p.browser.x)), y: Math.max(0, Math.min(100, p.browser.y)) },
      navigator: { x: Math.max(0, Math.min(window.innerWidth - Math.min(360, window.innerWidth - 20), p.navigator.x)), y: Math.max(0, Math.min(window.innerHeight - 90, p.navigator.y)) },
      memory: { x: Math.max(0, Math.min(window.innerWidth - Math.min(360, window.innerWidth - 20), p.memory.x)), y: Math.max(0, Math.min(window.innerHeight - 90, p.memory.y)) },
      you: { x: Math.max(0, Math.min(window.innerWidth - Math.min(360, window.innerWidth - 20), p.you.x)), y: Math.max(0, Math.min(window.innerHeight - 90, p.you.y)) },
    }));
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);
  async function fullscreen() {
    try {
      if (document.fullscreenElement === desktop.current) await document.exitFullscreen();
      else if (desktop.current?.requestFullscreen) await desktop.current.requestFullscreen();
      else setError("Полноэкранный режим не поддерживается браузером.");
    } catch { setError("Не удалось открыть полноэкранный режим; работа в обычной вкладке доступна."); }
  }
  function down(event: PointerEvent<HTMLElement>, name: WindowName) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = positions[name];
    dragging.current = { name, startX: event.clientX, startY: event.clientY, x: p.x, y: p.y };
    focus(name);
  }
  function move(event: PointerEvent<HTMLElement>) {
    const drag = dragging.current;
    if (!drag) return;
    const x = drag.x + event.clientX - drag.startX;
    const y = drag.y + event.clientY - drag.startY;
    setPositions((p) => ({ ...p, [drag.name]: drag.name === "browser"
      ? { x: Math.max(-60, Math.min(0, x)), y: Math.max(0, Math.min(100, y)) }
      : { x: Math.max(0, Math.min(window.innerWidth - Math.min(360, window.innerWidth - 20), x)), y: Math.max(0, Math.min(window.innerHeight - 90, y)) } }));
  }
  function title(name: WindowName) {
    return <header className="archive-os-title" onPointerDown={(event) => down(event, name)} onPointerMove={move} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}>
      <span>{titles[name]}</span><button onClick={() => { playArchiveClick("close"); setOpen((values) => values.filter((value) => value !== name)); }} aria-label={`Закрыть окно ${titles[name]}`}>×</button>
    </header>;
  }
  function openPage(page: ArchivePage) { navigate(page); launch("browser"); }
  function rememberYou() {
    const save = loadIncident();
    if (!save.memory.events.includes("decay-found:you")) saveIncident({ ...save, memory: { ...save.memory, events: add(save.memory.events, "decay-found:you") } });
  }
  function openYou() {
    rememberYou();
    launch("you");
  }
  const progress = loadIncident();
  return <div className="archive-os" data-os-decay={stage} ref={desktop}>
    <div className="archive-os-controls"><button onClick={fullscreen}>{full ? "⛶ EXIT FULLSCREEN" : "⛶ FULLSCREEN"}</button>{error && <span role="status">{error}</span>}</div>
    <nav className="archive-os-icons" aria-label="Рабочий стол ARCHIVE_OS">
      {links.map(([label, page]) => <button key={page} onClick={() => openPage(page)}><span aria-hidden="true">▣</span>{label}</button>)}
      <button onClick={() => launch("navigator")}><span aria-hidden="true">▤</span>Проводник</button>
      <button onClick={() => launch("memory")}><span aria-hidden="true">▧</span>MEMORY.LOG</button>
    </nav>
    <section className="archive-os-browser" aria-label="Окно архива" hidden={!open.includes("browser")} onPointerDown={() => focus("browser")} style={{ left: positions.browser.x, top: positions.browser.y, zIndex: 10 + order.indexOf("browser") }}>
      {title("browser")}{children}
    </section>
    {open.includes("navigator") && <section className="archive-os-window" aria-label="Окно проводника" onPointerDown={() => focus("navigator")} style={{ left: positions.navigator.x, top: positions.navigator.y, zIndex: 10 + order.indexOf("navigator") }}>
      {title("navigator")}<div className="archive-os-body"><p>ARCHIVE:\\</p>{stage >= 1 && <p>DATE: 2004.??.07 / повреждённый индекс</p>}{links.map(([label, page]) => <button key={page} onClick={() => openPage(page)}>▣ {label}</button>)}{stage >= 3 && <button onClick={openYou}>▧ YOU</button>}</div>
    </section>}
    {open.includes("memory") && <section className="archive-os-window" aria-label="Окно журнала памяти" onPointerDown={() => focus("memory")} style={{ left: positions.memory.x, top: positions.memory.y, zIndex: 10 + order.indexOf("memory") }}>
      {title("memory")}<div className="archive-os-body"><p>MEMORY.LOG / локальная копия</p><p>Файлы: {progress.files.length} · улики: {progress.clues.length}</p><p>Для исследования откройте соответствующий раздел архива.</p><button onClick={() => openPage("incident")}>Открыть расследование</button></div>
    </section>}
    {open.includes("you") && <section className="archive-os-window" aria-label="Окно YOU" onPointerDown={() => focus("you")} style={{ left: positions.you.x, top: positions.you.y, zIndex: 10 + order.indexOf("you") }}>
      {title("you")}<div className="archive-os-body"><p>YOU / неопознанная архивная запись</p><p>Источник неизвестен. Это вымышленный файл; сведения о посетителе не используются.</p><p>«Копия ответила раньше, чем её открыли».</p></div>
    </section>}
    {stage >= 3 && <details className="archive-os-mobile-you" onToggle={(event) => { if (event.currentTarget.open) rememberYou(); }}><summary>▧ YOU / неопознанная запись</summary><p>«Копия ответила раньше, чем её открыли». Содержимое вымышлено и не использует сведения о посетителе.</p></details>}
    <footer className="archive-os-taskbar"><button onClick={() => setStart(!start)} aria-expanded={start}>▦ ARCHIVE_OS</button>{open.map((name) => <button key={name} onClick={() => focus(name)} aria-pressed={order.at(-1) === name}>{titles[name]}</button>)}<button onClick={onExit} aria-label="Выход из ARCHIVE_OS">ВЫХОД</button><span className="archive-os-clock" aria-label="Индикатор звука">{sound ? "♪ ON" : "♪ OFF"}</span><span className="archive-os-clock">SYS · {stage === 4 ? `00:${String(59 - clock).padStart(2, "0")}` : `00:${String(clock).padStart(2, "0")}`}</span>{start && <div className="archive-os-start"><button onClick={() => launch("browser")}>ARCHIVE.EXE</button><button onClick={() => launch("navigator")}>Проводник</button><button onClick={() => launch("memory")}>MEMORY.LOG</button></div>}</footer>
  </div>;
}
