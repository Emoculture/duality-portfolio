import { useEffect, useRef, useState } from "react";
import { add, loadIncident, saveIncident } from "./state";
import type { DecayStage } from "./ArchiveDecayEngine";

const messages = ["", "I REMEMBER YOU", "OBSERVER CONNECTED · USER COUNT: 2", "I CAN SEE THE FILE YOU OPENED · DISCONNECT DENIED", "YOU ARE NOT BROWSING THE ARCHIVE. THE ARCHIVE IS BROWSING YOU."];

/** Only a milestone reached during this archive session can show a transition. */
export default function ArchiveAnomalyManager({ stage, reduced, onExitWarning }: { stage: DecayStage; reduced: boolean; onExitWarning: (value: boolean) => void }) {
  const previous = useRef(stage);
  const [shown, setShown] = useState<DecayStage | null>(null);
  const [userCount, setUserCount] = useState(2);
  useEffect(() => {
    const before = previous.current;
    previous.current = stage;
    if (stage === 0 || stage <= before) return;
    const save = loadIncident();
    const key = `decay-shown:${stage}`;
    if (save.memory.events.includes(key)) return;
    saveIncident({ ...save, memory: { ...save.memory, events: add(save.memory.events, key) } });
    const lessMotion = reduced || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (lessMotion) return;
    setShown(stage);
    setUserCount(2);
    if (stage === 1) onExitWarning(true);
    const one = stage === 4 ? window.setTimeout(() => setUserCount(1), 1100) : null;
    const zero = stage === 4 ? window.setTimeout(() => setUserCount(0), 2200) : null;
    const timeout = window.setTimeout(() => { setShown(null); onExitWarning(false); }, 3800);
    return () => { window.clearTimeout(timeout); if (one !== null) window.clearTimeout(one); if (zero !== null) window.clearTimeout(zero); onExitWarning(false); };
  }, [stage, reduced, onExitWarning]);
  return <>
    {stage > 0 && <p className="decay-signal">{messages[stage]}</p>}
    {shown && <div className="decay-transition" role="status">
      <p>MEMORY SECTOR: DAMAGED</p><p>{messages[shown]}</p>
      {shown >= 2 && <span className="decay-fake-cursor" aria-hidden="true">➤</span>}
      {shown === 4 && <p>USER COUNT: {userCount}</p>}
      <button onClick={() => { setShown(null); onExitWarning(false); }}>Пропустить сбой</button>
    </div>}
  </>;
}
