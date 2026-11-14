import type { Metadata } from "next";
import { ProjectDetailView } from "@/components/project/ProjectDetailView";

export const metadata: Metadata = {
  title: "Vinhomes Ocean Park 2 (The Empire) — Quỹ căn chuyển nhượng",
  alternates: { canonical: "/ocean-park-2" },
  description:
    "Tổng hợp quỹ căn liền kề, shophouse, song lập, đơn lập chuyển nhượng tại Vinhomes Ocean Park 2 The Empire.",
};

export default function OceanPark2Page() {
  return <ProjectDetailView slug="ocp2" />;
}
