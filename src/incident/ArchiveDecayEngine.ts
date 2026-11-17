import { loadIncident, type IncidentSave } from "./state";

export type DecayStage = 0 | 1 | 2 | 3 | 4;

/** Derive from existing clues, so v1 saves migrate without rewriting them. */
export function decayStageFor(save: IncidentSave): DecayStage {
  if (save.clues.includes("finalkey") || save.clues.includes("decision") || save.endings.length > 0) return 4;
  if (save.memory.adminUnlocked && save.memory.evidence.includes("contradiction")) return 3;
  if (save.memory.events.includes("null-complete")) return 2;
  if (save.clues.includes("thread") || save.memory.evidence.includes("forum")) return 1;
  return 0;
}
export function currentDecayStage(): DecayStage { return decayStageFor(loadIncident()); }
