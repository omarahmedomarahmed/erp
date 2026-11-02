"use client";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import type { Persona } from "@/lib/types";

export function HomeShell({ persona, current, children }: { persona: Persona; current?: string; children: ReactNode }) {
  return <Shell persona={persona} current={current}>{children}</Shell>;
}
