"use client";
import type { ComponentType } from "react";
import { screens as s_m02 } from "@/modules/m02/screens";
import { screens as s_m06 } from "@/modules/m06/screens";
import { screens as s_m05 } from "@/modules/m05/screens";
import { screens as s_m09 } from "@/modules/m09/screens";
import { screens as s_m10 } from "@/modules/m10/screens";
import { screens as s_m07 } from "@/modules/m07/screens";
import { screens as s_m04 } from "@/modules/m04/screens";
import { screens as s_m12 } from "@/modules/m12/screens";
import { screens as s_m28 } from "@/modules/m28/screens";
import { screens as s_m16 } from "@/modules/m16/screens";
import { screens as s_m15 } from "@/modules/m15/screens";
import { screens as s_m11 } from "@/modules/m11/screens";
import { screens as s_m33 } from "@/modules/m33/screens";
import { screens as s_m34 } from "@/modules/m34/screens";

export const SCREENS: Record<string, Record<string, ComponentType>> = {
  m02: s_m02,
  m06: s_m06,
  m05: s_m05,
  m09: s_m09,
  m10: s_m10,
  m07: s_m07,
  m04: s_m04,
  m12: s_m12,
  m28: s_m28,
  m16: s_m16,
  m15: s_m15,
  m11: s_m11,
  m33: s_m33,
  m34: s_m34,
};
