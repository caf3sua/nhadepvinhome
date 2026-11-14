import type { Metadata } from "next";
import MauThietKeView from "./MauThietKeView";

export const metadata: Metadata = {
  title: "Mẫu thiết kế nội thất nhà liền kề Ocean Park 2, 3",
  description:
    "Mặt bằng bố trí nội thất từng tầng của các mẫu nhà liền kề thực tế tại Vinhomes Ocean Park 2 & 3, kèm mô hình 3D.",
  alternates: { canonical: "/mau-thiet-ke" },
};

export default function Page() {
  return <MauThietKeView />;
}
