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
      mode: ["normal", "game", "archive"].includes(value.mode)
        ? value.mode === "archive" && value.unlocked !== true
          ? "game"
          : value.mode
        : "welcome",
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
    localStorage.setItem("duality.v1", JSON.stringify(value));
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
