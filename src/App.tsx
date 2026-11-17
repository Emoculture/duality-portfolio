import { useCallback, useEffect, useRef, useState } from "react";
import Welcome from "./components/Welcome";
import Portfolio from "./components/Portfolio";
import Game from "./components/Game";
import Archive from "./components/Archive";
import ArchiveConnection from "./components/ArchiveConnection";
import ConnectionBoundary from "./components/ConnectionBoundary";
import { add, avatarStage, loadIncident, saveIncident } from "./incident/state";
import { load, save, type Mode } from "./state";
export default function App() {
  const [state, setState] = useState(load);
  const [transition, setTransition] = useState(false);
  const [connection, setConnection] = useState<{ returning: boolean; stage: number; frame: "empty" | "occupied" | null } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    save(state);
    document.documentElement.dataset.reduced = String(state.reduced);
  }, [state]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!connection) return;
    const fallback = window.setTimeout(() => setConnection(null), 11000);
    return () => window.clearTimeout(fallback);
  }, [connection]);
  const startConnection = useCallback(() => {
    const incident = loadIncident();
    const frame = incident.endings.length ? (incident.memory.events.includes("connection-last-frame") ? "occupied" : "empty") : null;
    if (frame) saveIncident({ ...incident, memory: { ...incident.memory, events: add(incident.memory.events, "connection-last-frame") } });
    setConnection({ returning: incident.memory.visits > 0 || incident.visited.length > 0, stage: avatarStage(), frame });
  }, []);
  const go = useCallback((mode: Mode) => {
    if (mode === "archive" && loadIncident().endings.length) startConnection();
    setState((s) => ({ ...s, mode }));
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>(
        "main h1, main h2, .archive-masthead h1",
      );
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  }, [startConnection]);
  function secret() {
    if (transition) return;
    setTransition(true);
    timer.current = setTimeout(() => {
      if (state.unlocked) startConnection();
      setState((s) => ({
        ...s,
        discovered: true,
        mode: s.unlocked ? "archive" : "game",
      }));
      setTransition(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 650);
  }
  const win = useCallback(() => {
    startConnection();
    setState((s) => ({
      ...s,
      unlocked: true,
      discovered: true,
      mode: "archive",
    }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [startConnection]);
  const reduce = () => setState((s) => ({ ...s, reduced: !s.reduced }));
  return (
    <div className={transition ? "app glitch-entry" : "app"}>
      {state.mode === "welcome" && (
        <Welcome onContinue={() => go("normal")} onSecret={secret} />
      )}{" "}
      {state.mode === "normal" && (
        <Portfolio
          onWelcome={() => go("welcome")}
          discovered={state.discovered}
          onArchive={() => go(state.unlocked ? "archive" : "game")}
          reduced={state.reduced}
          onReduced={reduce}
        />
      )}{" "}
      {state.mode === "game" && (
        <Game onExit={() => go("normal")} onWin={win} />
      )}{" "}
      {state.mode === "archive" && !connection && (
        <Archive
          onExit={() => go("normal")}
          onReplay={() => {
            setState((s) => ({ ...s, mode: "game", unlocked: false }));
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          reduced={state.reduced}
          onReduced={reduce}
          puzzle={state.puzzle}
          onPuzzle={() => setState((s) => ({ ...s, puzzle: true }))}
        />
      )}
      {connection && <ConnectionBoundary onFailure={() => setConnection(null)}><ArchiveConnection returning={connection.returning} stage={connection.stage} frame={connection.frame} reduced={state.reduced} onComplete={() => setConnection(null)} /></ConnectionBoundary>}
    </div>
  );
}
