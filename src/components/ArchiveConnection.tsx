import { useEffect, useRef, useState } from "react";
import ArchivePortrait from "./ArchivePortrait";
import "./archive-connection.css";

export default function ArchiveConnection({ returning, stage, reduced, onComplete }: {
  returning: boolean; stage: number; reduced: boolean; onComplete: () => void;
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
          {elapsed >= 8350 && <p className="connection-final">{returning ? "YOU WERE NOT SUPPOSED TO RETURN." : "A NEW SESSION HAS BEGUN."}<br />{returning ? "WELCOME BACK." : "WELCOME."}</p>}
        </>}
        {elapsed >= 1000 && <button className="connection-skip" onClick={() => complete.current()}>Пропустить</button>}
      </div>
    </main>
  );
}
