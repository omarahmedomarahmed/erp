// Shared contracts for the TakafulTech demo. Every module and page builds on these.

export type Lang = "ar" | "en";
export type FundCode = "PTF" | "PIF" | "SHF";
export type ShariaStatus = "compliant" | "pending_review" | "non_compliant" | "purified";

/** A dictionary entry. Keys look like `m09.board.title` or `common.save`. */
export interface DictEntry {
  ar: string;
  en: string;
  /** label | button | status | menu | message | field | help | term */
  cat?: string;
}
export type Dict = Record<string, DictEntry>;

/** Staff persona a visitor can act as after entering the access code. */
export interface Persona {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Dictionary key of the role name */
  roleKey: string;
  /** Dictionary key of the department name */
  deptKey: string;
  /** Module ids this persona can open. "*" = all (admin). */
  modules: string[] | "*";
  isAdmin?: boolean;
}

/** One of the 4 main screens of a module. */
export interface ScreenDef {
  id: string;
  /** Dictionary key for the tab label */
  titleKey: string;
  /** Dictionary key for the one-line caption shown under the screen and in the deck */
  captionKey: string;
}

/** What we need from the company to build this module correctly (shown on the questions page). */
export interface ModuleNeed {
  ar: string;
  en: string;
}

/** A blocked dangerous action demonstrated on the risks page and inside the module. */
export interface GuardDemo {
  id: string;
  /** Button label, e.g. "Try to mix participants' and shareholders' money" */
  tryKey: string;
  /** What the system answers */
  blockedKey: string;
}

export interface ModuleMeta {
  id: string;            // e.g. "m09"
  /** Decision-data module id(s) whose decisions become this module's settings, e.g. ["M09"] */
  decisionIds: string[];
  nameKey: string;       // e.g. "mod.m09.name"
  taglineKey: string;    // one line: what the module does
  deptKey: string;       // owning department
  icon: string;          // lucide-react icon name, e.g. "ClipboardCheck"
  color: string;         // tile color (hex)
  /** Brief section from the client's proposal, e.g. "3.4"; empty for platform modules */
  briefRef: string;
  sensitive?: { riskKey: string; controlKeys: string[]; guards: GuardDemo[] };
  /** Extra "not allowed" rules for modules that are not flagged sensitive. */
  rules?: GuardDemo[];
  needs: ModuleNeed[];
  screens: [ScreenDef, ScreenDef, ScreenDef, ScreenDef];
}

/** A setting derived from a decision: default = our recommendation (or the company's recorded answer). */
export interface SettingDef {
  id: string;            // decision id, e.g. "M09-04"
  module: string;        // decision module id, e.g. "M09"
  title: string;
  question: string;
  options: { key: string; label: string; consequence?: string }[];
  recommended: string;
  /** Answer the company already gave (overrides recommended as the default) */
  answered?: string;
  priority: string;
}
