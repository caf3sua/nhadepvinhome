import type { Metadata } from "next";
import LienHeView from "./LienHeView";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn quỹ căn Ocean Park 2 & 3",
  description:
    "Hotline / Zalo tư vấn thấp tầng & chung cư chuyển nhượng Vinhomes Ocean Park 2, 3: dẫn xem nhà, pháp lý, vay ngân hàng, ký gửi bán căn.",
  alternates: { canonical: "/lien-he" },
};

export default function Page() {
  return <LienHeView />;
}
