import { MatchStatus, ScoreBreakdown } from "../types";

/**
 * Calculates points for a prediction against the actual result.
 * Rules (highest matching condition wins — no stacking):
 *   10pts — exact score
 *    5pts — correct goal difference
 *    2pts — correct winner
 *    2pts — correct draw
 */
export function calculateScore(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): ScoreBreakdown {
  const exactScore = predHome === actualHome && predAway === actualAway;
  const predDiff = predHome - predAway;
  const actualDiff = actualHome - actualAway;
  const goalDiff = !exactScore && predDiff === actualDiff;
  const actualDraw = actualHome === actualAway;
  const predDraw = predHome === predAway;
  const draw = !exactScore && actualDraw && predDraw;
  const winner =
    !exactScore &&
    !goalDiff &&
    !draw &&
    !actualDraw &&
    ((predHome > predAway && actualHome > actualAway) ||
      (predAway > predHome && actualAway > actualHome));

  let points = 0;

  if (exactScore) {
    points = 10;
  } else if (goalDiff && !draw) {
    points = 5;
  } else if (draw) {
    points = 4;
  } else if (winner) {
    points = 2;
  }

  return { exactScore, goalDiff, winner, draw, points };
}

/**
 * Returns whether predictions can still be edited.
 * Cutoff: 5 minutes before kick-off.
 * Pass `now` explicitly so callers driven by useNow() stay reactive.
 */
export function canEditPrediction(
  matchStartTime: Date,
  status: MatchStatus,
  now: Date = new Date(),
): boolean {
  const cutoff = new Date(matchStartTime.getTime() - 5 * 60 * 1000);
  return now <= cutoff && status === "scheduled";
}

/**
 * Returns whether other users' predictions can be seen (match has started).
 * Pass `now` explicitly so callers driven by useNow() stay reactive.
 */
export function canSeePredictions(
  matchStartTime: Date,
  now: Date = new Date(),
): boolean {
  return now >= matchStartTime;
}
