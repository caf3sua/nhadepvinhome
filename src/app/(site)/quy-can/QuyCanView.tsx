"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { UNITS } from "@/data/units";
import { ZONES } from "@/data/zones";
import { UnitCard } from "@/components/ui/UnitCard";
import {
  calcPricePerM2,
  inAreaRange,
  inPriceRange,
  isUnitHot,
} from "@/lib/format";

function QuyCanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [project, setProject] = useState(searchParams.get("du-an") || "all");
  const [zone, setZone] = useState(searchParams.get("phan-khu") || "all");
  const [type, setType] = useState(searchParams.get("loai") || "all");
  const [dir, setDir] = useState(searchParams.get("huong") || "all");
  const [priceRange, setPriceRange] = useState(searchParams.get("gia") || "all");
  const [areaRange, setAreaRange] = useState(searchParams.get("dt") || "all");
  const [sort, setSort] = useState("hot");

  // Ô từ khoá: lọc danh sách ngay, nhưng chỉ ghi lên URL sau khi ngừng gõ 400ms
  // để không gọi router.replace ở mỗi phím.
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Sync filters to URL query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (project !== "all") params.set("du-an", project);
    if (zone !== "all") params.set("phan-khu", zone);
    if (type !== "all") params.set("loai", type);
    if (dir !== "all") params.set("huong", dir);
    if (priceRange !== "all") params.set("gia", priceRange);
    if (areaRange !== "all") params.set("dt", areaRange);
    const qs = params.toString();
    const next = qs ? `/quy-can?${qs}` : "/quy-can";
    // Bỏ qua nếu URL đã đúng (tránh replace thừa ở lần render đầu)
    if (`${window.location.pathname}${window.location.search}` === next) return;
    router.replace(next, { scroll: false });
  }, [debouncedQ, project, zone, type, dir, priceRange, areaRange, router]);

  const availableZones = useMemo(() => {
    if (project === "all") return ZONES;
    return ZONES.filter((z) => z.project === project);
  }, [project]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const list = UNITS.filter((u) => {
      if (keyword) {
        const hay = `${u.code} ${u.zoneName} ${u.type} ${u.statusNote || ""}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      if (project !== "all" && u.project !== project) return false;
      if (zone !== "all" && u.zoneId !== zone) return false;
      if (type !== "all" && u.type !== type) return false;
      if (dir !== "all" && u.direction !== dir) return false;

      if (!inPriceRange(u.price, priceRange)) return false;
      if (!inAreaRange(u.landArea, areaRange)) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "perm2-asc") {
        return (
          calcPricePerM2(a.price, a.landArea) -
          calcPricePerM2(b.price, b.landArea)
        );
      }
      // HOT first
      const ah = isUnitHot(a) ? 1 : 0;
      const bh = isUnitHot(b) ? 1 : 0;
      if (bh !== ah) return bh - ah;
      return a.price - b.price;
    });
  }, [q, project, zone, type, dir, priceRange, areaRange, sort]);

  function resetAll() {
    setQ("");
    setProject("all");
    setZone("all");
    setType("all");
    setDir("all");
    setPriceRange("all");
    setAreaRange("all");
    setSort("hot");
  }

  return (
    <div className="wrap py-8 space-y-6">
      <div className="text-[13px] text-[#557079]">
        <Link href="/" className="text-[#0E7686] hover:underline font-medium">
          Trang chủ
        </Link>{" "}
        / <span>Quỹ căn</span>
      </div>

      <h1 className="font-display font-extrabold text-[28px] sm:text-[38px] uppercase text-gold-lo">
        QUỸ CĂN OCEAN PARK 2 · 3
      </h1>

      <div className="grid lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Left filter panel (details#fbox.filters) */}
        <details
          id="fbox"
          open
          className="bg-white rounded-[16px] border border-[#D6E2E5] p-4 shadow-xs lg:sticky lg:top-20"
        >
          <summary className="font-display font-extrabold text-[15px] text-[#0D2A33] flex items-center justify-between cursor-pointer list-none">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0E7686]" />
              Bộ lọc căn
            </span>
          </summary>

          <div className="mt-4 space-y-3 text-[13px]">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#557079] mb-1">
                Mã căn / Từ khóa
              </label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="VD: CL8, Kinh Đô..."
                className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] outline-none focus:border-[#0E7686]"
              />
            </div>

            <FilterSelect
              label="Dự án"
              value={project}
              onChange={(v) => {
                setProject(v);
                setZone("all");
              }}
              options={[
                { value: "all", label: "Cả hai dự án" },
                { value: "ocp2", label: "Ocean Park 2" },
                { value: "ocp3", label: "Ocean Park 3" },
              ]}
            />

            <FilterSelect
              label="Phân khu"
              value={zone}
              onChange={setZone}
              options={[
                { value: "all", label: "Tất cả phân khu" },
                ...availableZones.map((z) => ({ value: z.id, label: z.name })),
              ]}
            />

            <FilterSelect
              label="Loại hình"
              value={type}
              onChange={setType}
              options={[
                { value: "all", label: "Tất cả loại hình" },
                ...[
                  "Liền kề",
                  "Liền kề góc",
                  "Shophouse",
                  "Song lập",
                  "Tứ lập",
                  "Xẻ khe",
                  "Đơn lập",
                ].map((t) => ({ value: t, label: t })),
              ]}
            />

            <FilterSelect
              label="Hướng"
              value={dir}
              onChange={setDir}
              options={[
                { value: "all", label: "Tất cả hướng" },
                ...[
                  "Đông",
                  "Tây",
                  "Nam",
                  "Bắc",
                  "Đông Bắc",
                  "Đông Nam",
                  "Tây Bắc",
                  "Tây Nam",
                ].map((d) => ({ value: d, label: d })),
              ]}
            />

            <FilterSelect
              label="Khoảng giá"
              value={priceRange}
              onChange={setPriceRange}
              options={[
                { value: "all", label: "Tất cả mức giá" },
                { value: "under-10", label: "Dưới 10 tỷ" },
                { value: "10-20", label: "10 – 20 tỷ" },
                { value: "20-30", label: "20 – 30 tỷ" },
                { value: "over-30", label: "Trên 30 tỷ" },
              ]}
            />

            <FilterSelect
              label="Diện tích đất"
              value={areaRange}
              onChange={setAreaRange}
              options={[
                { value: "all", label: "Tất cả diện tích" },
                { value: "under-90", label: "Dưới 90 m²" },
                { value: "90-130", label: "90 – 130 m²" },
                { value: "130-200", label: "130 – 200 m²" },
                { value: "over-200", label: "Trên 200 m²" },
              ]}
            />

            <button
              type="button"
              onClick={resetAll}
              className="w-full py-2 rounded-[10px] bg-[#F2F6F7] hover:bg-[#E2ECEE] text-[#0D2A33] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          </div>
        </details>

        {/* Results area */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[14.5px] text-[#557079]">
              Tìm thấy <strong className="text-[#0D2A33]">{filtered.length}</strong> căn
            </div>
            <div className="flex items-center gap-2 text-[13.5px]">
              <span className="text-[#557079] font-medium">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 rounded-[10px] bg-white border border-[#D6E2E5] font-semibold text-[#0D2A33]"
              >
                <option value="hot">Căn HOT trước</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="perm2-asc">Đơn giá/m² thấp nhất</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-[14px] border border-[#D6E2E5] p-10 text-center space-y-2">
              <div className="font-display font-bold text-[18px] text-[#0D2A33]">
                Không có căn phù hợp bộ lọc hiện tại
              </div>
              <p className="text-[14px] text-[#557079]">
                Hãy thử nới rộng khoảng giá hoặc đặt lại bộ lọc để xem toàn bộ quỹ căn.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#557079] mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] font-medium text-[#0D2A33] outline-none focus:border-[#0E7686]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function QuyCanView() {
  return (
    <Suspense
      fallback={
        <div className="wrap py-12 text-[#557079]">Đang tải quỹ căn...</div>
      }
    >
      <QuyCanContent />
    </Suspense>
  );
}
