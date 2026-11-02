import type { ComponentType } from "react";
import type { ModuleMeta } from "@/lib/types";
import { meta as meta_m02 } from "@/modules/m02/meta";
import { meta as meta_m06 } from "@/modules/m06/meta";
import { meta as meta_m05 } from "@/modules/m05/meta";
import { meta as meta_m09 } from "@/modules/m09/meta";
import { meta as meta_m10 } from "@/modules/m10/meta";
import { meta as meta_m07 } from "@/modules/m07/meta";
import { meta as meta_m04 } from "@/modules/m04/meta";
import { meta as meta_m12 } from "@/modules/m12/meta";
import { meta as meta_m28 } from "@/modules/m28/meta";
import { meta as meta_m16 } from "@/modules/m16/meta";
import { meta as meta_m15 } from "@/modules/m15/meta";
import { meta as meta_m11 } from "@/modules/m11/meta";
import { meta as meta_m33 } from "@/modules/m33/meta";
import { meta as meta_m34 } from "@/modules/m34/meta";

// Order follows the client's proposal (sections 3.1-3.12), then HR and payroll.
export const MODULES: ModuleMeta[] = [meta_m02, meta_m06, meta_m05, meta_m09, meta_m10, meta_m07, meta_m04, meta_m12, meta_m28, meta_m16, meta_m15, meta_m11, meta_m33, meta_m34, ];
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
