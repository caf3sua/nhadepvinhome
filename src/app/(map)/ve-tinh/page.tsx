import type { Metadata } from "next";
import VeTinhView from "./VeTinhView";

export const metadata: Metadata = {
  title: "Quỹ căn Ocean Park 2 & 3 trên bản đồ vệ tinh",
  description:
    "Xem giá từng căn thấp tầng và chung cư chuyển nhượng Ocean Park 2, 3 ngay trên ảnh vệ tinh, bay tới từng phân khu.",
  alternates: { canonical: "/ve-tinh" },
};

export default function Page() {
  return <VeTinhView />;
}
