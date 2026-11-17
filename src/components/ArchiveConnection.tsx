import { useEffect, useRef, useState } from "react";
import ArchivePortrait from "./ArchivePortrait";
import SoundSetting, { playArchiveClick } from "./SoundSetting";
import "./archive-connection.css";

export default function ArchiveConnection({ returning, stage, frame, reduced, onComplete }: {
  returning: boolean; stage: number; frame: "empty" | "occupied" | null; reduced: boolean; onComplete: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [short] = useState(() => reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const start = Date.now();
    const duration = short ? 1200 : 9200;
    const update = () => {
      const time = Date.now() - start;
      setElapsed(time);
      if (time >= duration) complete.current();
    };
    const interval = window.setInterval(update, 100);
    const fallback = window.setTimeout(() => complete.current(), duration + 300);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(interval); window.clearTimeout(fallback); document.removeEventListener("visibilitychange", update); };
  }, [short]);
  const progress = elapsed < 6200 ? 0 : elapsed < 6700 ? 14 : elapsed < 7300 ? 36 : elapsed < 7700 ? 64 : elapsed < 8200 ? 89 : 100;
  return (
    <main className={`connection-screen ${short ? "connection-short" : ""}`} aria-label="ARCHIVE CONNECTION SEQUENCE">
      <div className="connection-monitor">
        <h1>ARCHIVE CONNECTION SEQUENCE</h1>
        {short ? <p>CONNECTING TO ARCHIVE.LOCAL...<br />ACCESS GRANTED</p> : <>
          <div className="connection-log" aria-live="polite">
            <p>CONNECTING TO ARCHIVE.LOCAL...</p>
            {elapsed >= 650 && <p>HANDSHAKE REQUEST SENT</p>}
            {elapsed >= 1300 && <p>SERVER STATUS: UNKNOWN</p>}
            {elapsed >= 2000 && elapsed < 4200 && <p className="connection-error">ERROR: ACCESS DENIED</p>}
            {elapsed >= 2700 && elapsed < 4200 && <p>UNREGISTERED VISITOR DETECTED<br />IDENTITY VERIFICATION FAILED</p>}
            {elapsed >= 4200 && <p>WAIT...<br />{returning ? "THIS SESSION HAS BEEN SEEN BEFORE" : "NEW MEMORY SIGNATURE DETECTED"}<br />USER_000: RECOGNIZED</p>}
          </div>
          {elapsed >= 6000 && elapsed < 8350 && <div className="connection-window"><strong>RESTORING ARCHIVE MEMORY</strong><p>Последовательность воспроизведения: {progress}%</p><div className="connection-progress"><span style={{ width: `${progress}%` }} /></div></div>}
          {elapsed >= 6800 && elapsed < 7150 && <ArchivePortrait stage={stage} className="connection-face" alt="" />}
          {frame && elapsed >= 7350 && elapsed < 8200 && <svg className="connection-last-frame" viewBox="0 0 240 140" role="img" aria-label={frame === "empty" ? "Пустое кресло перед компьютером" : "Неподвижный силуэт в кресле перед компьютером"}>
            <rect width="240" height="140" fill="#141d17"/><path d="M0 110h240M35 110V30h170v80" fill="none" stroke="#4a5d4b"/><rect x="55" y="38" width="105" height="58" fill="#070b08" stroke="#81937c"/><text x="66" y="69" fill="#91b78b" fontSize="9">SESSION RESTORED</text><path d="M67 105h110M120 97v8M147 125h48M155 94v31h35V94" fill="none" stroke="#8d9686" strokeWidth="4"/>{frame === "occupied" && <path d="M165 88c-13-5-8-24 3-24s14 19 3 24c13 5 16 22 16 31h-39c0-12 3-26 17-31" fill="#090d0a" stroke="#506052"/>}
          </svg>}
          {elapsed >= 8350 && <p className="connection-final">{returning ? "YOU WERE NOT SUPPOSED TO RETURN." : "A NEW SESSION HAS BEGUN."}<br />{returning ? "WELCOME BACK." : "WELCOME."}</p>}
        </>}
        <SoundSetting className="connection-skip" />{" "}
        {elapsed >= 1000 && <button className="connection-skip" onClick={() => { playArchiveClick(); complete.current(); }}>Пропустить</button>}
      </div>
    </main>
  );
}
