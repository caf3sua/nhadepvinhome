"use client";

import { Unit } from "@/types/property";
import { calcPricePerM2, formatPrice, isUnitHot } from "@/lib/format";
import { LotBlueprint } from "./LotBlueprint";
import { useContact } from "@/components/contact/ContactProvider";

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  const { openUnitDrawer } = useContact();
  const hot = isUnitHot(unit);
  const perM2 = calcPricePerM2(unit.price, unit.landArea);
  const projectLabel =
    unit.project === "ocp2" ? "Ocean Park 2" : "Ocean Park 3";

  return (
    <button
      type="button"
      onClick={() => openUnitDrawer(unit)}
      className="group text-left bg-white rounded-[14px] border border-[#D6E2E5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#0E7686]/50 transition-all flex flex-col w-full cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] bg-[#EBF5F7] overflow-hidden">
        {unit.images.length > 0 ? (
          <img
            src={unit.images[0]}
            alt={unit.code}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <LotBlueprint unit={unit} />
        )}

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {hot && (
            <span className="px-2 py-0.5 rounded-[7px] bg-[#D7263D] text-white text-[11px] font-bold tracking-wide shadow-xs">
              HOT
            </span>
          )}
          {unit.isSold && (
            <span className="px-2 py-0.5 rounded-[7px] bg-[#0D2A33] text-white text-[11px] font-bold">
              ĐÃ BÁN
            </span>
          )}
          {unit.roadLabel && !hot && (
            <span className="px-2 py-0.5 rounded-[7px] bg-[#0D2A33]/80 backdrop-blur-xs text-white text-[11px] font-semibold">
              {unit.roadLabel}
            </span>
          )}
        </div>

        {unit.images.length > 0 && (
          <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-[6px] bg-black/65 text-white text-[11px] font-medium">
            📷 {unit.images.length} ảnh
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <div className="font-display font-extrabold text-[17px] text-[#0D2A33] group-hover:text-[#0E7686] transition-colors">
            {unit.code}
          </div>
          <div className="text-[13px] text-[#557079] mt-0.5">
            {unit.type} · {unit.zoneName} · {projectLabel}
          </div>

          <div className="mt-2 space-y-1 text-[13px] text-[#0D2A33]">
            <div>
              <strong>{unit.landArea} m²</strong> · Sàn{" "}
              {unit.floorArea.toLocaleString("vi-VN")} m² · {unit.floors} tầng
            </div>
            <div className="flex items-center gap-2 text-[#557079]">
              <span>{unit.direction}</span>
              <span>·</span>
              <span
                className={
                  unit.legal === "Có sổ"
                    ? "text-[#0E7686] font-semibold"
                    : ""
                }
              >
                {unit.legal}
              </span>
            </div>
            <div className="text-[12.5px] text-[#557079] line-clamp-2">
              {unit.statusNote || unit.status}
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#E6EEF0] flex items-baseline justify-between gap-2">
          <strong className="font-display text-[19px] font-extrabold text-[#0E7686]">
            {formatPrice(unit.price)}
          </strong>
          <span
            className={`text-[12px] font-semibold ${
              unit.priceType === "Bao phí"
                ? "text-[#FF7A2F]"
                : "text-[#557079]"
            }`}
          >
            {unit.priceType} · {perM2} tr/m²
          </span>
        </div>
      </div>
    </button>
  );
}
