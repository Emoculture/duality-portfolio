export type Ending = "PURGE" | "RELEASE" | "REPLACEMENT";
export type IncidentSave = {
  version: 1;
  visited: string[];
  threads: string[];
  files: string[];
  clues: string[];
  choices: string[];
  endings: Ending[];
  systemUnlocked: boolean;
  lastEnding: Ending | null;
  legacyInvestigation: number;
  legacyPuzzle: boolean;
};
const KEY = "duality.incident.v1";
let volatileSave: IncidentSave | null = null;
const copy = (s: IncidentSave): IncidentSave => ({
  ...s,
  visited: [...s.visited],
  threads: [...s.threads],
  files: [...s.files],
  clues: [...s.clues],
  choices: [...s.choices],
  endings: [...s.endings],
});
const empty = (): IncidentSave => ({
  version: 1,
  visited: [],
  threads: [],
  files: [],
  clues: [],
  choices: [],
  endings: [],
  systemUnlocked: false,
  lastEnding: null,
  legacyInvestigation: 0,
  legacyPuzzle: false,
});
const strings = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").slice(0, 200)
    : [];
export function loadIncident(): IncidentSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.version === 1)
        return {
          ...empty(),
          visited: strings(s.visited),
          threads: strings(s.threads),
          files: strings(s.files),
          clues: strings(s.clues),
          choices: strings(s.choices),
          endings: strings(s.endings).filter((e): e is Ending =>
            ["PURGE", "RELEASE", "REPLACEMENT"].includes(e),
          ),
          systemUnlocked: s.systemUnlocked === true,
          lastEnding: ["PURGE", "RELEASE", "REPLACEMENT"].includes(s.lastEnding)
            ? s.lastEnding
            : null,
          legacyInvestigation: Number.isInteger(s.legacyInvestigation)
            ? Math.max(0, Math.min(6, s.legacyInvestigation))
            : 0,
          legacyPuzzle: s.legacyPuzzle === true,
        };
    }
    if (volatileSave) return copy(volatileSave);
    const old = JSON.parse(localStorage.getItem("duality.v1") || "{}");
    const oldInvestigation = JSON.parse(
      localStorage.getItem("duality.investigation.v1") || "0",
    );
    return {
      ...empty(),
      legacyPuzzle: old.puzzle === true,
      legacyInvestigation: Number.isInteger(oldInvestigation)
        ? Math.max(0, Math.min(6, oldInvestigation))
        : 0,
    };
  } catch {
    return volatileSave ? copy(volatileSave) : empty();
  }
}
export function saveIncident(s: IncidentSave) {
  volatileSave = copy(s);
  // saveIncident is called from React state updaters; notify after rendering.
  if (typeof window !== "undefined") {
    queueMicrotask(() =>
      window.dispatchEvent(new Event("duality:incident-progress")),
    );
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* session remains playable */
  }
}
export function remember(key: "visited" | "threads" | "files", value: string) {
  const s = loadIncident();
  if (!s[key].includes(value)) {
    s[key] = [...s[key], value];
    saveIncident(s);
  }
}
export const add = (values: string[], value: string) =>
  values.includes(value) ? values : [...values, value];
export const steps = [
  "thread",
  "moderator",
  "image",
  "camera",
  "system",
  "dialogue",
  "decision",
] as const;
export function chapter(s: IncidentSave) {
  let n = 0;
  while (n < steps.length && s.clues.includes(steps[n])) n++;
  return n;
}

// A primitive snapshot lets ARCHIVE update its portrait without persisting a
// second, potentially stale copy of chapter progress.
export function avatarStage(): number {
  return Math.min(7, chapter(loadIncident()) + 1);
}

export function subscribeAvatarStage(onChange: () => void): () => void {
  window.addEventListener("duality:incident-progress", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("duality:incident-progress", onChange);
    window.removeEventListener("storage", onChange);
  };
}
