"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function SupabaseRealtime() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      // Burst of inserts → one refresh, not N
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    const entriesSubscription = supabase
      .channel("realtime-entries")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, scheduleRefresh)
      .subscribe();

    const branchesSubscription = supabase
      .channel("realtime-branches")
      .on("postgres_changes", { event: "*", schema: "public", table: "branches" }, scheduleRefresh)
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(entriesSubscription);
      supabase.removeChannel(branchesSubscription);
    };
  }, [router]);

  return null;
}
