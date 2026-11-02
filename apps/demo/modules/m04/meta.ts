import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m04",
  decisionIds: [],
  nameKey: "m04.name",
  taglineKey: "m04.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m04.s1.title", captionKey: "m04.s1.caption" },
    { id: "s2", titleKey: "m04.s2.title", captionKey: "m04.s2.caption" },
    { id: "s3", titleKey: "m04.s3.title", captionKey: "m04.s3.caption" },
    { id: "s4", titleKey: "m04.s4.title", captionKey: "m04.s4.caption" },
  ],
};
