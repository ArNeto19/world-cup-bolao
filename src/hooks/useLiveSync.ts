import { useEffect, useRef, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { Match } from "../types";
import { updateMatchScore } from "../services/firestoreService";

// ─── Config ───────────────────────────────────────────────────────────────────
// In development: Vite proxies /api-football → football-data.org (vite.config.ts)
// In production:  VITE_FOOTBALL_DATA_PROXY must point to the Cloudflare Worker URL
//                 e.g. https://football-data-proxy.yourname.workers.dev
const API_BASE = `${import.meta.env.VITE_FOOTBALL_DATA_PROXY ?? ""}/v4`;
const api = axios.create({
  baseURL: API_BASE,
});

const WC_COMPETITION = "WC";
const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
const PRE_MATCH_WINDOW = 30 * 60 * 1000; // start watching 30 min before kick-off

// ─── Status mapping ───────────────────────────────────────────────────────────
function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
  const live = new Set([
    "IN_PLAY",
    "PAUSED",
    "EXTRA_TIME",
    "PENALTY_SHOOTOUT",
    "SUSPENDED",
  ]);
  const finished = new Set(["FINISHED", "AWARDED"]);
  if (live.has(apiStatus)) return "live";
  if (finished.has(apiStatus)) return "finished";
  return "scheduled";
}

function normalise(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { id: number; name: string; shortName: string };
  awayTeam: { id: number; name: string; shortName: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
    extraTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
}

// ─── API fetch ────────────────────────────────────────────────────────────────
// One call fetches ALL WC matches for the date — never more than 1 req per tick.
async function fetchMatchesForDate(date: string): Promise<ApiMatch[]> {
  try {
    const res = await api.get(
      `/competitions/${WC_COMPETITION}/matches?dateFrom=${date}&dateTo=${date}`,
    );
    const { data } = res;
    return (data.matches as ApiMatch[]) ?? [];
  } catch (err) {
    const error = err as AxiosError;
    if (error.status === 429) {
      console.warn("[useLiveSync] Rate limited — will retry next tick");
      return [];
    }
    console.error(`[useLiveSync] API error ${error.status}: ${error.message}`);
    return [];
  }
}

// ─── Match pairing ────────────────────────────────────────────────────────────
function findApiMatch(fsMatch: Match, apiMatches: ApiMatch[]): ApiMatch | null {
  const fsHome = normalise(fsMatch.homeTeam.name);
  const fsAway = normalise(fsMatch.awayTeam.name);

  return (
    // 1. Exact full name match
    apiMatches.find(
      (m) =>
        normalise(m.homeTeam.name) === fsHome &&
        normalise(m.awayTeam.name) === fsAway,
    ) ??
    // 2. Short name
    apiMatches.find(
      (m) =>
        normalise(m.homeTeam.shortName) === fsHome ||
        normalise(m.awayTeam.shortName) === fsAway,
    ) ??
    // 3. One team matches (translated names)
    apiMatches.find(
      (m) =>
        normalise(m.homeTeam.name) === fsHome ||
        normalise(m.awayTeam.name) === fsAway ||
        normalise(m.homeTeam.name) === fsAway ||
        normalise(m.awayTeam.name) === fsHome,
    ) ??
    null
  );
}

// ─── Score extraction ─────────────────────────────────────────────────────────
function extractScore(score: ApiMatch["score"]): {
  home: number;
  away: number;
} {
  if (score.penalties?.home != null) {
    return { home: score.penalties.home, away: score.penalties.away ?? 0 };
  }
  return { home: score.fullTime.home ?? 0, away: score.fullTime.away ?? 0 };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface Options {
  apiKey: string; // kept for interface compatibility — key is stored in the Worker secret
  matches: Match[];
  onUpdate?: (
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: string,
  ) => void;
}

export function useLiveSync({ apiKey, matches, onUpdate }: Options) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchesRef = useRef<Match[]>(matches);

  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  const runSync = useCallback(async () => {
    if (!apiKey) return;

    const watchable = matchesRef.current.filter((m) => {
      if (m.status === "finished") return false;
      if (m.status === "live") return true;
      const msUntil = m.startTime.getTime() - Date.now();
      return msUntil >= 0 && msUntil <= PRE_MATCH_WINDOW;
    });

    if (watchable.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    console.log(
      `[useLiveSync] Fetching WC matches for ${today} (${watchable.length} watchable)`,
    );

    const apiMatches = await fetchMatchesForDate(today);
    if (apiMatches.length === 0) return;

    for (const fsMatch of watchable) {
      const apiMatch = findApiMatch(fsMatch, apiMatches);
      if (!apiMatch) {
        console.warn(
          `[useLiveSync] No API match for: ${fsMatch.homeTeam.name} vs ${fsMatch.awayTeam.name}`,
        );
        continue;
      }

      const newStatus = mapStatus(apiMatch.status);
      const { home, away } = extractScore(apiMatch.score);
      const unchanged =
        fsMatch.status === newStatus &&
        fsMatch.homeScore === home &&
        fsMatch.awayScore === away;

      if (unchanged) continue;

      console.log(
        `[useLiveSync] ${fsMatch.id}: ${fsMatch.homeTeam.name} ${home}–${away} ${fsMatch.awayTeam.name} ` +
          `[${fsMatch.status} → ${newStatus}]`,
      );

      await updateMatchScore(
        fsMatch.id,
        home,
        away,
        newStatus as "live" | "finished",
      );
      onUpdate?.(fsMatch.id, home, away, newStatus);
    }
  }, [apiKey, onUpdate]);

  useEffect(() => {
    if (!apiKey) return;
    runSync();
    intervalRef.current = setInterval(runSync, POLL_INTERVAL);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [apiKey, runSync]);
}
