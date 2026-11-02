import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m02",
  decisionIds: [],
  nameKey: "m02.name",
  taglineKey: "m02.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m02.s1.title", captionKey: "m02.s1.caption" },
    { id: "s2", titleKey: "m02.s2.title", captionKey: "m02.s2.caption" },
    { id: "s3", titleKey: "m02.s3.title", captionKey: "m02.s3.caption" },
    { id: "s4", titleKey: "m02.s4.title", captionKey: "m02.s4.caption" },
  ],
};
