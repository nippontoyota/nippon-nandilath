"use client";

import { useEffect, useState, useCallback } from "react";

const POLL_INTERVAL = 30_000;

export function FlagBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/flags/count", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch {
      // Badge stays at 0
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCount]);

  if (count === 0) return null;

  return (
    <span
      className="admin-sale-badge min-w-5 justify-center"
      title={`${count} flagged entries`}
      aria-label={`${count} flagged entries`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
