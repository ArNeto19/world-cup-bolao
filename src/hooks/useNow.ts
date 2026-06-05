import { useState, useEffect } from 'react';

/**
 * Returns the current Date and re-renders the consumer every `intervalMs`.
 * Default: 15 seconds — fine-grained enough to catch the 5-min edit cutoff
 * and match kick-off without hammering the browser.
 */
export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
