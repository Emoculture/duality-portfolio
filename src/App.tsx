import { useCallback, useEffect, useRef, useState } from "react";
import Welcome from "./components/Welcome";
import Portfolio from "./components/Portfolio";
import Game from "./components/Game";
import Archive from "./components/Archive";
import { load, save, type Mode } from "./state";
export default function App() {
  const [state, setState] = useState(load);
  const [transition, setTransition] = useState(false);
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
  const go = useCallback((mode: Mode) => {
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
  }, []);
  function secret() {
    if (transition) return;
    setTransition(true);
    timer.current = setTimeout(() => {
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
    setState((s) => ({
      ...s,
      unlocked: true,
      discovered: true,
      mode: "archive",
    }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
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
      {state.mode === "archive" && (
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
    </div>
  );
}
