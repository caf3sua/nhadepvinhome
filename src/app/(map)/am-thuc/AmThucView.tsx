"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FOOD_PLACES } from "@/data/projects";
import { FoodPlace } from "@/types/property";

const AmThucMapClient = dynamic(
  () =>
    import("@/components/map/AmThucMapClient").then((m) => m.AmThucMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0D2A33] text-white flex items-center justify-center font-semibold">
        Đang tải bản đồ ẩm thực...
      </div>
    ),
  }
);

const CATEGORIES = [
  "Tất cả",
  "Ăn sáng",
  "Cơm & Lẩu",
  "Cà phê - Trà sữa",
  "Nhà hàng",
  "Dịch vụ BQL",
] as const;

export default function AmThucView() {
  const [category, setCategory] = useState<string>("Tất cả");
  const [selectedPlace, setSelectedPlace] = useState<FoodPlace | null>(null);

  const filtered = useMemo(() => {
    if (category === "Tất cả") return FOOD_PLACES;
    return FOOD_PLACES.filter((f) => f.category === category);
  }, [category]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AmThucMapClient
        places={filtered}
        selectedPlace={selectedPlace}
        onSelectPlace={setSelectedPlace}
      />

      <aside className="absolute top-3 left-3 z-[400] w-[320px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-24px)] overflow-y-auto bg-white/95 backdrop-blur-md border border-[#D6E2E5] rounded-[16px] p-4 shadow-xl space-y-3.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0E7686] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang chủ nhadepvinhome
        </Link>

        <div>
          <h1 className="font-display font-extrabold text-[18px] text-[#0D2A33]">
            🍜 Bản đồ ẩm thực &amp; dịch vụ
          </h1>
          <p className="text-[12.5px] text-[#557079] mt-0.5">
            {filtered.length} địa điểm quanh Ocean Park 2 &amp; 3
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold border cursor-pointer ${
                category === cat
                  ? "bg-[#0E7686] text-white border-[#0E7686]"
                  : "bg-[#F7FAFB] text-[#0D2A33] border-[#D6E2E5]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          {filtered.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => setSelectedPlace(place)}
              className={`w-full text-left p-3 rounded-[12px] border transition-colors cursor-pointer ${
                selectedPlace?.id === place.id
                  ? "bg-[#E2F2F4] border-[#0E7686]"
                  : "bg-[#F7FAFB] border-[#E6EEF0] hover:border-[#0E7686]"
              }`}
            >
              <div className="font-bold text-[13.5px] text-[#0D2A33]">
                {place.emoji} {place.name}
              </div>
              <div className="text-[12px] text-[#557079] mt-0.5">
                {place.address}
              </div>
              <div className="text-[11.5px] text-[#0E7686] font-semibold mt-1">
                {place.hours} · {place.priceRange}
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
