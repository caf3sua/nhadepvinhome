"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { UNITS } from "@/data/units";
import { APARTMENTS } from "@/data/apartments";
import { ZONES } from "@/data/zones";
import { ProjectSlug } from "@/types/property";
import { APARTMENT_ANCHORS } from "@/data/plan";
import type { PlanFocus } from "./PlanMapClient";
import { inPriceRange, isUnitHot } from "@/lib/format";
import { SITE_CONFIG } from "@/config/site";

const PlanMapClient = dynamic(
  () => import("./PlanMapClient").then((m) => m.PlanMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[clamp(440px,72vh,760px)] rounded-[16px] bg-[#E5EEF0] border border-[#D6E2E5] flex items-center justify-center text-[#557079] font-semibold">
        Đang tải bản đồ quỹ căn...
      </div>
    ),
  }
);

export function FundMapSection() {
  const [projectFilter, setProjectFilter] = useState<"all" | ProjectSlug>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [focus, setFocus] = useState<PlanFocus | null>(null);

  const filteredUnits = useMemo(() => {
    if (typeFilter === "Chung cư") return [];
    return UNITS.filter((u) => {
      if (projectFilter !== "all" && u.project !== projectFilter) return false;
      if (typeFilter !== "all" && u.type !== typeFilter) return false;
      return inPriceRange(u.price, priceFilter);
    });
  }, [projectFilter, typeFilter, priceFilter]);

  // Chung cư chỉ hiện khi không lọc theo một loại hình thấp tầng cụ thể
  const filteredApartments = useMemo(() => {
    if (typeFilter !== "all" && typeFilter !== "Chung cư") return [];
    return APARTMENTS.filter((a) => {
      const anchor = APARTMENT_ANCHORS[a.projectKey];
      if (projectFilter !== "all" && anchor?.project !== projectFilter) return false;
      return inPriceRange(a.price, priceFilter);
    });
  }, [projectFilter, typeFilter, priceFilter]);

  const visibleZones = ZONES.filter((z) => projectFilter === "all" || z.project === projectFilter);
  const aptChips = Object.entries(APARTMENT_ANCHORS).filter(
    ([key, a]) =>
      (projectFilter === "all" || a.project === projectFilter) &&
      APARTMENTS.some((x) => x.projectKey === key)
  );
  const goTo = (kind: PlanFocus["kind"], id: string) =>
    setFocus((f) => ({ kind, id, nonce: (f?.nonce ?? 0) + 1 }));

  const hotCount = filteredUnits.filter(isUnitHot).length;

  return (
    <section id="ban-do" className="wrap pt-10 space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] uppercase tracking-tight text-gold-lo">
          BẢN ĐỒ QUỸ CĂN OCEAN PARK 2 &amp; 3
        </h2>
        <p className="text-[14.5px] text-[#557079]">
          Phóng to để thấy các căn đang bán trong từng phân khu, nhãn là giá bán. Nhãn{" "}
          <b className="text-[#D7263D]">đỏ</b> là căn HOT, đơn giá dưới {SITE_CONFIG.hotPricePerM2Threshold} triệu/m².
          Bấm vào nhãn để xem chi tiết.
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
            <option value="Chung cư">Chung cư chuyển nhượng</option>
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
          <strong className="text-[#6E45C9]">{filteredApartments.length} chung cư chuyển nhượng</strong> · cập nhật{" "}
          {SITE_CONFIG.updatedDate}
        </div>
      </div>

      {/* Bản đồ trên ảnh tổng mặt bằng */}
      <PlanMapClient
        units={filteredUnits}
        apartments={filteredApartments}
        view={projectFilter}
        focus={focus}
      />

      {/* Zone quick-jump chips (#zchips) */}
      <div id="zchips" className="flex flex-wrap items-center gap-2 py-1">
        <span className="text-[12.5px] font-bold text-[#557079] shrink-0">
          Đi tới phân khu:
        </span>
        {visibleZones.map((zone) => {
          const active = focus?.kind === "zone" && focus.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => goTo("zone", zone.id)}
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
        {aptChips.map(([key, a]) => {
          const active = focus?.kind === "apt" && focus.id === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (typeFilter !== "all" && typeFilter !== "Chung cư") setTypeFilter("all");
                goTo("apt", key);
              }}
              className={`px-3 py-1 rounded-full text-[12.5px] font-semibold shrink-0 border transition-colors cursor-pointer ${
                active
                  ? "bg-[#6E45C9] text-white border-[#6E45C9]"
                  : "bg-white text-[#0D2A33] border-[#D6E2E5] hover:border-[#6E45C9]"
              }`}
            >
              {a.short} (chung cư)
            </button>
          );
        })}
      </div>

      <p className="text-[12.5px] text-[#557079]">
        * Ghim minh hoạ trong đúng phân khu, không phải vị trí lô thật. Liên hệ để nhận mã căn và vị trí chính xác trên mặt bằng phân lô. Ga metro 8B theo quy hoạch, chỉ mang tính tham khảo.
      </p>
    </section>
  );
}
