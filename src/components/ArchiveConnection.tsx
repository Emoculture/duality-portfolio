import { useEffect, useRef, useState } from "react";
import SoundSetting, { playArchiveClick } from "./SoundSetting";
import "./archive-connection.css";

export default function ArchiveConnection({ returning, frame, reduced, onComplete }: {
  returning: boolean; stage: number; frame: "empty" | "occupied" | null; reduced: boolean; onComplete: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [short] = useState(() => reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const start = Date.now();
    const duration = short ? 1200 : 8600;
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
  const progress = elapsed < 2200 ? 0 : elapsed < 2600 ? 14 : elapsed < 3500 ? 36 : elapsed < 4600 ? 64 : elapsed < 6000 ? 89 : 100;
  return (
    <main className={`connection-screen ${short ? "connection-short" : ""}`} aria-label="ARCHIVE CONNECTION SEQUENCE">
      <div className="connection-monitor">
        <h1>RECOVERING RECORDING 000</h1>
        {short ? <p>RECOVERY COMPLETE<br />PLAYBACK STARTING...</p> : <>
          <div className="connection-log" aria-live="polite">
            <p>ARCHIVE CONNECTION ESTABLISHED</p>
            {elapsed >= 650 && <p>SEARCHING FOR RECOVERED RECORDINGS...</p>}
            {elapsed >= 1300 && <p>1 FILE FOUND</p>}
            {elapsed >= 4000 && <p>VIDEO SIGNAL DETECTED<br />AUDIO TRACK: DAMAGED<br />IDENTITY: UNKNOWN</p>}
            {elapsed >= 6000 && <p>RECOVERY COMPLETE<br />PLAYBACK STARTING...<br />{returning ? "RESTORING SESSION..." : "NEW MEMORY SIGNATURE DETECTED"}</p>}
          </div>
          {elapsed >= 2000 && elapsed < 7000 && <div className="connection-window"><strong>FILE: REC_0001<br />STATUS: CORRUPTED<br />ATTEMPTING RECOVERY...</strong><p>Восстановление записи: {progress}%</p><div className="connection-progress"><span style={{ width: `${progress}%` }} /></div></div>}
          {elapsed >= 4000 && elapsed < 6000 && <img src="/archive/witness/witness-master.png" className="connection-face" alt="" />}
          {frame && elapsed >= 7350 && elapsed < 8200 && <svg className="connection-last-frame" viewBox="0 0 240 140" role="img" aria-label={frame === "empty" ? "Пустое кресло перед компьютером" : "Неподвижный силуэт в кресле перед компьютером"}>
            <rect width="240" height="140" fill="#141d17"/><path d="M0 110h240M35 110V30h170v80" fill="none" stroke="#4a5d4b"/><rect x="55" y="38" width="105" height="58" fill="#070b08" stroke="#81937c"/><text x="66" y="69" fill="#91b78b" fontSize="9">SESSION RESTORED</text><path d="M67 105h110M120 97v8M147 125h48M155 94v31h35V94" fill="none" stroke="#8d9686" strokeWidth="4"/>{frame === "occupied" && <path d="M165 88c-13-5-8-24 3-24s14 19 3 24c13 5 16 22 16 31h-39c0-12 3-26 17-31" fill="#090d0a" stroke="#506052"/>}
          </svg>}
          {elapsed >= 7600 && <p className="connection-final connection-error">WARNING: SUBJECT IS STILL ALIVE.</p>}
          {elapsed >= 8400 && <div className="connection-black" aria-hidden="true" />}
        </>}
        <SoundSetting className="connection-skip" />{" "}
        {elapsed >= 1000 && <button className="connection-skip" onClick={() => { playArchiveClick(); complete.current(); }}>Пропустить</button>}
      </div>
    </main>
  );
}
