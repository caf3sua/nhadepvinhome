"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import type { OlympicZone } from "@/components/map/OlympicMapClient";
import { SITE_CONFIG } from "@/config/site";

const OlympicMapClient = dynamic(
  () =>
    import("@/components/map/OlympicMapClient").then((m) => m.OlympicMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#EEEBE5] flex items-center justify-center font-semibold text-[#6F6A62]">
        Đang tải bản đồ quy hoạch Olympic...
      </div>
    ),
  }
);

const OLYMPIC_ZONES: OlympicZone[] = [
  {
    id: "A",
    name: "Phân khu A",
    areaText: "≈ 1.885 ha",
    center: [20.922, 105.845],
    color: "#60A5FA",
    polygon: [
      [20.935, 105.828],
      [20.934, 105.862],
      [20.91, 105.865],
      [20.908, 105.825],
    ],
  },
  {
    id: "B",
    name: "Phân khu B",
    areaText: "≈ 4.182 ha",
    center: [20.888, 105.855],
    color: "#34D399",
    polygon: [
      [20.906, 105.832],
      [20.905, 105.882],
      [20.868, 105.88],
      [20.87, 105.83],
    ],
  },
  {
    id: "C",
    name: "Phân khu C",
    areaText: "≈ 1.813 ha",
    center: [20.892, 105.902],
    color: "#FBBF24",
    polygon: [
      [20.908, 105.886],
      [20.906, 105.92],
      [20.878, 105.918],
      [20.88, 105.886],
    ],
  },
  {
    id: "D",
    name: "Phân khu D",
    areaText: "≈ 2.466 ha",
    center: [20.875, 105.805],
    color: "#A78BFA",
    polygon: [
      [20.896, 105.786],
      [20.895, 105.824],
      [20.855, 105.822],
      [20.858, 105.785],
    ],
  },
];

const LAND_USES = [
  { label: "Nhà ở liền kề", color: "#E5A869" },
  { label: "Nhà ở biệt thự", color: "#B8B568" },
  { label: "Cây xanh", color: "#8BE068" },
  { label: "Mặt nước", color: "#689FE0" },
  { label: "Giáo dục", color: "#E06868" },
  { label: "Thương mại DV", color: "#E07B52" },
  { label: "Nhà ở chung cư", color: "#F2D15B" },
  { label: "Y tế", color: "#E868C8" },
];

export default function OlympicView() {
  const [collapsed, setCollapsed] = useState(false);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const primary = SITE_CONFIG.agents[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#EEEBE5] text-[#1F1D1A]">
      <OlympicMapClient
        zones={OLYMPIC_ZONES}
        focusedZoneId={focusedZoneId}
        showSatellite={showSatellite}
        showBoundaries={showBoundaries}
        onSelectZone={(id) =>
          setFocusedZoneId((prev) => (prev === id ? null : id))
        }
      />

      {/* Left floating panel */}
      <aside className="absolute top-3 left-3 z-[400] w-[320px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-24px)] overflow-y-auto bg-white/95 backdrop-blur-md border border-[#E3DED5] rounded-[16px] p-4 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-display font-extrabold text-[17px] text-[#1F1D1A]">
              Khu đô thị thể thao Olympic
            </h1>
            <p className="text-[12px] text-[#6F6A62] mt-0.5">
              4 phân khu · <strong className="text-[#FF5500]">10.418 ha</strong> · Thanh Trì, Thường Tín, Thanh Oai
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Thu gọn bảng điều khiển"
            className="p-1.5 rounded-[8px] bg-[#F6F3EE] text-[#1F1D1A] cursor-pointer"
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Zones */}
            <div className="space-y-2">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6F6A62]">
                Phân khu · bấm để tập trung
              </div>
              <div className="grid grid-cols-2 gap-2">
                {OLYMPIC_ZONES.map((z) => {
                  const active = focusedZoneId === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() =>
                        setFocusedZoneId((prev) => (prev === z.id ? null : z.id))
                      }
                      className={`text-left p-2.5 rounded-[10px] border transition-colors cursor-pointer ${
                        active
                          ? "bg-[#FFF3EC] border-[#FF5500] text-[#FF5500]"
                          : "bg-[#F6F3EE] border-[#E3DED5] hover:border-[#FF5500]"
                      }`}
                    >
                      <div className="font-bold text-[13px]">{z.name}</div>
                      <div className="text-[11px] text-[#6F6A62]">
                        {z.areaText}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layers */}
            <div className="space-y-2 pt-2 border-t border-[#E3DED5]">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6F6A62]">
                Lớp bản đồ
              </div>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundaries}
                  onChange={(e) => setShowBoundaries(e.target.checked)}
                  className="accent-[#FF5500]"
                />
                <span>Ranh phân khu quy hoạch</span>
              </label>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSatellite}
                  onChange={(e) => setShowSatellite(e.target.checked)}
                  className="accent-[#FF5500]"
                />
                <span>Ảnh vệ tinh</span>
              </label>
            </div>

            {/* Land use legend */}
            <div className="space-y-2 pt-2 border-t border-[#E3DED5]">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#6F6A62]">
                Sử dụng đất chính
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[12px]">
                {LAND_USES.map((lu) => (
                  <div key={lu.label} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-[3px] shrink-0"
                      style={{ backgroundColor: lu.color }}
                    />
                    <span className="truncate">{lu.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#E3DED5] flex items-center justify-between text-[12px]">
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-bold text-[#0E7686] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {SITE_CONFIG.domain}
              </Link>
              <a
                href={`tel:${primary.phone}`}
                className="font-bold text-[#1F1D1A]"
              >
                {primary.phoneDisplay}
              </a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
