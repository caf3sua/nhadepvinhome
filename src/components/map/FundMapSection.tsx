"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { UNITS } from "@/data/units";
import { APARTMENTS } from "@/data/apartments";
import { ZONES } from "@/data/zones";
import { ProjectSlug, Zone } from "@/types/property";
import { inPriceRange, isUnitHot } from "@/lib/format";
import { SITE_CONFIG } from "@/config/site";

const FundMapClient = dynamic(
  () => import("./FundMapClient").then((m) => m.FundMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[540px] rounded-[16px] bg-[#E5EEF0] border border-[#D6E2E5] flex items-center justify-center text-[#557079] font-semibold">
        Đang tải bản đồ quỹ căn...
      </div>
    ),
  }
);

export function FundMapSection() {
  const [projectFilter, setProjectFilter] = useState<"all" | ProjectSlug>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const filteredUnits = useMemo(() => {
    return UNITS.filter((u) => {
      if (projectFilter !== "all" && u.project !== projectFilter) return false;
      if (typeFilter !== "all" && u.type !== typeFilter) return false;
      return inPriceRange(u.price, priceFilter);
    });
  }, [projectFilter, typeFilter, priceFilter]);

  const hotCount = filteredUnits.filter(isUnitHot).length;

  return (
    <section id="ban-do" className="wrap pt-10 space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] uppercase tracking-tight text-gold-lo">
          BẢN ĐỒ QUỸ CĂN OCEAN PARK 2 &amp; 3
        </h2>
        <p className="text-[14.5px] text-[#557079]">
          Bấm trực tiếp vào ghim giá trên bản đồ để xem thông số chi tiết, hướng, pháp lý và giá thu về / bao phí.
        </p>
      </div>

      {/* Filter bar (.mapbar) */}
      <div className="bg-white rounded-[14px] border border-[#D6E2E5] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented control */}
          <div className="inline-flex p-1 rounded-[11px] bg-[#F2F6F7] border border-[#E6EEF0]">
            {[
              { id: "all", label: "Cả hai" },
              { id: "ocp2", label: "Ocean Park 2" },
              { id: "ocp3", label: "Ocean Park 3" },
            ].map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() =>
                  setProjectFilter(seg.id as "all" | ProjectSlug)
                }
                className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer ${
                  projectFilter === seg.id
                    ? "bg-[#0E7686] text-white shadow-xs"
                    : "text-[#557079] hover:text-[#0D2A33]"
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13px] font-semibold text-[#0D2A33]"
          >
            <option value="all">Tất cả loại hình</option>
            <option value="Liền kề">Liền kề</option>
            <option value="Liền kề góc">Liền kề góc</option>
            <option value="Shophouse">Shophouse</option>
            <option value="Song lập">Song lập</option>
            <option value="Tứ lập">Tứ lập</option>
            <option value="Xẻ khe">Xẻ khe</option>
            <option value="Đơn lập">Đơn lập</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13px] font-semibold text-[#0D2A33]"
          >
            <option value="all">Tất cả mức giá</option>
            <option value="under-10">Dưới 10 tỷ</option>
            <option value="10-20">10 – 20 tỷ</option>
            <option value="over-20">Trên 20 tỷ</option>
          </select>
        </div>

        <div className="text-[13px] font-semibold text-[#557079]">
          <strong className="text-[#0D2A33]">{filteredUnits.length}</strong> căn ·{" "}
          <strong className="text-[#D7263D]">{hotCount} HOT</strong> ·{" "}
          <strong className="text-[#0E7686]">{APARTMENTS.length} chung cư</strong> · cập nhật{" "}
          {SITE_CONFIG.updatedDate}
        </div>
      </div>

      {/* Interactive Map */}
      <FundMapClient
        units={filteredUnits}
        apartments={APARTMENTS}
        selectedZone={selectedZone}
      />

      {/* Zone quick-jump chips (#zchips) */}
      <div id="zchips" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[12.5px] font-bold text-[#557079] shrink-0">
          Đi tới phân khu:
        </span>
        {ZONES.map((zone) => {
          const active = selectedZone?.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone({ ...zone })}
              className={`px-3 py-1 rounded-full text-[12.5px] font-semibold shrink-0 border transition-colors cursor-pointer ${
                active
                  ? "bg-[#0E7686] text-white border-[#0E7686]"
                  : "bg-white text-[#0D2A33] border-[#D6E2E5] hover:border-[#0E7686]"
              }`}
            >
              {zone.name}
            </button>
          );
        })}
      </div>

      <p className="text-[12.5px] text-[#557079]">
        * Vị trí ghim mang tính minh họa theo phân khu &amp; dãy nhà để bảo mật thông tin chủ nhà. Liên hệ để nhận vị trí chính xác trên mặt bằng phân lô.
      </p>
    </section>
  );
}
