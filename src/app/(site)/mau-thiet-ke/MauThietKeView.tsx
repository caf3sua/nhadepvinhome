"use client";

import Link from "next/link";
import { DESIGN_TEMPLATES } from "@/data/projects";
import { useContact } from "@/components/contact/ContactProvider";
import { FloorPlanPreview } from "@/components/design/FloorPlanPreview";

export default function MauThietKeView() {
  const { openContactSheet } = useContact();

  return (
    <div className="wrap py-8 space-y-8">
      <div className="text-[13px] text-[#557079]">
        <Link href="/" className="text-[#0E7686] hover:underline font-medium">
          Trang chủ
        </Link>{" "}
        / <span>Mẫu thiết kế</span>
      </div>

      <div className="space-y-2 max-w-[780px]">
        <h1 className="font-display font-extrabold text-[28px] sm:text-[38px] uppercase text-gold-lo">
          MẪU THIẾT KẾ NỘI THẤT NHÀ LIỀN KỀ
        </h1>
        <p className="text-[15px] text-[#557079]">
          Mặt bằng bố trí nội thất từng tầng của các căn liền kề phổ biến tại Ocean Park 2 &amp; 3 — tham khảo để hình dung công năng khi mua nhà thô hoặc lên kế hoạch cải tạo.
        </p>
      </div>

      {/* 3-column grid matching ocean23.vn/#mau-thiet-ke */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DESIGN_TEMPLATES.map((tpl) => (
          <article
            key={tpl.slug}
            className="bg-white rounded-[16px] border border-[#D6E2E5] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <FloorPlanPreview
                dimensions={tpl.dimensions}
                landArea={tpl.landArea}
                zone={tpl.zone}
              />

              <div className="p-5 space-y-2">
                <h2 className="font-display font-extrabold text-[18px] text-[#0D2A33]">
                  {tpl.title}
                </h2>
                <div className="text-[13px] font-medium text-[#557079]">
                  {tpl.project.replace("Vinhomes ", "")} · {tpl.landArea} m² đất ·{" "}
                  {tpl.floors} tầng · sàn{" "}
                  {tpl.floorArea.toLocaleString("vi-VN")} m²
                </div>
                <p className="text-[13.5px] text-[#0D2A33]/85 leading-relaxed pt-1">
                  {tpl.summary}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <Link
                href={`/3d#${tpl.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#E8F3F5] hover:bg-[#D5EAEE] text-[#0E7686] font-bold text-[13.5px] transition-colors"
              >
                <span>🧊</span>
                <span>Xem mô hình 3D</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* CTA box */}
      <div className="bg-white rounded-[16px] border border-[#D6E2E5] p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="font-display font-extrabold text-[20px] text-[#0D2A33]">
            Cần tư vấn căn có mặt bằng tương tự?
          </h3>
          <p className="text-[14px] text-[#557079]">
            Chúng tôi sẽ lọc đúng các căn đang chào bán theo kích thước lô và ngân sách của bạn.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openContactSheet}
            className="px-5 py-2.5 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[14px] cursor-pointer"
          >
            Liên hệ chuyên viên
          </button>
          <Link
            href="/quy-can"
            className="px-5 py-2.5 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-bold text-[14px]"
          >
            Xem quỹ căn →
          </Link>
        </div>
      </div>
    </div>
  );
}
