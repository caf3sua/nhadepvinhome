"use client";

import { useEffect, useState } from "react";
import { X, Bell } from "lucide-react";
import { UNITS } from "@/data/units";
import { formatPrice, isUnitHot } from "@/lib/format";
import { useContact } from "@/components/contact/ContactProvider";

const DISMISS_KEY = "toast-hot-dismissed";
const SHOW_AFTER_MS = 6000;
const AUTO_HIDE_MS = 15000;

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function saveDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // private mode / storage bị chặn: chỉ ẩn trong lần xem này
  }
}

export function ToastSuggestion() {
  const { openUnitDrawer } = useContact();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Không che bản đồ: ẩn toast khi khu #ban-do đang nằm trong khung nhìn
  const [mapInView, setMapInView] = useState(false);

  const featured = UNITS.find(isUnitHot) || UNITS[0];

  useEffect(() => {
    if (readDismissed()) {
      setDismissed(true);
      return;
    }
    const show = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    const hide = setTimeout(() => setVisible(false), SHOW_AFTER_MS + AUTO_HIDE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    const target = document.getElementById("ban-do");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setMapInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  if (!visible || dismissed || mapInView || !featured) return null;

  function dismiss() {
    saveDismissed();
    setDismissed(true);
  }

  return (
    <aside
      id="hp"
      className="fixed bottom-20 left-4 z-30 max-w-[290px] bg-white rounded-[14px] border border-[#D6E2E5] shadow-xl p-3 flex items-start gap-2.5 anim-fade-up"
    >
      <div className="w-8 h-8 rounded-full bg-[#FFF0E5] text-[#FF7A2F] flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4" />
      </div>
      <button
        type="button"
        onClick={() => openUnitDrawer(featured)}
        className="text-left flex-1 cursor-pointer"
      >
        <div className="text-[11px] font-bold text-[#D7263D] uppercase tracking-wider">
          Căn HOT hôm nay
        </div>
        <div className="text-[13px] font-bold text-[#0D2A33] leading-snug mt-0.5">
          {featured.code} · {featured.zoneName} ({featured.landArea} m²)
        </div>
        <div className="text-[12.5px] font-bold text-[#0E7686] mt-0.5">
          {formatPrice(featured.price)} · {featured.priceType} →
        </div>
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Đóng gợi ý"
        className="text-[#557079] hover:text-[#0D2A33] p-0.5 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}
