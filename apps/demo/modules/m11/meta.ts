import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m11",
  decisionIds: [],
  nameKey: "m11.name",
  taglineKey: "m11.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m11.s1.title", captionKey: "m11.s1.caption" },
    { id: "s2", titleKey: "m11.s2.title", captionKey: "m11.s2.caption" },
    { id: "s3", titleKey: "m11.s3.title", captionKey: "m11.s3.caption" },
    { id: "s4", titleKey: "m11.s4.title", captionKey: "m11.s4.caption" },
  ],
};
