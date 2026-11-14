import type { Metadata } from "next";
import { ProjectDetailView } from "@/components/project/ProjectDetailView";

export const metadata: Metadata = {
  title: "Vinhomes Ocean Park 3 (The Crown) — Quỹ căn chuyển nhượng",
  alternates: { canonical: "/ocean-park-3" },
  description:
    "Tổng hợp quỹ căn liền kề, shophouse, tứ lập, biệt thự chuyển nhượng tại Vinhomes Ocean Park 3 The Crown.",
};

export default function OceanPark3Page() {
  return <ProjectDetailView slug="ocp3" />;
}
