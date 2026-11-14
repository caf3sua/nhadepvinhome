interface FloorPlanPreviewProps {
  dimensions: string;
  landArea: number;
  zone: string;
}

export function FloorPlanPreview({
  dimensions,
  landArea,
  zone,
}: FloorPlanPreviewProps) {
  return (
    <div className="w-full aspect-[4/3] bg-[#F4F6F7] border-b border-[#D6E2E5] p-3 flex flex-col justify-between select-none">
      {/* Two architectural CAD floorplans stacked like reference */}
      <svg
        viewBox="0 0 360 220"
        className="w-full h-full"
        aria-label={`Mặt bằng nội thất ${zone}`}
      >
        <defs>
          <pattern
            id={`grid-${zone.replace(/\s+/g, "")}`}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke="#DCE4E7"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>

        <rect width="360" height="220" fill={`url(#grid-${zone.replace(/\s+/g, "")})`} rx="6" />

        {/* TẦNG 1 */}
        <g transform="translate(26, 14)">
          {/* Dimension line top */}
          <line x1="0" y1="-4" x2="308" y2="-4" stroke="#7A8E96" strokeWidth="0.8" />
          <text x="154" y="-6" textAnchor="middle" fontSize="7.5" fill="#557079" fontWeight="600">
            {dimensions} ({landArea} m²)
          </text>

          {/* Outer walls */}
          <rect
            x="0"
            y="2"
            width="308"
            height="80"
            fill="#FFFFFF"
            stroke="#2D3E44"
            strokeWidth="2.2"
          />
          {/* Front yard / Living room / Stairs / Kitchen / Back yard */}
          <rect x="0" y="2" width="44" height="80" fill="#EDF3F5" stroke="#8CA0A7" strokeWidth="0.8" strokeDasharray="3 2" />
          <text x="22" y="45" textAnchor="middle" fontSize="7.5" fill="#557079">Sân trước</text>

          {/* Living room */}
          <rect x="44" y="2" width="96" height="80" fill="none" stroke="#2D3E44" strokeWidth="1.2" />
          <rect x="58" y="14" width="42" height="16" rx="2" fill="#E3ECEF" stroke="#7A8E96" strokeWidth="0.8" />
          <rect x="64" y="38" width="28" height="14" rx="2" fill="#F2F6F7" stroke="#7A8E96" strokeWidth="0.8" />
          <text x="92" y="70" textAnchor="middle" fontSize="8" fill="#0D2A33" fontWeight="700">PHÒNG KHÁCH</text>

          {/* Stairs & Elevator core */}
          <rect x="140" y="2" width="52" height="80" fill="#F8FAFB" stroke="#2D3E44" strokeWidth="1.2" />
          <path d="M145 10 h42 M145 16 h42 M145 22 h42 M145 28 h42 M145 34 h42" stroke="#7A8E96" strokeWidth="0.9" />
          <rect x="154" y="46" width="24" height="24" fill="#E2F2F4" stroke="#0E7686" strokeWidth="1" />
          <text x="166" y="61" textAnchor="middle" fontSize="6.5" fill="#0E7686" fontWeight="700">THANG</text>

          {/* Kitchen & Dining */}
          <rect x="192" y="2" width="84" height="80" fill="none" stroke="#2D3E44" strokeWidth="1.2" />
          <ellipse cx="232" cy="40" rx="18" ry="11" fill="#E3ECEF" stroke="#7A8E96" strokeWidth="0.8" />
          <rect x="200" y="8" width="66" height="10" fill="#E3ECEF" stroke="#7A8E96" strokeWidth="0.8" />
          <text x="234" y="70" textAnchor="middle" fontSize="8" fill="#0D2A33" fontWeight="700">BẾP &amp; ĂN</text>

          {/* Back yard */}
          <rect x="276" y="2" width="32" height="80" fill="#EDF3F5" stroke="#8CA0A7" strokeWidth="0.8" strokeDasharray="3 2" />
          <text x="292" y="45" textAnchor="middle" fontSize="7" fill="#557079">Sân sau</text>

          <text x="308" y="92" textAnchor="end" fontSize="7" fill="#557079" fontWeight="700">
            MẶT BẰNG NỘI THẤT TẦNG 1
          </text>
        </g>

        {/* TẦNG 2 */}
        <g transform="translate(26, 118)">
          <rect
            x="32"
            y="2"
            width="244"
            height="80"
            fill="#FFFFFF"
            stroke="#2D3E44"
            strokeWidth="2.2"
          />
          {/* Balcony */}
          <rect x="20" y="10" width="12" height="64" fill="#EBF5F7" stroke="#0E7686" strokeWidth="1" />
          {/* Master bedroom */}
          <rect x="32" y="2" width="108" height="80" fill="none" stroke="#2D3E44" strokeWidth="1.2" />
          <rect x="44" y="22" width="46" height="36" rx="2" fill="#E3ECEF" stroke="#7A8E96" strokeWidth="0.8" />
          <text x="86" y="72" textAnchor="middle" fontSize="8" fill="#0D2A33" fontWeight="700">PHÒNG NGỦ MASTER</text>

          {/* Core */}
          <rect x="140" y="2" width="52" height="80" fill="#F8FAFB" stroke="#2D3E44" strokeWidth="1.2" />
          <path d="M145 10 h42 M145 16 h42 M145 22 h42 M145 28 h42" stroke="#7A8E96" strokeWidth="0.9" />
          <rect x="154" y="46" width="24" height="24" fill="#E2F2F4" stroke="#0E7686" strokeWidth="1" />
          <text x="166" y="61" textAnchor="middle" fontSize="6.5" fill="#0E7686" fontWeight="700">THANG</text>

          {/* Bedroom 2 / WC */}
          <rect x="192" y="2" width="84" height="80" fill="none" stroke="#2D3E44" strokeWidth="1.2" />
          <rect x="204" y="14" width="38" height="28" rx="2" fill="#E3ECEF" stroke="#7A8E96" strokeWidth="0.8" />
          <rect x="248" y="8" width="22" height="24" fill="#EDF3F5" stroke="#7A8E96" strokeWidth="0.8" />
          <text x="234" y="72" textAnchor="middle" fontSize="8" fill="#0D2A33" fontWeight="700">SH CHUNG / WC</text>

          <text x="308" y="92" textAnchor="end" fontSize="7" fill="#557079" fontWeight="700">
            MẶT BẰNG NỘI THẤT TẦNG 2
          </text>
        </g>
      </svg>
    </div>
  );
}
