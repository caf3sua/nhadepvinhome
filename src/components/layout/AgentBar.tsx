"use client";

import { SITE_CONFIG } from "@/config/site";
import { useContact } from "@/components/contact/ContactProvider";

export function AgentBar() {
  const { openContactSheet } = useContact();

  return (
    <div className="bg-white border-b border-[#E6EEF0] py-2">
      <div className="wrap flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          {SITE_CONFIG.agents.map((agent, i) => (
            <a
              key={agent.id}
              href={`tel:${agent.phone}`}
              // Mobile chỉ hiện người đầu tiên; người thứ hai từ md trở lên
              className={`items-center gap-2.5 min-w-0 group ${
                i === 0 ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#0E7686] text-white font-display font-bold text-[13px] flex items-center justify-center border-2 border-[#0E7686]/25 shadow-xs">
                {agent.avatarInitials}
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-bold text-[13.5px] text-[#0D2A33] group-hover:text-[#0E7686] truncate">
                  {agent.name}
                </div>
                <div className="text-[11.5px] text-[#557079] truncate">
                  <span className="hidden sm:inline">{agent.role} · </span>
                  {agent.phoneDisplay}
                </div>
              </div>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={openContactSheet}
          className="shrink-0 px-4 py-2 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-semibold text-[13.5px] transition-colors cursor-pointer"
        >
          Liên hệ
        </button>
      </div>
    </div>
  );
}
