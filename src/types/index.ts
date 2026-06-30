// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "player" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
}

// ─── Group ───────────────────────────────────────────────────────────────────
export interface BolaoGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  memberCount: number;
  isActive: boolean;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  exactScores: number;
  joinedAt: Date;
}

// ─── Match ───────────────────────────────────────────────────────────────────
export type MatchPhase =
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinals"
  | "semifinals"
  | "third_place"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished" | "cancelled";

export interface Team {
  code: string;
  flagCode: string;
  name: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  phase: MatchPhase;
  matchNumber: number;
  startTime: Date;
  venue: string;
  groupName?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** Set by the admin when finishing a knockout-stage match (not used in group_stage) */
  qualifiedTeam?: "home" | "away";
}

// ─── Prediction ──────────────────────────────────────────────────────────────
export interface Prediction {
  id?: string;
  matchId: string;
  userId: string;
  groupId: string;
  homeScore: number;
  awayScore: number;
  /**
   * Which team the user picked to advance to the next round.
   * Only relevant for knockout-stage matches (phase !== 'group_stage').
   * Auto-derived from the score when it's not a draw; user-selected when it is.
   */
  qualifiedTeam?: "home" | "away";
  points?: number;
  submittedAt: Date;
  updatedAt?: Date;
  username: string;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────
export interface ScoreBreakdown {
  exactScore: boolean;
  goalDiff: boolean;
  winner: boolean;
  draw: boolean;
  /** True when the user's qualifiedTeam pick matches the match's actual qualifiedTeam */
  qualifiedBonus: boolean;
  points: number;
}

// ─── Ranking ─────────────────────────────────────────────────────────────────
export interface RankingEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  exactScores: number;
  correctWinners: number;
}
