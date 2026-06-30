import { Match } from "../types";

export const normaliseString = (string: string) => {
  return string
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

/**
 * Determines which phase tab should be selected by default.
 *
 * Walks `phaseOrder` (already filtered to phases that have matches) and
 * returns the first phase that is NOT fully finished. If every phase is
 * finished (tournament over), falls back to the last phase so the user
 * lands on the final instead of an empty/irrelevant tab.
 */
export function getInitialPhase(
  phaseOrder: string[],
  matchesByPhase: Record<string, Match[]>,
): string {
  for (const phase of phaseOrder) {
    const matches = matchesByPhase[phase] ?? [];
    const allFinished =
      matches.length > 0 && matches.every((m) => m.status === "finished");
    if (!allFinished) return phase;
  }
  // Every phase is finished — default to the last one
  return phaseOrder[phaseOrder.length - 1] ?? "group_stage";
}
