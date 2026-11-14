import type { Metadata } from "next";
import AmThucView from "./AmThucView";

export const metadata: Metadata = {
  title: "Bản đồ ẩm thực & tiện ích quanh Ocean Park",
  description:
    "Quán ăn sáng, cà phê, nhà hàng và dịch vụ ban quản lý quanh Vinhomes Ocean Park 2 & 3 trên bản đồ vệ tinh.",
  alternates: { canonical: "/am-thuc" },
};

export default function Page() {
  return <AmThucView />;
}
