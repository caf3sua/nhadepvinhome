import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-[#0D2A33] text-white/85 pt-10 pb-24 mt-14 border-t border-white/10">
      <div className="wrap grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="font-display font-extrabold text-[22px] text-white">
            nhadep<span className="text-[#4CC4D6]">vinhome</span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-white/75">
            {SITE_CONFIG.disclaimer}
          </p>
          <p className="text-[12.5px] text-white/60">
            {SITE_CONFIG.priceWarning}
          </p>
        </div>

        <div className="space-y-2.5 text-[14px]">
          <div className="font-display font-bold text-white uppercase tracking-wider text-[13px]">
            Điều hướng nhanh
          </div>
          <ul className="space-y-1.5 text-white/75">
            <li>
              <Link href="/quy-can" className="hover:text-white">
                → Danh sách Quỹ căn OCP2 &amp; OCP3
              </Link>
            </li>
            <li>
              <Link href="/ocean-park-2" className="hover:text-white">
                → Vinhomes Ocean Park 2 (The Empire)
              </Link>
            </li>
            <li>
              <Link href="/ocean-park-3" className="hover:text-white">
                → Vinhomes Ocean Park 3 (The Crown)
              </Link>
            </li>
            <li>
              <Link href="/mau-thiet-ke" className="hover:text-white">
                → Mẫu thiết kế nội thất liền kề
              </Link>
            </li>
            <li>
              <Link href="/3d" className="hover:text-white">
                → Nhà phố Ocean Park 3D
              </Link>
            </li>
            <li>
              <Link href="/olympic" className="hover:text-white">
                → Bản đồ quy hoạch Olympic Hà Nội
              </Link>
            </li>
            <li>
              <Link href="/ve-tinh" className="hover:text-white">
                → Quỹ căn trên bản đồ vệ tinh
              </Link>
            </li>
            <li>
              <Link href="/am-thuc" className="hover:text-white">
                → Bản đồ ẩm thực &amp; dịch vụ
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="font-display font-bold text-white uppercase tracking-wider text-[13px]">
            Hotline / Zalo tư vấn
          </div>
          <div className="space-y-2">
            {SITE_CONFIG.agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-[14px] text-white">
                    {agent.name}
                  </div>
                  <div className="text-[12px] text-white/65">{agent.role}</div>
                </div>
                <a
                  href={`tel:${agent.phone}`}
                  className="px-3 py-1.5 rounded-[10px] bg-[#0E7686] hover:bg-[#1391A4] text-white font-bold text-[13px] shrink-0"
                >
                  {agent.phoneDisplay}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap mt-8 pt-5 border-t border-white/10 text-[12px] text-white/55 flex flex-wrap items-center justify-between gap-2">
        <span>© 2026 {SITE_CONFIG.domain} · All rights reserved.</span>
        <span>Cập nhật quỹ căn: {SITE_CONFIG.updatedDate}</span>
      </div>
    </footer>
  );
}
