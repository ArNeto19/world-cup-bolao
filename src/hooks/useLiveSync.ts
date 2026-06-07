import { useEffect, useRef, useCallback } from "react";
import { Match } from "../types";
import { updateMatchScore } from "../services/firestoreService";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = "https://v3.football.api-sports.io";
const WC_LEAGUE = 1;
const WC_SEASON = 2026;
const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
const PRE_MATCH_WINDOW = 30 * 60 * 1000; // start polling 30 min before kick-off

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapStatus(short: string): "scheduled" | "live" | "finished" {
  const live = new Set([
    "1H",
    "HT",
    "2H",
    "ET",
    "BT",
    "P",
    "SUSP",
    "INT",
    "LIVE",
  ]);
  const finished = new Set(["FT", "AET", "PEN"]);
  if (live.has(short)) return "live";
  if (finished.has(short)) return "finished";
  return "scheduled";
}

function normalise(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
}

async function fetchFixtureForMatch(
  apiKey: string,
  match: Match,
): Promise<ApiFixture | null> {
  const date = match.startTime.toISOString().slice(0, 10);

  const res = await fetch(
    `${API_BASE}/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&date=${date}`,
    {
      headers: {
        "x-apisports-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    },
  );

  if (!res.ok) {
    console.warn(`[useLiveSync] API error ${res.status} for match ${match.id}`);
    return null;
  }

  const json = await res.json();
  const fixtures: ApiFixture[] = json.response ?? [];

  const fsHome = normalise(match.homeTeam.name);
  const fsAway = normalise(match.awayTeam.name);

  // Try exact name match first
  let found = fixtures.find(
    (f) =>
      normalise(f.teams.home.name) === fsHome &&
      normalise(f.teams.away.name) === fsAway,
  );

  // Fallback: one team matches (handles translated names)
  if (!found) {
    found = fixtures.find(
      (f) =>
        normalise(f.teams.home.name) === fsHome ||
        normalise(f.teams.away.name) === fsAway,
    );
  }

  return found ?? null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface Options {
  apiKey: string;
  /** Matches to watch — only those within the pre-match window or already live */
  matches: Match[];
  /** Called after Firestore is updated so parent can react if needed */
  onUpdate?: (
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: string,
  ) => void;
}

/**
 * useLiveSync
 *
 * Polls API-Football every 3 minutes for each match that is either:
 *   - live (status === 'live'), or
 *   - scheduled and within 30 min of kick-off.
 *
 * When a match transitions to 'finished', polling stops for that match.
 * The hook is fully self-contained: it starts/stops intervals automatically
 * as the `matches` list changes (e.g. when Firestore delivers new data).
 */
export function useLiveSync({ apiKey, matches, onUpdate }: Options) {
  // Map of matchId → intervalId for active pollers
  const pollers = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  const poll = useCallback(
    async (match: Match) => {
      if (!apiKey) return;

      console.log(
        `[useLiveSync] Polling match ${match.id} (${match.homeTeam.name} vs ${match.awayTeam.name})`,
      );

      const fixture = await fetchFixtureForMatch(apiKey, match);
      if (!fixture) return;

      const newStatus = mapStatus(fixture.fixture.status.short);
      const homeScore = fixture.goals.home ?? 0;
      const awayScore = fixture.goals.away ?? 0;

      const unchanged =
        match.status === newStatus &&
        match.homeScore === homeScore &&
        match.awayScore === awayScore;

      if (!unchanged) {
        console.log(
          `[useLiveSync] Updating ${match.id}: ` +
            `${homeScore}–${awayScore} [${match.status} → ${newStatus}]`,
        );
        await updateMatchScore(
          match.id,
          homeScore,
          awayScore,
          newStatus as "live" | "finished",
        );
        onUpdate?.(match.id, homeScore, awayScore, newStatus);
      }

      // Stop polling once the match is finished
      if (newStatus === "finished") {
        const id = pollers.current.get(match.id);
        if (id !== undefined) {
          clearInterval(id);
          pollers.current.delete(match.id);
          console.log(
            `[useLiveSync] Stopped polling finished match ${match.id}`,
          );
        }
      }
    },
    [apiKey, onUpdate],
  );

  useEffect(() => {
    if (!apiKey) return;

    const now = Date.now();

    for (const match of matches) {
      // Skip already-finished matches and matches already being polled
      if (match.status === "finished") continue;
      if (pollers.current.has(match.id)) continue;

      const msUntilKickoff = match.startTime.getTime() - now;
      const shouldWatch =
        match.status === "live" ||
        (match.status === "scheduled" && msUntilKickoff <= PRE_MATCH_WINDOW);

      if (!shouldWatch) continue;

      console.log(`[useLiveSync] Starting poller for match ${match.id}`);

      // Poll immediately, then on interval
      poll(match);
      const id = setInterval(() => poll(match), POLL_INTERVAL);
      pollers.current.set(match.id, id);
    }

    // Clean up pollers for matches no longer in the list
    // (e.g. finished matches removed by parent, or component unmount)
    return () => {
      // Note: we do NOT clear on every deps change — only on unmount.
      // Pollers are stopped individually when matches finish (see poll()).
    };
  }, [matches, apiKey, poll]);

  // Clear all pollers on unmount
  useEffect(() => {
    return () => {
      pollers.current.forEach((id) => clearInterval(id));
      pollers.current.clear();
    };
  }, []);
}
