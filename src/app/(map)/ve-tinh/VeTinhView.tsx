"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UNITS } from "@/data/units";
import { APARTMENTS } from "@/data/apartments";
import { ZONES } from "@/data/zones";
import { ProjectSlug, Zone } from "@/types/property";

const FundMapClient = dynamic(
  () =>
    import("@/components/map/FundMapClient").then((m) => m.FundMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0D2A33] text-white flex items-center justify-center font-semibold">
        Đang tải bản đồ vệ tinh...
      </div>
    ),
  }
);

export default function VeTinhView() {
  const [project, setProject] = useState<"all" | ProjectSlug>("all");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const filteredUnits = useMemo(() => {
    if (project === "all") return UNITS;
    return UNITS.filter((u) => u.project === project);
  }, [project]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <FundMapClient
        units={filteredUnits}
        apartments={APARTMENTS}
        selectedZone={selectedZone}
        heightClass="h-screen w-screen rounded-none border-none"
      />

      {/* Left floating glass panel */}
      <aside className="absolute top-3 left-3 z-[400] w-[300px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-24px)] overflow-y-auto bg-white/95 backdrop-blur-md border border-[#D6E2E5] rounded-[16px] p-4 shadow-xl space-y-3.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0E7686] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang chủ nhadepvinhome
        </Link>

        <div>
          <h1 className="font-display font-extrabold text-[18px] text-[#0D2A33]">
            🛰️ Quỹ căn trên vệ tinh
          </h1>
          <p className="text-[12.5px] text-[#557079] mt-0.5">
            Hiển thị <strong>{filteredUnits.length}</strong> căn thấp tầng &amp;{" "}
            <strong>{APARTMENTS.length}</strong> chung cư
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-[#F2F6F7]">
          {[
            { id: "all", label: "Tất cả" },
            { id: "ocp2", label: "OCP2" },
            { id: "ocp3", label: "OCP3" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setProject(item.id as "all" | ProjectSlug)}
              className={`py-1.5 rounded-[7px] text-[12px] font-bold cursor-pointer ${
                project === item.id
                  ? "bg-[#0E7686] text-white"
                  : "text-[#557079]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#557079] mb-1.5">
            Bay tới phân khu
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ZONES.filter((z) => project === "all" || z.project === project).map(
              (z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedZone({ ...z })}
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold border cursor-pointer ${
                    selectedZone?.id === z.id
                      ? "bg-[#0E7686] text-white border-[#0E7686]"
                      : "bg-[#F7FAFB] text-[#0D2A33] border-[#D6E2E5]"
                  }`}
                >
                  {z.name}
                </button>
              )
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#E6EEF0] space-y-1.5 text-[12px] text-[#557079]">
          <div className="font-bold text-[#0D2A33]">Hạ tầng kết nối chính</div>
          <div>• Cao tốc Hà Nội – Hải Phòng (nút giao Cổ Linh / Lý Thánh Tông)</div>
          <div>• Vành đai 3.5 &amp; Vành đai 4 Vùng Thủ đô</div>
          <div>• Đại lộ San Hô – Đại lộ Bốn Mùa 51m</div>
        </div>
      </aside>
    </div>
  );
}
