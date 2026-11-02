import type { Dict } from "@/lib/types";
import { dict as d_common } from "./common";
import { dict as d_m02 } from "./m02";
import { dict as d_m06 } from "./m06";
import { dict as d_m05 } from "./m05";
import { dict as d_m09 } from "./m09";
import { dict as d_m10 } from "./m10";
import { dict as d_m07 } from "./m07";
import { dict as d_m04 } from "./m04";
import { dict as d_m12 } from "./m12";
import { dict as d_m28 } from "./m28";
import { dict as d_m16 } from "./m16";
import { dict as d_m15 } from "./m15";
import { dict as d_m11 } from "./m11";
import { dict as d_m33 } from "./m33";
import { dict as d_m34 } from "./m34";
import { dict as d_pages } from "./pages";
import { dict as d_deck } from "./deck";

export const BASE_DICT: Dict = {
  ...d_common,
  ...d_m02,
  ...d_m06,
  ...d_m05,
  ...d_m09,
  ...d_m10,
  ...d_m07,
  ...d_m04,
  ...d_m12,
  ...d_m28,
  ...d_m16,
  ...d_m15,
  ...d_m11,
  ...d_m33,
  ...d_m34,
  ...d_pages,
  ...d_deck,
};
