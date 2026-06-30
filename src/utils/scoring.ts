import { MatchStatus, ScoreBreakdown } from "../types";

/**
 * Calculates points for a prediction against the actual result.
 * Rules (highest matching condition wins — no stacking):
 *   10pts — exact score
 *    5pts — correct goal difference
 *    4pts — correct draw
 *    2pts (+1 per exact side) — correct winner
 *
 * Knockout-stage bonus (independent of the above, always additive):
 *    +2pts — predicted the correct team to advance ("qualifiedTeam")
 *
 * The qualified-team bonus applies even when the score prediction itself
 * scores 0 points — e.g. predicting a draw but correctly picking who advances
 * on penalties still earns the +2 bonus.
 */
export function calculateScore(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  predQualifiedTeam?: "home" | "away",
  actualQualifiedTeam?: "home" | "away",
): ScoreBreakdown {
  const exactScore = predHome === actualHome && predAway === actualAway;
  const exactHome = predHome === actualHome;
  const exactAway = predAway === actualAway;
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
    points = 2 + (exactHome ? 1 : 0) + (exactAway ? 1 : 0);
  }

  // Knockout-stage qualified-team bonus — independent of score points
  const qualifiedBonus =
    predQualifiedTeam !== undefined &&
    actualQualifiedTeam !== undefined &&
    predQualifiedTeam === actualQualifiedTeam;

  if (qualifiedBonus) points += 2;

  return { exactScore, goalDiff, winner, draw, qualifiedBonus, points };
}

/**
 * Derives the qualified team from a score prediction.
 * Returns undefined for a draw — the user must choose explicitly in that case.
 */
export function deriveQualifiedTeam(
  homeScore: number,
  awayScore: number,
): "home" | "away" | undefined {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return undefined;
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
