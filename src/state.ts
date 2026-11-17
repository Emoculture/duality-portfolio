export type Mode = "welcome" | "normal" | "game" | "archive";
export interface Progress {
  mode: Mode;
  unlocked: boolean;
  reduced: boolean;
  discovered: boolean;
  puzzle: boolean;
}
export const initial: Progress = {
  mode: "welcome",
  unlocked: false,
  reduced: false,
  discovered: false,
  puzzle: false,
};
export function load(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem("duality.v1") || "{}");
    return {
      // Navigation is session-only: every new document starts at WELCOME.
      mode: "welcome",
      unlocked: value.unlocked === true,
      reduced: value.reduced === true,
      discovered: value.discovered === true,
      puzzle: value.puzzle === true,
    };
  } catch {
    return initial;
  }
}
export function save(value: Progress) {
  try {
    let previous: unknown = {};
    try { previous = JSON.parse(localStorage.getItem("duality.v1") || "{}"); } catch { /* damaged legacy value */ }
    const retained = previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};
    localStorage.setItem("duality.v1", JSON.stringify({ ...retained, ...value }));
  } catch {
    /* Private browsing may deny persistence; the session still works. */
  }
}
export function validPassword(value: string) {
  return value.trim().toUpperCase() === "ECHO-04-17";
}
export function validEcho(value: string) {
  return value.trim().toLowerCase() === "stay";
}
