"use client";

import Link from "next/link";
import { Phone, MessageCircle, FileText, Home } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import { useContact } from "@/components/contact/ContactProvider";

export default function LienHeView() {
  const { openLeadModal, openSellModal } = useContact();
  const primary = SITE_CONFIG.agents[0];
  const secondary = SITE_CONFIG.agents[1];

  return (
    <div className="wrap py-8 space-y-8">
      <div className="text-[13px] text-[#557079]">
        <Link href="/" className="text-[#0E7686] hover:underline font-medium">
          Trang chủ
        </Link>{" "}
        / <span>Liên hệ</span>
      </div>

      {/* Hero contact */}
      <section className="bg-white rounded-[18px] border border-[#D6E2E5] p-6 sm:p-8 shadow-xs grid md:grid-cols-[160px_1fr] gap-6 items-center">
        <div className="w-[140px] h-[170px] sm:w-[160px] sm:h-[200px] rounded-[14px] bg-gradient-to-br from-[#0E7686] to-[#0D2A33] text-white flex flex-col items-center justify-center mx-auto md:mx-0 shadow-md">
          <span className="font-display font-extrabold text-[42px]">
            {primary.avatarInitials}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-white/80 mt-1">
            {SITE_CONFIG.brandName}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] uppercase text-gold-lo">
            LIÊN HỆ {primary.name}
          </h1>
          <p className="text-[15px] text-[#557079] max-w-[640px]">
            {primary.bio}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => openLeadModal()}
              className="px-5 py-3 rounded-[12px] btn-gold text-[14.5px] flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Nhận bảng hàng &amp; giá mới nhất
            </button>
            <button
              type="button"
              onClick={() => openSellModal("thap-tang")}
              className="px-5 py-3 rounded-[12px] bg-[#0D2A33] text-white font-bold text-[14.5px] flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Ký gửi bán căn
            </button>
          </div>
        </div>
      </section>

      {/* Contact boxes */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-[16px] border border-[#D6E2E5] p-6 space-y-4 shadow-xs">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[#557079]">
            Hotline / Zalo chính
          </div>
          <div className="font-display font-extrabold text-[30px] text-[#0E7686]">
            {primary.phoneDisplay}
          </div>
          <p className="text-[13.5px] text-[#557079]">
            {primary.name} · {primary.role}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${primary.phone}`}
              className="py-2.5 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              Gọi ngay
            </a>
            <a
              href={primary.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              Nhắn Zalo
            </a>
          </div>
        </div>

        {secondary && (
          <div className="bg-white rounded-[16px] border border-[#D6E2E5] p-6 space-y-4 shadow-xs">
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#557079]">
              Quản lý quỹ hàng &amp; Ký gửi
            </div>
            <div className="font-display font-extrabold text-[30px] text-[#0D2A33]">
              {secondary.phoneDisplay}
            </div>
            <p className="text-[13.5px] text-[#557079]">
              {secondary.name} · {secondary.role}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${secondary.phone}`}
                className="py-2.5 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                Gọi ngay
              </a>
              <a
                href={secondary.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Nhắn Zalo
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
