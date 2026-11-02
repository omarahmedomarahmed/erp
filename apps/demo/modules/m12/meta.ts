import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m12",
  decisionIds: [],
  nameKey: "m12.name",
  taglineKey: "m12.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m12.s1.title", captionKey: "m12.s1.caption" },
    { id: "s2", titleKey: "m12.s2.title", captionKey: "m12.s2.caption" },
    { id: "s3", titleKey: "m12.s3.title", captionKey: "m12.s3.caption" },
    { id: "s4", titleKey: "m12.s4.title", captionKey: "m12.s4.caption" },
  ],
};
