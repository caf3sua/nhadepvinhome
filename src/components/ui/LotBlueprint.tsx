import { Unit } from "@/types/property";

interface LotBlueprintProps {
  unit: Unit;
  className?: string;
}

export function LotBlueprint({ unit, className = "" }: LotBlueprintProps) {
  return (
    <div
      className={`relative w-full h-full bg-[#EBF5F7] overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(14,118,134,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,118,134,0.08) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      {/* Frontage dimension pill on top */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#0E7686] bg-white/90 px-2 py-0.5 rounded-full border border-[#CBE2E6] shadow-xs">
        {unit.frontage} m × {unit.depth} m
      </div>

      {/* Lot rectangle */}
      <div className="w-[62%] h-[58%] bg-white/95 border-2 border-[#0E7686] rounded-lg shadow-xs flex flex-col items-center justify-center px-2 text-center">
        <span className="font-display font-extrabold text-[15px] text-[#0D2A33] tracking-tight">
          {unit.code}
        </span>
        <span className="text-[11px] font-semibold text-[#557079]">
          {unit.landArea} m² đất
        </span>
        <span className="mt-1 text-[10px] font-semibold text-[#0E7686] bg-[#E8F4F6] px-2 py-0.5 rounded">
          {unit.floors} tầng · {unit.floorArea.toLocaleString("vi-VN")} m² sàn
        </span>
      </div>

      {/* Dashed road strip at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-5 bg-[#465A61] flex items-center justify-center border-t border-dashed border-white/60">
        <span className="text-[10px] font-semibold text-white tracking-wide">
          ↑ Hướng {unit.direction}
        </span>
      </div>
    </div>
  );
}
