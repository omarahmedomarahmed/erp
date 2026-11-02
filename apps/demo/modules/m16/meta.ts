import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m16",
  decisionIds: [],
  nameKey: "m16.name",
  taglineKey: "m16.tagline",
  deptKey: "dept.management",
  icon: "LayoutGrid",
  color: "#0f75db",
  briefRef: "",
  needs: [],
  screens: [
    { id: "s1", titleKey: "m16.s1.title", captionKey: "m16.s1.caption" },
    { id: "s2", titleKey: "m16.s2.title", captionKey: "m16.s2.caption" },
    { id: "s3", titleKey: "m16.s3.title", captionKey: "m16.s3.caption" },
    { id: "s4", titleKey: "m16.s4.title", captionKey: "m16.s4.caption" },
  ],
};
