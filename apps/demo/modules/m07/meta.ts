import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m07",
  decisionIds: [],
  nameKey: "m07.name",
  taglineKey: "m07.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m07.s1.title", captionKey: "m07.s1.caption" },
    { id: "s2", titleKey: "m07.s2.title", captionKey: "m07.s2.caption" },
    { id: "s3", titleKey: "m07.s3.title", captionKey: "m07.s3.caption" },
    { id: "s4", titleKey: "m07.s4.title", captionKey: "m07.s4.caption" },
  ],
};
