import { useEffect, useState } from "react";
import { add, loadIncident, saveIncident } from "../incident/state";

export default function ArchiveObserver({ stage }: { stage: number }) {
  const [save, setSave] = useState(loadIncident);
  useEffect(() => {
    const refresh = () => setSave(loadIncident());
    window.addEventListener("duality:incident-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("duality:incident-progress", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  useEffect(() => {
    if (stage < 4) return;
    let current = loadIncident();
    let started = current.memory.events.find((event) => event.startsWith("observer-start:"));
    if (!started) {
      started = `observer-start:${Date.now()}`;
      current = saveIncident({ ...current, memory: { ...current.memory, events: add(current.memory.events, started) } });
      setSave(current);
    }
    if (current.memory.events.includes("observer-observed")) return;
    const elapsed = Date.now() - Number(started.slice("observer-start:".length));
    const timer = window.setTimeout(() => {
      const latest = loadIncident();
      if (latest.memory.events.some((event) => event.startsWith("observer-start:"))) {
        saveIncident({ ...latest, memory: { ...latest.memory, events: add(latest.memory.events, "observer-observed") } });
      }
    }, Math.max(0, 8000 - (Number.isFinite(elapsed) ? elapsed : 0)));
    return () => window.clearTimeout(timer);
  }, [stage]);
  if (stage < 4) return null;
  const events = save.memory.events;
  const observed = events.includes("observer-observed");
  const two = observed && save.memory.evidence.includes("camera000");
  const decision = events.includes("archive-wait") ? "wait" : events.includes("archive-terminate") ? "terminate" : null;
  function choose(choice: "wait" | "terminate") {
    const latest = loadIncident();
    const entry = choice === "wait" ? "ARCHIVE.EXE: ожидание — в копии найден незаконченный ответ." : "ARCHIVE.EXE: записана попытка закрытия окна.";
    saveIncident({ ...latest, memory: { ...latest.memory, events: add(latest.memory.events, `archive-${choice}`), changes: add(latest.memory.changes, entry) } });
  }
  return <div className="archive-observer">
    <p>OBSERVER STATUS: {observed ? "OBSERVED" : "ACTIVE"}</p>
    {two && <p>THERE ARE TWO OF YOU.</p>}
    {!decision && <section className="observer-window" aria-label="Вымышленное окно архива">
      <strong>ARCHIVE.EXE HAS STOPPED RESPONDING</strong>
      <p>Сбой архивной записи. Это часть игры.</p>
      <button onClick={() => choose("wait")}>WAIT</button>{" "}<button onClick={() => choose("terminate")}>TERMINATE</button>
    </section>}
    {decision === "wait" && <p>ARCHIVE.LOG: «Я ждал ответа, но не помню вопроса.»</p>}
    {decision === "terminate" && <p>ARCHIVE.LOG: попытка закрытия записана.</p>}
  </div>;
}
