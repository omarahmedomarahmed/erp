"use client";
import type { ComponentType } from "react";
import { Placeholder } from "@/components/ui/Placeholder";

// Screens for m34, keyed by ScreenDef.id in meta.ts.
export const screens: Record<string, ComponentType> = {
  s1: () => <Placeholder />,
  s2: () => <Placeholder />,
  s3: () => <Placeholder />,
  s4: () => <Placeholder />,
};
