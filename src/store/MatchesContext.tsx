import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeMatches } from "../services/firestoreService";
import { Match } from "../types";
import { PHASE_ORDER } from "../data/matches";
import { useAuth } from "./AuthContext";

interface MatchesContextValue {
  matches: Match[];
  loading: boolean;
  getMatchById: (id: string) => Match | undefined;
  matchesByPhase: Record<string, Match[]>;
}

const MatchesContext = createContext<MatchesContextValue | null>(null);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until auth state is resolved
    if (authLoading) return;

    // Only subscribe when there is an authenticated user
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeMatches((m) => {
      setMatches(m);
      setLoading(false);
    });

    // Tear down the listener on logout or re-auth
    return unsub;
  }, [user, authLoading]);

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
