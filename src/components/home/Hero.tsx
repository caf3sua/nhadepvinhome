"use client";

import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden text-white py-16 sm:py-24 min-h-[500px] sm:min-h-[580px] flex items-center">
      {/* Hero Banner Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-banner.jpg"
          alt="Vinhomes Ocean Park 2 & 3 Hero Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Balanced overlay that lets the vibrant resort lake & beach shine through while keeping text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071920]/65 via-[#071920]/45 to-[#0719201f]/80" />
      </div>

      {/* Decorative orbs & pins */}
      <div className="pointer-events-none absolute top-8 left-[12%] w-28 h-28 rounded-full bg-[#F3D58A]/15 blur-2xl hero-orb z-[1]" />
      <div className="pointer-events-none absolute bottom-10 right-[14%] w-36 h-36 rounded-full bg-[#4CC4D6]/15 blur-3xl hero-orb z-[1]" />
      <div className="pointer-events-none absolute top-1/3 left-[18%] w-2.5 h-2.5 rounded-full bg-[#D7263D] ring-4 ring-[#D7263D]/30 animate-pulse z-[1]" />
      <div className="pointer-events-none absolute bottom-1/3 right-[22%] w-2.5 h-2.5 rounded-full bg-[#E3A400] ring-4 ring-[#E3A400]/30 animate-pulse z-[1]" />

      <div className="wrap relative z-10 text-center max-w-[840px] mx-auto space-y-5">
        <div className="inline-block px-4 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-[14px] sm:text-[16px] font-display font-bold tracking-wide text-white/95 shadow-sm">
          {SITE_CONFIG.domain}
        </div>

        <h1 className="font-display font-extrabold uppercase tracking-[0.02em] leading-[1.08] text-[34px] sm:text-[50px] lg:text-[56px] drop-shadow-md">
          <span className="block text-[22px] sm:text-[30px] text-[#F3D58A] mb-1 drop-shadow">
            WEB QUỸ CĂN CHUYỂN NHƯỢNG
          </span>
          <span className="text-gold-hi drop-shadow-lg">OCEAN PARK 2-3</span>
        </h1>

        <p className="font-display italic font-semibold text-[18px] sm:text-[22px] text-white drop-shadow">
          Dễ hình dung nhất!
        </p>

        <p className="text-[14.5px] sm:text-[16.5px] text-white/90 max-w-[660px] mx-auto leading-relaxed drop-shadow">
          Xem từng căn ngay trên bản đồ tương tác: vị trí phân khu, diện tích, hướng, pháp lý, giá thu về hay bao phí. Thấp tầng &amp; chung cư chuyển nhượng cập nhật liên tục.
        </p>

        {/* 2 Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <span className="px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/30 text-[12px] sm:text-[13px] font-bold tracking-wider uppercase text-white shadow-sm">
            CHECK CĂN THUẬN TIỆN
          </span>
          <span className="px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/30 text-[12px] sm:text-[13px] font-bold tracking-wider uppercase text-white shadow-sm">
            GỬI BÁN DỄ DÀNG
          </span>
        </div>

        {/* 2 CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <a
            href="#ban-do"
            className="px-6 py-3.5 rounded-[14px] btn-gold text-[15px] sm:text-[16px] font-bold transition-transform hover:-translate-y-0.5 shadow-lg shadow-amber-900/30"
          >
            Xem bản đồ quỹ căn →
          </a>
          <Link
            href="/3d"
            className="px-6 py-3.5 rounded-[14px] bg-black/35 hover:bg-black/50 backdrop-blur-md border border-white/35 text-white font-semibold text-[15px] sm:text-[16px] transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Thiết kế 3D cho từng loại diện tích
          </Link>
        </div>
      </div>
    </section>
  );
}
