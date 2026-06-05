import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeMatches } from "../services/firestoreService";
import { Match } from "../types";
import { PHASE_ORDER } from "../data/matches";

interface MatchesContextValue {
  matches: Match[];
  loading: boolean;
  getMatchById: (id: string) => Match | undefined;
  matchesByPhase: Record<string, Match[]>;
}

const MatchesContext = createContext<MatchesContextValue | null>(null);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMatches((m) => {
      setMatches(m);
      setLoading(false);
    });
    return unsub;
  }, []);

  const getMatchById = (id: string) => matches.find((m) => m.id === id);

  const matchesByPhase = PHASE_ORDER.reduce(
    (acc, phase) => {
      acc[phase] = matches.filter((m) => m.phase === phase);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  return (
    <MatchesContext.Provider
      value={{ matches, loading, getMatchById, matchesByPhase }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  const ctx = useContext(MatchesContext);
  if (!ctx) throw new Error("useMatches must be used within MatchesProvider");
  return ctx;
}
