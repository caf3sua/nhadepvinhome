"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden text-white py-14 sm:py-20"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(14,118,134,0.65), transparent 45%), radial-gradient(circle at 80% 30%, rgba(227,164,0,0.28), transparent 40%), linear-gradient(135deg, #071920 0%, #0D2A33 48%, #0E5866 100%)",
      }}
    >
      {/* Decorative orbs & pins */}
      <div className="pointer-events-none absolute top-8 left-[12%] w-24 h-24 rounded-full bg-[#F3D58A]/20 blur-xl hero-orb" />
      <div className="pointer-events-none absolute bottom-10 right-[14%] w-32 h-32 rounded-full bg-[#4CC4D6]/20 blur-2xl hero-orb" />
      <div className="pointer-events-none absolute top-1/3 left-[18%] w-2.5 h-2.5 rounded-full bg-[#D7263D] ring-4 ring-[#D7263D]/30 animate-pulse" />
      <div className="pointer-events-none absolute bottom-1/3 right-[22%] w-2.5 h-2.5 rounded-full bg-[#E3A400] ring-4 ring-[#E3A400]/30 animate-pulse" />

      <div className="wrap relative z-10 text-center max-w-[820px] mx-auto space-y-5">
        <div className="inline-block text-[15px] sm:text-[17px] font-display font-bold tracking-wide text-white/90">
          {SITE_CONFIG.domain}
        </div>

        <h1 className="font-display font-extrabold uppercase tracking-[0.02em] leading-[1.08] text-[34px] sm:text-[50px] lg:text-[56px]">
          <span className="block text-[22px] sm:text-[30px] text-[#F3D58A] mb-1">
            WEB QUỸ CĂN CHUYỂN NHƯỢNG
          </span>
          <span className="text-gold-hi">OCEAN PARK 2-3</span>
        </h1>

        <p className="font-display italic font-semibold text-[18px] sm:text-[22px] text-white/95">
          Dễ hình dung nhất!
        </p>

        <p className="text-[14.5px] sm:text-[16px] text-white/80 max-w-[650px] mx-auto leading-relaxed">
          Xem từng căn ngay trên bản đồ tương tác: vị trí phân khu, diện tích, hướng, pháp lý, giá thu về hay bao phí. Thấp tầng &amp; chung cư chuyển nhượng cập nhật liên tục.
        </p>

        {/* 2 Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <span className="px-4 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/25 text-[12px] sm:text-[13px] font-bold tracking-wider uppercase">
            CHECK CĂN THUẬN TIỆN
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/25 text-[12px] sm:text-[13px] font-bold tracking-wider uppercase">
            GỬI BÁN DỄ DÀNG
          </span>
        </div>

        {/* 2 CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <a
            href="#ban-do"
            className="px-6 py-3.5 rounded-[14px] btn-gold text-[15px] sm:text-[16px] transition-transform hover:-translate-y-0.5"
          >
            Xem bản đồ quỹ căn →
          </a>
          <Link
            href="/3d"
            className="px-6 py-3.5 rounded-[14px] bg-white/10 hover:bg-white/18 border border-white/35 text-white font-semibold text-[15px] sm:text-[16px] transition-colors"
          >
            Thiết kế 3D cho từng loại diện tích
          </Link>
        </div>
      </div>
    </section>
  );
}
