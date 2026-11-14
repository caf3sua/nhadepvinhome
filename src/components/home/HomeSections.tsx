"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { FEATURED_PROJECTS, PROJECT_DETAILS } from "@/data/projects";
import { UNITS } from "@/data/units";
import { APARTMENTS } from "@/data/apartments";
import { ZONES } from "@/data/zones";
import { isUnitHot } from "@/lib/format";
import { UnitCard } from "@/components/ui/UnitCard";
import { SITE_CONFIG } from "@/config/site";
import { useContact } from "@/components/contact/ContactProvider";

export function BigButtons() {
  return (
    <section className="wrap pt-6 grid sm:grid-cols-2 gap-3.5">
      <Link
        href="/ve-tinh"
        className="p-4 rounded-[16px] bg-white border border-[#D6E2E5] hover:border-[#0E7686] shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
      >
        <span className="text-[28px] shrink-0">🛰️</span>
        <div className="flex-1">
          <div className="font-display font-extrabold text-[16px] text-[#0D2A33] group-hover:text-[#0E7686]">
            Quỹ căn trên bản đồ vệ tinh
          </div>
          <div className="text-[13px] text-[#557079]">
            Xem vị trí thực tế, hạ tầng giao thông &amp; giá từng căn toàn màn hình
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#0E7686]" />
      </Link>

      <Link
        href="/am-thuc"
        className="p-4 rounded-[16px] bg-white border border-[#D6E2E5] hover:border-[#0E7686] shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
      >
        <span className="text-[28px] shrink-0">🍜</span>
        <div className="flex-1">
          <div className="font-display font-extrabold text-[16px] text-[#0D2A33] group-hover:text-[#0E7686]">
            Bản đồ ẩm thực &amp; dịch vụ
          </div>
          <div className="text-[13px] text-[#557079]">
            Quán ăn ngon, cafe tiếp khách &amp; đầu mối BQL tại Ocean Park 2-3
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#0E7686]" />
      </Link>
    </section>
  );
}

export function ProjectsGrid() {
  return (
    <section id="du-an" className="wrap pt-14 space-y-6 scroll-mt-16">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] uppercase text-gold-lo">
            DỰ ÁN ĐANG PHÂN PHỐI
          </h2>
          <p className="text-[14.5px] text-[#557079]">
            Chọn dự án để xem quỹ căn: thấp tầng Ocean Park 2 &amp; 3, căn hộ mới và chung cư chuyển nhượng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {FEATURED_PROJECTS.map((proj) => {
          return (
            <Link
              key={proj.id}
              href={proj.href}
              className="bg-white rounded-[18px] border border-[#D6E2E5]/80 hover:border-[#0E7686] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group shadow-xs"
            >
              {proj.image && (
                <div className="relative w-full aspect-[16/9.2] overflow-hidden bg-slate-100">
                  <Image
                    src={proj.image}
                    alt={proj.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-[16px] sm:text-[17px] xl:text-[18px] uppercase text-[#0D2A33] group-hover:text-[#0E7686] transition-colors leading-snug">
                    {proj.name}
                  </h3>
                  <div className="flex items-start gap-2 text-[13px] sm:text-[13.5px] text-[#557079]">
                    <span className="shrink-0 text-[14px]">📍</span>
                    <span>{proj.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[13px] sm:text-[13.5px] text-[#557079] leading-relaxed">
                    <span className="shrink-0 text-[14px]">🏡</span>
                    <span>{proj.summary}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[13.5px] font-bold text-[#0E7686] group-hover:text-[#0A5B68] transition-colors inline-flex items-center gap-1">
                    {proj.ctaLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function IntroSection() {
  const { openContactSheet } = useContact();
  const primary = SITE_CONFIG.agents[0];

  return (
    <section className="wrap pt-14">
      <div
        className="rounded-[18px] p-6 sm:p-10 text-white grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center shadow-xl"
        style={{
          background:
            "radial-gradient(circle at 85% 20%, rgba(255,122,47,0.2), transparent 45%), linear-gradient(135deg, #091E26 0%, #0D2A33 65%, #123D4A 100%)",
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-[2px] bg-[#FF7A2F]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF7A2F]">
              CHUYÊN VIÊN TƯ VẤN TRỰC TIẾP
            </span>
          </div>

          <h2 className="font-display font-extrabold text-[28px] sm:text-[42px] leading-[1.12]">
            Xin chào, tôi là{" "}
            <span className="text-[#FF7A2F]">{primary.name}</span>
          </h2>

          <blockquote className="p-4 rounded-[12px] bg-white/8 border border-white/15 text-[14.5px] text-white/90 leading-relaxed">
            “{primary.bio}”
          </blockquote>

          <ul className="grid sm:grid-cols-2 gap-2.5 text-[14px] text-white/90">
            {[
              "Thông tin thật, giá thu về / bao phí minh bạch",
              "So sánh trực tiếp từng phân khu & hướng nắng",
              "Hỗ trợ kiểm tra sổ đỏ, HĐMB & vay ngân hàng",
              "Dẫn xem thực tế 7/7 ngày tại Ocean Park 2-3",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#FF7A2F] shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={openContactSheet}
              className="px-5 py-3 rounded-[12px] bg-[#FF7A2F] hover:bg-[#EA6A21] text-white font-bold text-[14.5px] cursor-pointer"
            >
              Liên hệ tư vấn ngay
            </button>
            <a
              href={`tel:${primary.phone}`}
              className="px-5 py-3 rounded-[12px] border border-white/35 hover:bg-white/10 text-white font-semibold text-[14.5px] flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Gọi {primary.phoneDisplay}
            </a>
          </div>
        </div>

        {/* ID Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-[290px] bg-white text-[#0D2A33] rounded-[18px] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] border border-white/20 text-center space-y-3">
            <div className="w-12 h-1.5 rounded-full bg-[#D6E2E5] mx-auto" />
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#0E7686] uppercase">
              {SITE_CONFIG.brandName} · ID CARD
            </div>
            <div className="w-24 h-24 rounded-full bg-[#0E7686] text-white font-display font-extrabold text-[28px] flex items-center justify-center mx-auto border-4 border-[#E2F2F4]">
              {primary.avatarInitials}
            </div>
            <div>
              <div className="font-display font-extrabold text-[20px]">
                {primary.name}
              </div>
              <div className="text-[13px] text-[#557079]">{primary.role}</div>
            </div>
            <div className="pt-2 border-t border-[#E6EEF0] flex items-center justify-center gap-2 text-[15px] font-extrabold text-[#0E7686]">
              <Phone className="w-4 h-4" />
              {primary.phoneDisplay}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LifeStrip() {
  const items = [
    {
      title: "Grand World – phố Venice về đêm",
      image: "/images/life/grand-world-venice.jpg",
      href: "/ocean-park-3",
    },
    {
      title: "Show thực cảnh tại Grand World",
      image: "/images/life/show-thuc-canh.jpg",
      href: "/ocean-park-3",
    },
    {
      title: "Biển hồ nước mặn",
      image: "/images/life/bien-ho-nuoc-man.jpg",
      href: "/ocean-park-2",
    },
    {
      title: "Bãi biển cát trắng ngay trong khu đô thị",
      image: "/images/life/bai-bien-cat-trang.jpg",
      href: "/ocean-park-2",
    },
  ];

  return (
    <section id="song-o-ocean-park" className="wrap pt-14 space-y-4 scroll-mt-16">
      <div>
        <h2 className="font-display font-extrabold text-[26px] sm:text-[34px] uppercase text-gold-lo">
          SỐNG Ở OCEAN PARK 2 · 3
        </h2>
        <p className="text-[14.5px] text-[#557079]">
          Hệ tiện ích nghỉ dưỡng biển ngay thềm nhà
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="relative aspect-[16/10.5] sm:aspect-[16/10] rounded-[16px] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group block"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient at bottom for high legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
            {/* Overlay Text */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 pointer-events-none">
              <h3 className="font-bold text-white text-[13px] sm:text-[14.5px] leading-snug drop-shadow-md">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HotUnitsSection() {
  const hotUnits = UNITS.filter(isUnitHot).slice(0, 6);

  return (
    <section className="wrap pt-14 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display font-extrabold text-[26px] sm:text-[34px] uppercase text-gold-lo">
            CĂN HOT DƯỚI {SITE_CONFIG.hotPricePerM2Threshold}TR/M²
          </h2>
          <p className="text-[14.5px] text-[#557079]">
            Những căn có đơn giá đất tốt nhất thị trường chuyển nhượng hiện tại
          </p>
        </div>
        <Link
          href="/quy-can"
          className="text-[14px] font-bold text-[#0E7686] hover:underline"
        >
          Xem tất cả quỹ căn →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </section>
  );
}

export function ApartmentTableSection() {
  const { openLeadModal } = useContact();

  return (
    <section id="chung-cu" className="wrap pt-14 space-y-4 scroll-mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-[26px] sm:text-[34px] uppercase text-gold-lo">
            CHUNG CƯ CHUYỂN NHƯỢNG
          </h2>
          <p className="text-[14.5px] text-[#557079]">
            Quỹ căn Masteri Trinity Square, Lumière Springbay, Masteri Grand Coast, The Parkland
          </p>
        </div>
        <button
          type="button"
          onClick={() => openLeadModal("Quan tâm quỹ căn chung cư Ocean Park 2-3")}
          className="px-4 py-2.5 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[13.5px] flex items-center gap-1.5 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          Liên hệ nhận thông tin căn
        </button>
      </div>

      <div className="bg-white rounded-[14px] border border-[#D6E2E5] overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse min-w-[720px] text-[13.5px]">
          <thead>
            <tr className="bg-[#F2F6F7] text-[#557079] text-[12px] uppercase tracking-wider border-b border-[#D6E2E5]">
              <th className="py-3 px-4 font-bold">Dự án / Tòa</th>
              <th className="py-3 px-3 font-bold">Mã căn</th>
              <th className="py-3 px-3 font-bold">Loại</th>
              <th className="py-3 px-3 font-bold">DT</th>
              <th className="py-3 px-3 font-bold">Hướng</th>
              <th className="py-3 px-3 font-bold">View</th>
              <th className="py-3 px-3 font-bold">Ưu đãi</th>
              <th className="py-3 px-4 font-bold text-right">Giá bán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EEF0]">
            {APARTMENTS.map((apt) => (
              <tr
                key={apt.id}
                onClick={() =>
                  openLeadModal(
                    `Hỏi thông tin căn hộ ${apt.code} (${apt.projectName} · ${apt.building}, ${apt.price} tỷ)`
                  )
                }
                className="hover:bg-[#F7FAFB] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-bold text-[#0D2A33]">{apt.projectName}</div>
                  <div className="text-[12px] text-[#557079]">{apt.building}</div>
                </td>
                <td className="py-3 px-3 font-bold text-[#0E7686]">{apt.code}</td>
                <td className="py-3 px-3 font-semibold">{apt.type}</td>
                <td className="py-3 px-3">{apt.area} m²</td>
                <td className="py-3 px-3">{apt.direction}</td>
                <td className="py-3 px-3 text-[#557079]">{apt.view}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#FFF0E5] text-[#FF7A2F] text-[11.5px] font-bold">
                    {apt.discount}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-display font-extrabold text-[15px] text-[#0E7686]">
                    {apt.price.toFixed(2).replace(".", ",")} tỷ
                  </div>
                  <div className="text-[11px] text-[#557079]">{apt.priceType}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TwoProjectsSection() {
  const ocp2Zones = ZONES.filter((z) => z.project === "ocp2");
  const ocp3Zones = ZONES.filter((z) => z.project === "ocp3");

  return (
    <section className="wrap pt-14 space-y-5">
      <h2 className="font-display font-extrabold text-[26px] sm:text-[34px] uppercase text-gold-lo">
        HAI ĐẠI DỰ ÁN CHUYÊN SÂU
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        {[
          {
            detail: PROJECT_DETAILS.ocp2,
            zones: ocp2Zones,
            href: "/ocean-park-2",
            count: UNITS.filter((u) => u.project === "ocp2").length,
          },
          {
            detail: PROJECT_DETAILS.ocp3,
            zones: ocp3Zones,
            href: "/ocean-park-3",
            count: UNITS.filter((u) => u.project === "ocp3").length,
          },
        ].map(({ detail, zones, href, count }) => (
          <div
            key={detail.slug}
            className="bg-white rounded-[16px] border border-[#D6E2E5] p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-[7px] bg-[#E2F2F4] text-[#0E7686] text-[11px] font-extrabold tracking-wider">
                  {detail.subtitle}
                </span>
                <span className="text-[12.5px] font-bold text-[#557079]">
                  {count} căn đang chào bán
                </span>
              </div>
              <h3 className="font-display font-extrabold text-[22px] text-[#0D2A33]">
                {detail.title}
              </h3>
              <p className="text-[13.5px] text-[#557079]">{detail.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-[10px] bg-[#F2F6F7]">
                  <div className="text-[11px] text-[#557079]">Quy mô</div>
                  <div className="font-bold text-[14px]">{detail.scale}</div>
                </div>
                <div className="p-2.5 rounded-[10px] bg-[#F2F6F7]">
                  <div className="text-[11px] text-[#557079]">Khởi công</div>
                  <div className="font-bold text-[14px]">{detail.launchDate}</div>
                </div>
                <div className="p-2.5 rounded-[10px] bg-[#F2F6F7]">
                  <div className="text-[11px] text-[#557079]">Phân khu</div>
                  <div className="font-bold text-[14px]">{zones.length} phân khu</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {zones.map((z) => (
                  <span
                    key={z.id}
                    className="px-2.5 py-1 rounded-full bg-[#F7FAFB] border border-[#D6E2E5] text-[12px] font-semibold text-[#0D2A33]"
                  >
                    {z.name}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={href}
              className="w-full py-3 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[14px] text-center"
            >
              Xem chi tiết &amp; quỹ căn {detail.subtitle} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
