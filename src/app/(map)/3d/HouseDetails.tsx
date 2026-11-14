"use client";

import Link from "next/link";
import type { FloorAreas } from "@/lib/house3d/areas";
import { fmtM2 } from "@/lib/house3d/areas";
import type { HouseModel } from "@/lib/house3d/types";

interface Props {
  house: HouseModel;
  areas: FloorAreas[];
  /** Tầng đang chọn (0-based). */
  activeFloor: number;
  viewMode: "floor" | "whole" | "wireframe" | "top";
  onSelectFloor: (index: number) => void;
  onLead: () => void;
}

/** Panel phải cho căn dựng theo bản vẽ: mô tả tầng, bảng diện tích, nguồn số liệu. */
export function HouseDetails({ house, areas, activeFloor, viewMode, onSelectFloor, onLead }: Props) {
  const fl = house.floors[activeFloor] ?? house.floors[0];
  const fa = areas[activeFloor] ?? areas[0];

  let title = `${fl.name}: ${fl.title}`;
  let desc = fl.description;
  if (viewMode === "whole") {
    title = "Toàn nhà";
    desc = `${house.floors.length} tầng, cao khoảng ${fmtM2(house.topY)} m tính từ sàn tầng 1. Bật "Bỏ tường bên trái" để nhìn vào trong hoặc chọn từng tầng.`;
  } else if (viewMode === "wireframe") {
    title = "Khung thô";
    desc = "Căn thô trước khi làm nội thất: sàn, thang, tường gạch. Bấm một tầng để quay lại bản hoàn thiện.";
  } else if (viewMode === "top") {
    title = `Nhìn từ trên · ${fl.name}`;
    desc = "Nhìn thẳng xuống như mặt bằng bố trí. Kéo thanh “Cắt ngang” để đổi tầng.";
  }

  const totalIndoor = areas.reduce((s, a) => s + a.indoor, 0);

  return (
    <>
      <div className="pt-3 border-t border-[#d3d0c9] space-y-2.5">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5f646b]">
          {house.zone} · {house.project}
        </div>
        <h1 className="font-display font-extrabold text-[23px] text-[#1d2024] leading-tight">
          {house.name}
        </h1>
        <div className="flex flex-wrap gap-1.5 text-[11.5px] font-semibold">
          {house.specs.map((sp) => (
            <span key={sp} className="px-2 py-0.5 rounded bg-[#ecebe6] text-[#1d2024]">
              {sp}
            </span>
          ))}
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#ecebe6] space-y-1.5">
          <div className="font-display font-bold text-[14px]">{title}</div>
          <p className="text-[12.5px] text-[#5f646b] leading-relaxed">{desc}</p>
          {viewMode === "floor" && fa && (
            <ul className="pt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[12px] text-[#5f646b]">
              {fa.rooms.map((r) => (
                <li key={r.name}>
                  {r.name}: <strong className="text-[#1d2024]">{fmtM2(r.area)} m²</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bảng diện tích */}
      <div className="pt-2 border-t border-[#d3d0c9] space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5f646b]">
            Diện tích các phòng
          </div>
          <div className="text-[11px] text-[#5f646b]">
            Sử dụng ≈ <strong className="text-[#1d2024]">{fmtM2(totalIndoor)} m²</strong>
            {house.totalGrossArea ? (
              <>
                {" "}· DTXD <strong className="text-[#1d2024]">{fmtM2(house.totalGrossArea)} m²</strong>
              </>
            ) : null}
          </div>
        </div>
        <table className="w-full text-[12px]">
          <tbody>
            {areas.map((a) => (
              <FloorRows
                key={a.index}
                fa={a}
                active={a.index === activeFloor}
                onClick={() => onSelectFloor(a.index)}
              />
            ))}
          </tbody>
        </table>
        <p className="text-[10.5px] text-[#5f646b]">
          Diện tích phòng tự tính từ mặt bằng (lòng tường, trừ lõi thang). DTXD lấy theo bảng của chủ đầu tư.
        </p>
      </div>

      <div className="space-y-2">
        {house.listingHref && (
          <Link
            href={house.listingHref}
            className="block w-full py-2.5 rounded-[10px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[13.5px] text-center"
          >
            Xem căn đang bán cùng phân khu →
          </Link>
        )}
        <button
          type="button"
          onClick={onLead}
          className="w-full py-2.5 rounded-[10px] bg-white border border-[#d3d0c9] hover:border-[#e3a400] text-[#1d2024] font-bold text-[13.5px] cursor-pointer"
        >
          Tư vấn căn có mặt bằng này
        </button>
      </div>

      <div className="space-y-1.5 text-[11px] text-[#5f646b] leading-relaxed">
        <div className="flex gap-2 p-2 rounded-[8px] bg-[#fff7e0] border border-[#f0d58a]">
          <span className="shrink-0 font-bold text-[#855c00]">{house.estimated ? "Ước lượng" : "Theo bản vẽ"}</span>
          <span>{house.note}</span>
        </div>
        <div>Kéo để xoay · cuộn để phóng to · chuột phải để dời khung nhìn.</div>
      </div>
    </>
  );
}

function FloorRows({ fa, active, onClick }: { fa: FloorAreas; active: boolean; onClick: () => void }) {
  return (
    <>
      <tr
        onClick={onClick}
        className={`cursor-pointer ${active ? "bg-[#fff3cc]" : "hover:bg-[#ecebe6]"}`}
      >
        <th scope="row" className="text-left py-1.5 px-1.5 font-bold text-[#855c00]">
          {fa.name}
        </th>
        <td className="text-right py-1.5 px-1.5 font-bold font-mono text-[#855c00]">
          {fmtM2(fa.indoor)} m²
          {fa.gross ? (
            <span className="ml-1 font-normal text-[#5f646b]">/ DTXD {fmtM2(fa.gross)}</span>
          ) : null}
        </td>
      </tr>
      {fa.rooms.map((r) => (
        <tr key={r.name} className="border-b border-[#ecebe6] last:border-0">
          <td className="py-0.5 pl-3 text-[#1d2024]">{r.name}</td>
          <td className="py-0.5 px-1.5 text-right font-mono text-[#1d2024]">{fmtM2(r.area)}</td>
        </tr>
      ))}
    </>
  );
}
