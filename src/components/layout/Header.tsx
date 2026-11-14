"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/quy-can", label: "Quỹ căn" },
  { href: "/ocean-park-2", label: "Ocean Park 2" },
  { href: "/ocean-park-3", label: "Ocean Park 3" },
  { href: "/#du-an", label: "Dự án" },
  { href: "/mau-thiet-ke", label: "Mẫu thiết kế" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6E2E5] shadow-[0_1px_6px_rgba(13,42,51,0.05)]">
      <div className="wrap h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display font-extrabold text-[20px] tracking-tight text-[#0D2A33]">
            nhadep<span className="text-[#0E7686]">vinhome</span>
          </span>
          <span className="hidden sm:inline lg:hidden xl:inline text-[10.5px] font-bold tracking-[0.14em] text-[#557079] uppercase">
            OCEAN PARK 2 · 3
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : !item.href.includes("#") && pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[13px] xl:text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#E2F2F4] text-[#0E7686]"
                    : "text-[#0D2A33] hover:bg-[#F2F6F7]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Mở menu"
          className="lg:hidden p-2 rounded-[10px] text-[#0D2A33] hover:bg-[#F2F6F7] cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-[#D6E2E5] bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : !item.href.includes("#") && pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3.5 py-2.5 rounded-[10px] text-[14px] font-semibold ${
                  isActive
                    ? "bg-[#E2F2F4] text-[#0E7686]"
                    : "text-[#0D2A33] hover:bg-[#F2F6F7]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
