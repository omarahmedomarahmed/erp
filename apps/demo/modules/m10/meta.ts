import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m10",
  decisionIds: [],
  nameKey: "m10.name",
  taglineKey: "m10.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m10.s1.title", captionKey: "m10.s1.caption" },
    { id: "s2", titleKey: "m10.s2.title", captionKey: "m10.s2.caption" },
    { id: "s3", titleKey: "m10.s3.title", captionKey: "m10.s3.caption" },
    { id: "s4", titleKey: "m10.s4.title", captionKey: "m10.s4.caption" },
  ],
};
