import type { Metadata } from "next";
import QuyCanView from "./QuyCanView";

export const metadata: Metadata = {
  title: "Quỹ căn Ocean Park 2 · 3 — Lọc liền kề, song lập, shophouse",
  description:
    "Lọc toàn bộ quỹ căn thấp tầng chuyển nhượng Vinhomes Ocean Park 2 & 3 theo mã căn, phân khu, loại hình, hướng, giá và diện tích.",
  alternates: { canonical: "/quy-can" },
};

export default function Page() {
  return <QuyCanView />;
}
