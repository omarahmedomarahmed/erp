"use client";
// Tiny in-memory store so the October run's progress is shared by all m34 screens in one visit.
import { useSyncExternalStore } from "react";

export const STAGES = ["calc", "review", "maker", "checker", "cfo", "lock"] as const;
export type Stage = (typeof STAGES)[number];

/** Index of the next stage to complete; 1 = calculated, waiting for review; 6 = locked. */
let step = 1;
const subs = new Set<() => void>();
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export function useOctRun() {
  const s = useSyncExternalStore(subscribe, () => step, () => 1);
  return {
    step: s,
    locked: s >= STAGES.length,
    current: STAGES[Math.min(s, STAGES.length - 1)],
    advance: () => { step = Math.min(STAGES.length, step + 1); subs.forEach((f) => f()); },
  };
}
