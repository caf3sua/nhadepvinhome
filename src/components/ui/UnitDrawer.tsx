"use client";

import { useEffect } from "react";
import { X, Phone, MessageCircle, FileText, MapPin } from "lucide-react";
import { useContact } from "@/components/contact/ContactProvider";
import { calcPricePerM2, formatPrice, isUnitHot } from "@/lib/format";
import { LotBlueprint } from "./LotBlueprint";
import { SITE_CONFIG } from "@/config/site";

export function UnitDrawer() {
  const { selectedUnit, closeUnitDrawer, openLeadModal } = useContact();
  const primaryAgent = SITE_CONFIG.agents[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUnitDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeUnitDrawer]);

  if (!selectedUnit) return null;

  const hot = isUnitHot(selectedUnit);
  const perM2 = calcPricePerM2(selectedUnit.price, selectedUnit.landArea);
  const projectLabel =
    selectedUnit.project === "ocp2"
      ? "Vinhomes Ocean Park 2"
      : "Vinhomes Ocean Park 3";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={closeUnitDrawer}
    >
      <aside
        id="can"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] h-full bg-white shadow-2xl flex flex-col overflow-hidden anim-slide-in-right"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D6E2E5] flex items-center justify-between gap-3 bg-[#F7FAFB]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-[20px] text-[#0D2A33]">
                {selectedUnit.code}
              </h3>
              {hot && (
                <span className="px-2 py-0.5 rounded-[7px] bg-[#D7263D] text-white text-[11px] font-bold">
                  HOT
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#557079] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#0E7686]" />
              {selectedUnit.zoneName} · {projectLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={closeUnitDrawer}
            aria-label="Đóng chi tiết căn"
            className="w-9 h-9 rounded-full bg-white border border-[#D6E2E5] flex items-center justify-center text-[#0D2A33] hover:bg-[#EBF5F7] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Media */}
          <div className="w-full aspect-[16/10] rounded-[12px] overflow-hidden border border-[#D6E2E5]">
            {selectedUnit.images.length > 0 ? (
              <img
                src={selectedUnit.images[0]}
                alt={selectedUnit.code}
                className="w-full h-full object-cover"
              />
            ) : (
              <LotBlueprint unit={selectedUnit} />
            )}
          </div>

          {/* Price highlight */}
          <div className="p-4 rounded-[12px] bg-[#F2F6F7] border border-[#D6E2E5] flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-[#557079] uppercase tracking-wider">
                Giá chuyển nhượng
              </div>
              <div className="font-display text-[26px] font-extrabold text-[#0E7686] leading-tight mt-0.5">
                {formatPrice(selectedUnit.price)}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-bold ${
                  selectedUnit.priceType === "Bao phí"
                    ? "bg-[#FFF0E5] text-[#FF7A2F]"
                    : "bg-white text-[#0D2A33] border border-[#D6E2E5]"
                }`}
              >
                {selectedUnit.priceType}
              </span>
              <div className="text-[13px] font-semibold text-[#557079] mt-1">
                ~{perM2} triệu/m² đất
              </div>
            </div>
          </div>

          {/* Specs table */}
          <div>
            <h4 className="font-display font-bold text-[14px] uppercase tracking-wide text-[#0D2A33] mb-2.5">
              Thông số chi tiết
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-[13.5px]">
              <SpecItem label="Loại hình" value={selectedUnit.type} />
              <SpecItem label="Phân khu" value={selectedUnit.zoneName} />
              <SpecItem
                label="Diện tích đất"
                value={`${selectedUnit.landArea} m²`}
              />
              <SpecItem
                label="Diện tích sàn"
                value={`${selectedUnit.floorArea.toLocaleString("vi-VN")} m²`}
              />
              <SpecItem
                label="Kích thước lô"
                value={`${selectedUnit.frontage} m × ${selectedUnit.depth} m`}
              />
              <SpecItem
                label="Số tầng"
                value={`${selectedUnit.floors} tầng`}
              />
              <SpecItem label="Hướng" value={selectedUnit.direction} />
              <SpecItem label="Pháp lý" value={selectedUnit.legal} />
              <SpecItem label="Hiện trạng" value={selectedUnit.status} />
              <SpecItem label="Cập nhật" value={selectedUnit.updatedAt} />
            </div>
            {selectedUnit.statusNote && (
              <div className="mt-3 p-3 rounded-[10px] bg-[#FFF8F3] border border-[#FFDCC6] text-[13px] text-[#0D2A33]">
                <strong>Ghi chú:</strong> {selectedUnit.statusNote}
              </div>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="p-4 border-t border-[#D6E2E5] bg-white space-y-2.5">
          <button
            type="button"
            onClick={() => {
              const code = selectedUnit.code;
              closeUnitDrawer();
              openLeadModal(
                `Quan tâm căn ${code} (${selectedUnit.zoneName}, ${formatPrice(selectedUnit.price)})`
              );
            }}
            className="w-full py-3 rounded-[12px] btn-gold flex items-center justify-center gap-2 text-[15px] cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Nhận mã căn đầy đủ & đặt lịch xem
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${primaryAgent.phone}`}
              className="py-2.5 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              Gọi {primaryAgent.phoneDisplay}
            </a>
            <a
              href={primaryAgent.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              Nhắn Zalo
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-[10px] bg-[#F7FAFB] border border-[#E6EEF0]">
      <div className="text-[11.5px] text-[#557079]">{label}</div>
      <div className="font-semibold text-[#0D2A33] mt-0.5">{value}</div>
    </div>
  );
}
