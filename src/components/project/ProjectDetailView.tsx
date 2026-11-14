"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProjectSlug } from "@/types/property";
import { PROJECT_DETAILS } from "@/data/projects";
import { ZONES } from "@/data/zones";
import { UNITS } from "@/data/units";
import { UnitCard } from "@/components/ui/UnitCard";

export function ProjectDetailView({ slug }: { slug: ProjectSlug }) {
  const detail = PROJECT_DETAILS[slug];
  const zones = ZONES.filter((z) => z.project === slug);
  const projectUnits = UNITS.filter((u) => u.project === slug);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");

  const visibleUnits = useMemo(() => {
    if (selectedZoneId === "all") return projectUnits;
    return projectUnits.filter((u) => u.zoneId === selectedZoneId);
  }, [projectUnits, selectedZoneId]);

  return (
    <div className="wrap py-8 space-y-10">
      <div className="text-[13px] text-[#557079]">
        <Link href="/" className="text-[#0E7686] hover:underline font-medium">
          Trang chủ
        </Link>{" "}
        / <span>{detail.title}</span>
      </div>

      {/* Project hero info */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display font-extrabold text-[28px] sm:text-[40px] uppercase text-gold-lo leading-tight">
            {detail.title}
          </h1>
          <span className="font-display font-extrabold text-[15px] text-[#8E6A28] uppercase tracking-wider">
            {detail.subtitle}
          </span>
        </div>
        <p className="text-[15px] text-[#557079] max-w-[760px]">
          {detail.description}
        </p>

        {/* 4 facts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: "VỊ TRÍ", value: detail.location },
            { label: "QUY MÔ", value: detail.scale },
            { label: "KHỞI CÔNG", value: detail.launchDate },
            { label: "LOẠI HÌNH", value: detail.productTypes },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white rounded-[14px] border border-[#D6E2E5] p-4 shadow-xs"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#557079]">
                {f.label}
              </div>
              <div className="font-display font-extrabold text-[16px] text-[#0D2A33] mt-1">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Zones list */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] uppercase text-gold-lo">
          PHÂN KHU
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setSelectedZoneId("all")}
            className={`text-left p-3.5 rounded-[14px] border transition-all cursor-pointer ${
              selectedZoneId === "all"
                ? "bg-[#0E7686] text-white border-[#0E7686] shadow-sm"
                : "bg-white text-[#0D2A33] border-[#D6E2E5] hover:border-[#0E7686]"
            }`}
          >
            <div className="font-display font-bold text-[15px]">Tất cả phân khu</div>
            <div
              className={`text-[12px] mt-0.5 ${
                selectedZoneId === "all" ? "text-white/85" : "text-[#557079]"
              }`}
            >
              {projectUnits.length} căn đang bán
            </div>
          </button>

          {zones.map((z) => {
            const count = projectUnits.filter((u) => u.zoneId === z.id).length;
            const active = selectedZoneId === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneId(z.id)}
                className={`text-left p-3.5 rounded-[14px] border transition-all cursor-pointer ${
                  active
                    ? "bg-[#0E7686] text-white border-[#0E7686] shadow-sm"
                    : "bg-white text-[#0D2A33] border-[#D6E2E5] hover:border-[#0E7686]"
                }`}
              >
                <div className="font-display font-bold text-[15px]">{z.name}</div>
                <div
                  className={`text-[12px] mt-0.5 ${
                    active ? "text-white/85" : "text-[#557079]"
                  }`}
                >
                  Ký hiệu {z.code} · {count} căn đang bán
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Units grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] uppercase text-gold-lo">
            CĂN ĐANG BÁN TẠI {slug === "ocp2" ? "OCEAN PARK 2" : "OCEAN PARK 3"}
          </h2>
          <Link
            href={`/quy-can?du-an=${slug}`}
            className="text-[14px] font-bold text-[#0E7686] hover:underline"
          >
            Lọc chi tiết →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </section>
    </div>
  );
}
