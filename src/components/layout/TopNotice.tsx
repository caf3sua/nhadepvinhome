import { SITE_CONFIG } from "@/config/site";

export function TopNotice() {
  const primary = SITE_CONFIG.agents[0];
  return (
    <div className="bg-[#FCE9D5] text-[#0D2A33] text-[12.5px] sm:text-[13px] py-1.5 px-3 text-center border-b border-[#F2D3B1]">
      <div className="wrap">
        <strong>Thấp tầng &amp; chung cư chuyển nhượng</strong> giá tốt Ocean Park 2 &amp; 3. Cập nhật{" "}
        <strong>{SITE_CONFIG.updatedDate}</strong>. Gọi/Zalo{" "}
        <a
          href={`tel:${primary.phone}`}
          className="font-bold underline decoration-[#0E7686] hover:text-[#0E7686]"
        >
          {primary.phoneDisplay}
        </a>{" "}
        để xem nhà.
      </div>
    </div>
  );
}
