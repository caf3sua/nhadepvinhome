"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { DESIGN_TEMPLATES } from "@/data/projects";
import { useContact } from "@/components/contact/ContactProvider";
import type {
  House3DModelInput,
  Room3DLabel,
} from "@/components/three/House3DViewer";
import type { HouseViewMode } from "@/components/three/HouseViewport";
import { HOUSE_MODELS } from "@/data/houses3d";
import { computeFloorAreas } from "@/lib/house3d/areas";
import type { HouseModel } from "@/lib/house3d/types";
import { HouseDetails } from "./HouseDetails";

const House3DViewer = dynamic(
  () =>
    import("@/components/three/House3DViewer").then((m) => m.House3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[540px] bg-[#f1efeb] flex items-center justify-center text-[#5f646b] font-semibold">
        Đang khởi tạo mô hình 3D kép (Three.js)...
      </div>
    ),
  }
);

// Viewer dựng theo dữ liệu bản vẽ (toạ độ phòng) — dùng cho các căn trong HOUSE_MODELS
const HouseViewport = dynamic(
  () => import("@/components/three/HouseViewport").then((m) => m.HouseViewport),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[320px] bg-[#f1efeb] flex items-center justify-center text-[#5f646b] font-semibold">
        Đang dựng mô hình 3D theo bản vẽ...
      </div>
    ),
  }
);

/**
 * Mặt cắt ngang ngay dưới đáy sàn tầng trên của tầng k (0-based).
 * Sàn dày 0,15 m nằm dưới cao độ tầng trên, nên cắt thấp hơn 0,25 m để
 * không cắt vào giữa tấm sàn (sẽ lộ mặt trong màu đen phủ kín mặt bằng).
 */
function houseFloorClip(h: HouseModel, k: number) {
  const next = h.levels[k + 1];
  return Number(((next ?? h.roofY) - 0.25).toFixed(2));
}

interface FullModel3D extends House3DModelInput {
  shortTitle: string;
  lotSpec: string;
  zone: string;
  project: string;
  landArea: number;
  specs: string[];
  floorDetails: {
    floor: number;
    label: string;
    totalArea: string;
    title: string;
    summary: string;
    rooms: { name: string; area: string; nx: number; nz: number }[];
  }[];
}

const MODELS_3D: FullModel3D[] = [
  {
    slug: "sao-bien-60",
    shortTitle: "Sao Biển 60 m²",
    lotSpec: "Lô 4,5 × 13,3 m",
    lotWidth: 4.5,
    lotDepth: 13.3,
    houseWidth: 4.5,
    houseDepth: 10.87,
    frontSetback: 1.3,
    backSetback: 1.1,
    floors: 5,
    hasSideGarden: false,
    isClinicFloor1: true,
    zone: "PHÂN KHU SAO BIỂN",
    project: "VINHOMES OCEAN PARK 2",
    landArea: 60,
    specs: ["Lô 4,5 × 13,3 m", "Căn góc", "5 tầng mái Mansard", "Thang máy 350 kg"],
    roomLabels: [],
    floorDetails: [
      {
        floor: 1,
        label: "Tầng 1",
        totalArea: "38,5 m²",
        title: "Tầng 1: Phòng khám",
        summary:
          "Tầng 1 làm phòng khám: khu chờ có hàng ghế phía trước, phòng điều trị 2 giường phía sau, WC cạnh lõi thang.",
        rooms: [
          { name: "Phòng khám", area: "16,7 m²", nx: 0.52, nz: 0.78 },
          { name: "Hành lang", area: "4,1 m²", nx: 0.42, nz: 0.5 },
          { name: "WC", area: "1,3 m²", nx: 0.25, nz: 0.62 },
          { name: "Phòng điều trị", area: "16,4 m²", nx: 0.52, nz: 0.22 },
        ],
      },
      {
        floor: 2,
        label: "Tầng 2",
        totalArea: "41,4 m²",
        title: "Tầng 2: Khách & Bếp ăn",
        summary: "Phòng khách nhìn ra ban công mặt tiền, bếp + bàn ăn phía sau thoáng sáng.",
        rooms: [
          { name: "Phòng khách", area: "16,7 m²", nx: 0.52, nz: 0.78 },
          { name: "Sảnh thang", area: "8,3 m²", nx: 0.5, nz: 0.5 },
          { name: "Bếp + ăn", area: "16,4 m²", nx: 0.52, nz: 0.22 },
        ],
      },
      {
        floor: 3,
        label: "Tầng 3",
        totalArea: "41,4 m²",
        title: "Tầng 3: 2 Phòng ngủ",
        summary: "Hai phòng ngủ khép kín trước và sau tách biệt bởi lõi thang bộ + thang máy.",
        rooms: [
          { name: "Phòng ngủ 1", area: "16,7 m²", nx: 0.52, nz: 0.78 },
          { name: "Sảnh thang", area: "8,3 m²", nx: 0.5, nz: 0.5 },
          { name: "Phòng ngủ 2", area: "16,4 m²", nx: 0.52, nz: 0.22 },
        ],
      },
      {
        floor: 4,
        label: "Tầng 4",
        totalArea: "41,4 m²",
        title: "Tầng 4: 2 Phòng ngủ",
        summary: "Bố trí tương đồng tầng 3 hoặc gộp thành phòng Master + phòng làm việc.",
        rooms: [
          { name: "Phòng ngủ 3", area: "16,7 m²", nx: 0.52, nz: 0.78 },
          { name: "Sảnh thang", area: "8,3 m²", nx: 0.5, nz: 0.5 },
          { name: "Phòng ngủ 4", area: "16,4 m²", nx: 0.52, nz: 0.22 },
        ],
      },
      {
        floor: 5,
        label: "Tầng 5",
        totalArea: "33,3 m²",
        title: "Tầng 5: Sân phơi & Xông hơi",
        summary: "Tầng mái Mansard với khu xông hơi / phòng thờ phía sau và sân phơi phía trước.",
        rooms: [
          { name: "Sân phơi", area: "12,9 m²", nx: 0.52, nz: 0.78 },
          { name: "Sảnh thang", area: "8,3 m²", nx: 0.5, nz: 0.5 },
          { name: "Xông hơi, massage", area: "12,1 m²", nx: 0.52, nz: 0.22 },
        ],
      },
    ],
  },
  {
    slug: "pho-bien-119",
    shortTitle: "Phố Biển 119 m²",
    lotSpec: "Lô 7 × 17 m",
    lotWidth: 7,
    lotDepth: 17,
    houseWidth: 5,
    houseDepth: 13.2,
    frontSetback: 2.0,
    backSetback: 1.8,
    floors: 5,
    hasSideGarden: true,
    zone: "PHÂN KHU PHỐ BIỂN",
    project: "VINHOMES OCEAN PARK 3",
    landArea: 119,
    specs: ["Lô 7 × 17 m", "Căn góc, nhà 5 m + vườn hông 2 m", "5 tầng", "Thang máy giữa nhà"],
    roomLabels: [],
    floorDetails: [
      {
        floor: 1,
        label: "Tầng 1",
        totalArea: "93,0 m²",
        title: "Tầng 1: Khách, bếp ăn, vườn hông",
        summary:
          "Phòng khách mở ra bậc tam cấp, lõi thang bộ + thang máy giữa nhà, bếp ăn liên thông sân sau và vườn hông 2 m.",
        rooms: [
          { name: "Phòng khách", area: "24,1 m²", nx: 0.5, nz: 0.78 },
          { name: "Vườn hông", area: "34,0 m²", nx: 1.15, nz: 0.55 },
          { name: "Sảnh thang", area: "8,2 m²", nx: 0.5, nz: 0.5 },
          { name: "Bếp + ăn", area: "26,7 m²", nx: 0.5, nz: 0.22 },
        ],
      },
      {
        floor: 2,
        label: "Tầng 2",
        totalArea: "63,8 m²",
        title: "Tầng 2: Sinh hoạt chung & Phòng đọc",
        summary: "Không gian sinh hoạt chung rộng rãi với ban công nhìn ra trục Phố Biển.",
        rooms: [
          { name: "Sinh hoạt chung", area: "24,1 m²", nx: 0.5, nz: 0.78 },
          { name: "Sảnh thang", area: "11,7 m²", nx: 0.5, nz: 0.5 },
          { name: "Phòng đọc sách", area: "28,0 m²", nx: 0.5, nz: 0.22 },
        ],
      },
      {
        floor: 3,
        label: "Tầng 3",
        totalArea: "45,5 m²",
        title: "Tầng 3: 2 Phòng ngủ khép kín",
        summary: "Hai phòng ngủ đầy đủ ánh sáng tự nhiên và WC riêng.",
        rooms: [
          { name: "Phòng ngủ 1", area: "17,8 m²", nx: 0.5, nz: 0.78 },
          { name: "WC 1 + 2", area: "8,2 m²", nx: 0.5, nz: 0.5 },
          { name: "Phòng ngủ 2", area: "19,5 m²", nx: 0.5, nz: 0.22 },
        ],
      },
      {
        floor: 4,
        label: "Tầng 4",
        totalArea: "47,0 m²",
        title: "Tầng 4: Master Suite & Phòng thay đồ",
        summary: "Thiết kế nguyên tầng cho chủ nhân với phòng thay đồ và bồn tắm lớn.",
        rooms: [
          { name: "Phòng ngủ Master", area: "24,1 m²", nx: 0.5, nz: 0.78 },
          { name: "WC Master", area: "7,1 m²", nx: 0.5, nz: 0.5 },
          { name: "Phòng thay đồ", area: "15,8 m²", nx: 0.5, nz: 0.22 },
        ],
      },
      {
        floor: 5,
        label: "Tầng 5",
        totalArea: "53,0 m²",
        title: "Tầng 5: Phòng thờ & Sân chơi BBQ",
        summary: "Phòng thờ trang nghiêm phía trước và sân thượng BBQ thoáng mát.",
        rooms: [
          { name: "Phòng thờ", area: "19,9 m²", nx: 0.5, nz: 0.78 },
          { name: "Giặt phơi", area: "6,4 m²", nx: 0.5, nz: 0.5 },
          { name: "Sân chơi", area: "26,7 m²", nx: 0.5, nz: 0.22 },
        ],
      },
    ],
  },
  ...DESIGN_TEMPLATES.map((t) => {
    const parts = t.dimensions
      .replace(/,/g, ".")
      .split("×")
      .map((s) => parseFloat(s));
    const lw = parts[0] || 5;
    const ld = parts[1] || 16;
    const hd = Math.max(ld - 3.0, 9.5);
    return {
      slug: t.slug,
      shortTitle: `${t.zone} ${t.landArea} m²`,
      lotSpec: `Lô ${t.dimensions}`,
      lotWidth: lw,
      lotDepth: ld,
      houseWidth: lw,
      houseDepth: hd,
      frontSetback: 1.5,
      backSetback: 1.5,
      floors: t.floors,
      hasSideGarden: false,
      zone: `PHÂN KHU ${t.zone.toUpperCase()}`,
      project: t.project.toUpperCase(),
      landArea: t.landArea,
      specs: [`Lô ${t.dimensions}`, `${t.floors} tầng`, "Thang máy giữa nhà"],
      roomLabels: [],
      floorDetails: [1, 2, 3, 4, 5].map((f) => ({
        floor: f,
        label: `Tầng ${f}`,
        totalArea: `${Math.round(t.landArea * 0.78)} m²`,
        title: `Tầng ${f}: ${(t.rooms[f - 1]?.items || ["Bố trí linh hoạt"]).join(" · ")}`,
        summary: t.summary,
        rooms: [
          {
            name: t.rooms[f - 1]?.items[0] || "Phòng trước",
            area: `${Math.round(t.landArea * 0.34)} m²`,
            nx: 0.5,
            nz: 0.78,
          },
          {
            name: "Sảnh thang",
            area: "8,5 m²",
            nx: 0.5,
            nz: 0.5,
          },
          {
            name: t.rooms[f - 1]?.items[1] || "Phòng sau",
            area: `${Math.round(t.landArea * 0.32)} m²`,
            nx: 0.5,
            nz: 0.22,
          },
        ],
      })),
    };
  }),
];

type ViewMode = "floor" | "whole" | "wireframe" | "top";

/** Khung 3D đang hiển thị: cả hai, chỉ "Cả tòa" (trái) hoặc chỉ "Bóc mái" (phải). */
type PaneLayout = "both" | "main" | "exploded";

const PANE_OPTIONS: { id: PaneLayout; label: string; title: string }[] = [
  { id: "both", label: "Cả hai", title: "Hiện cả khung Cả tòa và khung Bóc mái" },
  { id: "main", label: "Cả tòa", title: "Chỉ xem khung Cả tòa, toàn màn hình" },
  { id: "exploded", label: "Bóc mái", title: "Chỉ xem khung Từng tầng · bóc mái, toàn màn hình" },
];

function PanelToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!open}
      aria-controls="three-d-panel"
      title={open ? "Ẩn bảng thông tin bên phải để xem 3D rộng hơn" : "Hiện bảng thông tin bên phải"}
      className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-[#f6f5f1]/95 border border-[#d3d0c9] shadow-2xs text-[12px] font-semibold text-[#1d2024] hover:border-[#e3a400] cursor-pointer"
    >
      {open ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
      {open ? "Ẩn bảng" : "Hiện bảng"}
    </button>
  );
}

function PaneSwitcher({
  value,
  onChange,
  className = "",
}: {
  value: PaneLayout;
  onChange: (v: PaneLayout) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Khung 3D hiển thị"
      className={`pointer-events-auto flex w-fit p-0.5 rounded-[7px] bg-[#f6f5f1]/95 border border-[#d3d0c9] shadow-2xs text-[12px] font-semibold ${className}`}
    >
      {PANE_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 rounded-[5px] cursor-pointer transition-colors ${
            value === o.id ? "bg-[#1d2024] text-white" : "text-[#5f646b] hover:bg-[#ecebe6]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ThreeDView() {
  const { openLeadModal } = useContact();
  const [selectedSlug, setSelectedSlug] = useState(
    HOUSE_MODELS[0]?.id ?? MODELS_3D[0].slug
  );
  const [activeFloor, setActiveFloor] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("floor");
  const [hideLeftWall, setHideLeftWall] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showNeighbor, setShowNeighbor] = useState(true);
  const [panes, setPanes] = useState<PaneLayout>("both");
  // Ẩn panel phải (400px) để vùng 3D chiếm toàn bộ chiều ngang
  const [showPanel, setShowPanel] = useState(true);
  const showMain = panes !== "exploded";
  const showExploded = panes !== "main";
  const [cutHeight, setCutHeight] = useState(() =>
    HOUSE_MODELS[0] ? houseFloorClip(HOUSE_MODELS[0], 0) : 3.2
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (
      hash &&
      (MODELS_3D.some((m) => m.slug === hash) ||
        HOUSE_MODELS.some((h) => h.id === hash))
    ) {
      setSelectedSlug(hash);
      const h = HOUSE_MODELS.find((x) => x.id === hash);
      setCutHeight(h ? houseFloorClip(h, 0) : 3.2);
    }
  }, []);

  // Căn dựng theo bản vẽ (nếu đang chọn)
  const house = HOUSE_MODELS.find((h) => h.id === selectedSlug) ?? null;
  const houseAreas = useMemo(
    () => (house ? computeFloorAreas(house) : []),
    [house]
  );
  const houseMode: HouseViewMode =
    viewMode === "whole"
      ? "all"
      : viewMode === "wireframe"
      ? "raw"
      : viewMode === "top"
      ? "top"
      : "floor";
  const houseClip = house
    ? viewMode === "whole" || viewMode === "wireframe"
      ? house.topY + 2
      : cutHeight
    : 0;
  const floorTabs = house
    ? house.floors.map((f, i) => ({ floor: i + 1, label: f.name }))
    : null;

  const currentModel = useMemo(() => {
    const base =
      MODELS_3D.find((m) => m.slug === selectedSlug) || MODELS_3D[0];
    const roomLabels: Room3DLabel[] = base.floorDetails.flatMap((fd) =>
      fd.rooms.map((r) => ({
        name: r.name,
        area: r.area,
        floor: fd.floor,
        nx: r.nx,
        nz: r.nz,
      }))
    );
    return { ...base, roomLabels };
  }, [selectedSlug]);

  const currentFloor =
    currentModel.floorDetails.find((f) => f.floor === activeFloor) ||
    currentModel.floorDetails[0];

  function selectFloor(floorNum: number, slug = selectedSlug) {
    setActiveFloor(floorNum);
    setViewMode("floor");
    const h = HOUSE_MODELS.find((x) => x.id === slug);
    setCutHeight(
      h
        ? houseFloorClip(h, floorNum - 1)
        : Number(((floorNum - 1) * 4.0 + 3.2).toFixed(1))
    );
  }

  return (
    <div
      className={`min-h-screen lg:h-screen lg:overflow-hidden bg-[#e9e7e2] text-[#1d2024] grid grid-cols-1 ${
        showPanel ? "lg:grid-cols-[minmax(0,1fr)_400px]" : ""
      }`}
    >
      {/* Left+Middle Dual 3D Stage */}
      <div
        className={`relative min-w-0 lg:h-full lg:min-h-0 ${
          panes === "both" ? "min-h-[760px]" : "min-h-[540px]"
        }`}
      >
        {house ? (
          <div
            className={`absolute inset-0 grid ${
              panes === "both"
                ? "grid-rows-[58%_42%] lg:grid-rows-1 lg:grid-cols-[44%_56%]"
                : "grid-rows-1 grid-cols-1"
            }`}
          >
            {showMain && (
            <div className="relative min-h-0 lg:border-r border-[#d3d0c9]">
              <HouseViewport
                model={house}
                variant="main"
                mode={houseMode}
                floor={activeFloor - 1}
                clip={houseClip}
                hideLeft={hideLeftWall}
                showFurniture={showFurniture}
                showNeighbors={showNeighbor}
              />
            </div>
            )}
            {showExploded && (
            <div className="relative min-h-0 border-t lg:border-t-0 border-[#d3d0c9] bg-[#efede8]">
              {panes === "both" && (
                <div className="pointer-events-none lg:hidden absolute top-2 left-3 z-10 font-display font-extrabold text-[13px]">
                  Từng tầng · bóc mái
                </div>
              )}
              <HouseViewport
                model={house}
                variant="exploded"
                mode={houseMode}
                floor={activeFloor - 1}
                clip={houseClip}
                hideLeft={false}
                showFurniture={showFurniture}
                showNeighbors={false}
                onFloorClick={(k) => selectFloor(k + 1)}
              />
            </div>
            )}
          </div>
        ) : (
          <House3DViewer
            model={currentModel}
            viewMode={viewMode}
            activeFloor={activeFloor}
            cutHeight={cutHeight}
            hideLeftWall={hideLeftWall}
            showFurniture={showFurniture}
            showNeighbor={showNeighbor}
            onSelectFloor={selectFloor}
            layout={panes}
          />
        )}

        {/* Desktop: chọn khung hiển thị + ẩn/hiện panel phải, nổi ở góc phải trên */}
        <div className="hidden lg:flex absolute top-3 right-3 z-20 items-center gap-2">
          <PaneSwitcher value={panes} onChange={setPanes} />
          <PanelToggle open={showPanel} onToggle={() => setShowPanel((v) => !v)} />
        </div>

        {/* Overlay: Left Top Controls (inside #view area) */}
        <div
          className={`pointer-events-none absolute top-3 left-3 right-3 lg:right-auto space-y-2 z-10 ${
            panes === "both" ? "lg:w-[41%]" : "lg:w-[calc(100%-370px)]"
          }`}
        >
          {/* Chọn khung hiển thị (mobile: hàng đầu, không đè lên tab tầng) */}
          <div className="lg:hidden flex flex-wrap items-center gap-2">
            <PaneSwitcher value={panes} onChange={setPanes} />
            <PanelToggle open={showPanel} onToggle={() => setShowPanel((v) => !v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Link
              href="/mau-thiet-ke"
              className="pointer-events-auto inline-flex items-center gap-1 font-bold text-[#855c00] hover:underline bg-[#f6f5f1]/85 px-2 py-0.5 rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Mẫu thiết kế
            </Link>
            <span className="font-display font-extrabold text-[14px]">
              {showMain ? "Cả tòa" : "Từng tầng · bóc mái"}{" "}
              <span className="font-mono font-normal text-[12px] text-[#5f646b]">
                ·{" "}
                {viewMode === "whole"
                  ? "Toàn nhà"
                  : viewMode === "wireframe"
                  ? "Khung thô"
                  : viewMode === "top"
                  ? "Từ trên"
                  : `Cắt ngang ở +${cutHeight.toFixed(1).replace(".", ",")} m`}
              </span>
            </span>
          </div>

          <div className="pointer-events-auto flex flex-wrap gap-1.5 text-[12.5px] font-semibold">
            {(floorTabs ?? currentModel.floorDetails).map((f) => (
              <button
                key={f.floor}
                type="button"
                onClick={() => selectFloor(f.floor)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  viewMode === "floor" && activeFloor === f.floor
                    ? "bg-[#1d2024] text-white"
                    : "hover:bg-[#ecebe6] text-[#1d2024]"
                }`}
              >
                {f.label}
              </button>
            ))}
            {[
              { id: "whole", label: "Toàn nhà" },
              { id: "wireframe", label: "Khung thô" },
              { id: "top", label: "Từ trên" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id as ViewMode)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  viewMode === m.id
                    ? "bg-[#855c00] text-white"
                    : "hover:bg-[#ecebe6] text-[#5f646b]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay: Middle-Right Top Title (inside #view2 area) */}
        <div
          className={`pointer-events-none absolute top-3 left-[44%] z-10 ${
            panes === "both" ? "hidden lg:block" : "hidden"
          }`}
        >
          <div className="font-display font-extrabold text-[15px] text-[#1d2024]">
            Từng tầng · bóc mái
          </div>
          <div className="text-[12px] text-[#5f646b]">
            bấm tên tầng để xem bên cả tòa · kéo để xoay 3D
          </div>
        </div>

        {/* Overlay: Bottom-Left Interactive Toggles & Cutaway Slider */}
        <div
          className={`pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 z-10 ${
            panes === "both"
              ? "max-lg:bottom-[calc(42%+8px)] max-lg:right-3 lg:w-[41%]"
              : "w-[calc(100%-24px)]"
          }`}
        >
          {showMain && (
          <button
            type="button"
            onClick={() => setHideLeftWall((v) => !v)}
            className="pointer-events-auto px-2.5 py-1 rounded-[5px] bg-[#f6f5f1]/95 border border-[#d3d0c9] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span
              className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[10px] font-bold ${
                hideLeftWall ? "bg-[#e3a400] text-[#1d1a10]" : "bg-[#dcd7ce]"
              }`}
            >
              {hideLeftWall ? "✓" : ""}
            </span>
            Bỏ tường bên trái
          </button>
          )}

          <button
            type="button"
            onClick={() => setShowFurniture((v) => !v)}
            className="pointer-events-auto px-2.5 py-1 rounded-[5px] bg-[#f6f5f1]/95 border border-[#d3d0c9] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span
              className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[10px] font-bold ${
                showFurniture ? "bg-[#e3a400] text-[#1d1a10]" : "bg-[#dcd7ce]"
              }`}
            >
              {showFurniture ? "✓" : ""}
            </span>
            Nội thất
          </button>

          {showMain && (
          <>
          <button
            type="button"
            onClick={() => setShowNeighbor((v) => !v)}
            className="pointer-events-auto px-2.5 py-1 rounded-[5px] bg-[#f6f5f1]/95 border border-[#d3d0c9] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span
              className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[10px] font-bold ${
                showNeighbor ? "bg-[#e3a400] text-[#1d1a10]" : "bg-[#dcd7ce]"
              }`}
            >
              {showNeighbor ? "✓" : ""}
            </span>
            Nhà bên cạnh
          </button>

          <div className="pointer-events-auto px-2.5 py-1 rounded-[5px] bg-[#f6f5f1]/95 border border-[#d3d0c9] text-[12px] font-semibold flex items-center gap-2 shadow-2xs">
            <span className="text-[#5f646b]">Cắt ngang</span>
            <input
              type="range"
              min="1.5"
              max={house ? (house.topY + 2).toFixed(1) : "21"}
              step="0.1"
              value={cutHeight}
              onChange={(e) => {
                setViewMode("floor");
                setCutHeight(parseFloat(e.target.value));
              }}
              className="w-24 accent-[#e3a400]"
            />
            <span className="font-mono text-[11.5px]">
              +{cutHeight.toFixed(1).replace(".", ",")} m
            </span>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Right Panel (400px) */}
      <aside
        id="three-d-panel"
        hidden={!showPanel}
        className="bg-[#f6f5f1] border-t lg:border-t-0 lg:border-l border-[#d3d0c9] p-4 sm:p-5 overflow-y-auto space-y-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 bg-[#e3a400] rounded-full" />
            <h2 className="font-display font-bold text-[15px]">
              Chọn căn để xem 3D
              <span className="ml-1.5 font-sans font-semibold text-[12px] text-[#5f646b]">
                ({HOUSE_MODELS.length + MODELS_3D.length})
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {HOUSE_MODELS.map((h) => {
              const active = h.id === selectedSlug;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(h.id);
                    selectFloor(1, h.id);
                    window.history.replaceState(null, "", `#${h.id}`);
                  }}
                  className={`text-left p-2.5 rounded-[10px] border transition-all cursor-pointer ${
                    active
                      ? "bg-[#e3a400] border-[#c48d00] text-[#1d1a10] shadow-xs"
                      : "bg-white border-[#e0dcd3] hover:border-[#e3a400]"
                  }`}
                >
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold mb-1 ${
                      active ? "bg-[#1d2024] text-white" : "bg-[#0E7686] text-white"
                    }`}
                  >
                    {active ? "▶ Đang xem · " : ""}Theo bản vẽ
                  </span>
                  <div className="font-display font-bold text-[13px] leading-snug">
                    {h.shortName}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      active ? "text-[#1d1a10]/80" : "text-[#5f646b]"
                    }`}
                  >
                    {h.specs[0]}
                  </div>
                </button>
              );
            })}
            {MODELS_3D.map((m) => {
              const active = !house && m.slug === currentModel.slug;
              return (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(m.slug);
                    selectFloor(1, m.slug);
                    window.history.replaceState(null, "", `#${m.slug}`);
                  }}
                  className={`text-left p-2.5 rounded-[10px] border transition-all cursor-pointer ${
                    active
                      ? "bg-[#e3a400] border-[#c48d00] text-[#1d1a10] shadow-xs"
                      : "bg-white border-[#e0dcd3] hover:border-[#e3a400]"
                  }`}
                >
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold mb-1 ${
                      active
                        ? "bg-[#1d2024] text-white"
                        : "bg-[#ecebe6] text-[#5f646b]"
                    }`}
                  >
                    {active ? "▶ Đang xem · " : ""}Minh hoạ
                  </span>
                  <div className="font-display font-bold text-[13px] leading-snug">
                    {m.shortTitle}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      active ? "text-[#1d1a10]/80" : "text-[#5f646b]"
                    }`}
                  >
                    {m.lotSpec}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {house ? (
          <HouseDetails
            house={house}
            areas={houseAreas}
            activeFloor={activeFloor - 1}
            viewMode={viewMode}
            onSelectFloor={(k) => selectFloor(k + 1)}
            onLead={() =>
              openLeadModal(`Tư vấn căn ${house.code} (${house.zone}) theo mẫu 3D`)
            }
          />
        ) : (
        <>
        {/* Selected house details */}
        <div className="pt-3 border-t border-[#d3d0c9] space-y-2.5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5f646b]">
            {currentModel.zone} · {currentModel.project}
          </div>
          <h1 className="font-display font-extrabold text-[23px] text-[#1d2024] leading-tight">
            {currentModel.shortTitle}
          </h1>
          <div className="flex flex-wrap gap-1.5 text-[11.5px] font-semibold">
            {currentModel.specs.map((sp) => (
              <span
                key={sp}
                className="px-2 py-0.5 rounded bg-[#ecebe6] text-[#1d2024]"
              >
                {sp}
              </span>
            ))}
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#ecebe6] space-y-1.5">
            <div className="font-display font-bold text-[14px]">
              {currentFloor.title}
            </div>
            <p className="text-[12.5px] text-[#5f646b] leading-relaxed">
              {currentFloor.summary}
            </p>
          </div>
        </div>

        {/* Room Areas Breakdown */}
        <div className="pt-2 border-t border-[#d3d0c9] space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5f646b]">
            Diện tích các phòng
          </div>
          <div className="space-y-2">
            {currentModel.floorDetails.map((fd) => (
              <div
                key={fd.floor}
                onClick={() => selectFloor(fd.floor)}
                className={`p-2.5 rounded-[8px] border cursor-pointer transition-colors ${
                  activeFloor === fd.floor
                    ? "bg-white border-[#e3a400]"
                    : "bg-[#f1efeb] border-transparent hover:border-[#d3d0c9]"
                }`}
              >
                <div className="flex items-center justify-between text-[12.5px] font-bold">
                  <span>{fd.label}</span>
                  <span className="font-mono text-[#855c00]">
                    {fd.totalArea}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-[#5f646b]">
                  {fd.rooms.map((r) => (
                    <span key={r.name}>
                      {r.name}: <strong className="text-[#1d2024]">{r.area}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            openLeadModal(
              `Tư vấn căn thực tế & bản vẽ CAD mẫu ${currentModel.shortTitle}`
            )
          }
          className="w-full py-2.5 rounded-[10px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[13.5px] cursor-pointer"
        >
          Tìm căn đang bán giống mẫu này
        </button>

        <p className="text-[11px] text-[#5f646b] leading-relaxed">
          * Mẫu minh hoạ: kích thước lô, trục thang và công năng phòng mang tính tham khảo, chưa dựng theo bản vẽ thật. Kéo chuột ở cả khung trái và khung giữa để xoay 3D tự do.
        </p>
        </>
        )}
      </aside>
    </div>
  );
}
