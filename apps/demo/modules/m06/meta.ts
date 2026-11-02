import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m06",
  decisionIds: [],
  nameKey: "m06.name",
  taglineKey: "m06.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m06.s1.title", captionKey: "m06.s1.caption" },
    { id: "s2", titleKey: "m06.s2.title", captionKey: "m06.s2.caption" },
    { id: "s3", titleKey: "m06.s3.title", captionKey: "m06.s3.caption" },
    { id: "s4", titleKey: "m06.s4.title", captionKey: "m06.s4.caption" },
  ],
};
