"use client";

import { Phone } from "lucide-react";
import { useContact } from "@/components/contact/ContactProvider";
import { SITE_CONFIG } from "@/config/site";

export function StickyCta() {
  const { openSellModal } = useContact();
  const primary = SITE_CONFIG.agents[0];

  return (
    <>
      {/* Floating quick call button */}
      <a
        href={`tel:${primary.phone}`}
        aria-label="Gọi tư vấn nhanh"
        className="fixed bottom-16 right-4 z-30 w-12 h-12 rounded-full bg-[#0E7686] hover:bg-[#0A5B68] text-white shadow-lg flex items-center justify-center border-2 border-white transition-transform hover:scale-105"
      >
        <Phone className="w-5 h-5" />
      </a>

      {/* Bottom fixed bar (#gbar) */}
      <nav
        id="gbar"
        className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#D6E2E5] py-2 px-3"
      >
        <div className="max-w-[560px] mx-auto grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => openSellModal("chung-cu")}
            className="py-2.5 px-3 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[13.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🏢</span>
            <span>Gửi bán chung cư</span>
          </button>
          <button
            type="button"
            onClick={() => openSellModal("thap-tang")}
            className="py-2.5 px-3 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-bold text-[13.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🏡</span>
            <span>Gửi bán thấp tầng</span>
          </button>
        </div>
      </nav>
    </>
  );
}
