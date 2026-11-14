import type { Metadata } from "next";
import ThreeDView from "./ThreeDView";

export const metadata: Metadata = {
  title: "Nhà phố Ocean Park 3D — Xem từng tầng, từng phòng",
  description:
    "Mô hình 3D các mẫu nhà liền kề Ocean Park 2 & 3 dựng theo bản vẽ mặt bằng: cắt từng tầng, bóc mái, diện tích từng phòng.",
  alternates: { canonical: "/3d" },
};

export default function Page() {
  return <ThreeDView />;
}
