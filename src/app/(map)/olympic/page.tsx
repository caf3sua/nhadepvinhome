import type { Metadata } from "next";
import OlympicView from "./OlympicView";

export const metadata: Metadata = {
  title: "Mặt bằng Khu đô thị thể thao Olympic Hà Nội",
  description:
    "Mặt bằng 4 phân khu Khu đô thị thể thao Olympic (Thanh Trì – Thường Tín) với lớp ranh giới và sử dụng đất.",
  alternates: { canonical: "/olympic" },
};

export default function Page() {
  return <OlympicView />;
}
