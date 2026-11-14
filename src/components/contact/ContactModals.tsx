"use client";

import React, { useEffect, useState } from "react";
import { X, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { useContact } from "./ContactProvider";
import { SITE_CONFIG } from "@/config/site";
import { ZONES } from "@/data/zones";

export function ContactModals() {
  const {
    contactOpen,
    closeContactSheet,
    leadOpen,
    leadPrefill,
    closeLeadModal,
    openLeadModal,
    sellOpen,
    sellCategory,
    closeSellModal,
  } = useContact();

  return (
    <>
      {contactOpen && (
        <ContactSheet
          onClose={closeContactSheet}
          onOpenLead={() => {
            closeContactSheet();
            openLeadModal();
          }}
        />
      )}
      {leadOpen && (
        <LeadModal initialNote={leadPrefill} onClose={closeLeadModal} />
      )}
      {sellOpen && (
        <SellModal defaultCategory={sellCategory} onClose={closeSellModal} />
      )}
    </>
  );
}

function ContactSheet({
  onClose,
  onOpenLead,
}: {
  onClose: () => void;
  onOpenLead: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-white rounded-[18px] p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[19px] text-[#0D2A33]">
              Chọn cách liên hệ
            </h3>
            <p className="text-[13px] text-[#557079]">
              Tư vấn trực tiếp quỹ căn Ocean Park 2 & 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F6F7] flex items-center justify-center text-[#0D2A33] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {SITE_CONFIG.agents.map((agent) => (
            <div
              key={agent.id}
              className="p-3.5 rounded-[14px] border border-[#D6E2E5] bg-[#F7FAFB] space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#0E7686] text-white font-display font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
                  {agent.avatarInitials}
                </div>
                <div>
                  <div className="font-bold text-[15px] text-[#0D2A33]">
                    {agent.name}
                  </div>
                  <div className="text-[12.5px] text-[#557079]">{agent.role}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${agent.phone}`}
                  className="py-2 rounded-[10px] bg-[#0E7686] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {agent.phoneDisplay}
                </a>
                <a
                  href={agent.zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 rounded-[10px] bg-[#0D2A33] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Nhắn Zalo
                </a>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenLead}
          className="w-full py-3 rounded-[12px] btn-gold text-[14px] cursor-pointer"
        >
          Để lại SĐT nhận bảng hàng qua Zalo
        </button>
      </div>
    </div>
  );
}

function LeadModal({
  initialNote,
  onClose,
}: {
  initialNote: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Thấp tầng OCP2-3");
  const [note, setNote] = useState(initialNote);
  const [honeypot, setHoneypot] = useState("");
  // NĐ 13/2023: sự đồng ý phải do người dùng chủ động tick, không tick sẵn
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const primaryAgent = SITE_CONFIG.agents[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Vui lòng xác nhận đồng ý để chuyên viên liên hệ tư vấn.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          interest,
          note,
          consent,
          page: window.location.pathname,
          web: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="ld-f"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-white rounded-[18px] p-5 shadow-2xl"
      >
        {done ? (
          <div id="ld-done" className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#0E7686] mx-auto" />
            <h3 className="font-display font-extrabold text-[20px] text-[#0D2A33]">
              Cảm ơn Quý khách!
            </h3>
            <p className="text-[14px] text-[#557079]">
              {primaryAgent.name} sẽ gửi bảng hàng cập nhật đúng nhu cầu qua Zalo{" "}
              <strong>{phone}</strong> trong ít phút. Cần gấp, Quý khách gọi{" "}
              <strong>{primaryAgent.phoneDisplay}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <a
                href={primaryAgent.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-[12px] bg-[#0E7686] text-white font-semibold text-[14px]"
              >
                Nhắn Zalo ngay
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 rounded-[12px] bg-[#F2F6F7] text-[#0D2A33] font-semibold text-[14px] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-extrabold text-[19px] text-[#0D2A33]">
                  Nhận bảng hàng & giá mới nhất
                </h3>
                <p className="text-[13px] text-[#557079] mt-0.5">
                  Quý khách để lại SĐT, chuyên viên gửi quỹ căn chuyển nhượng OCP2-3 đúng nhu cầu qua Zalo.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F2F6F7] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#0D2A33] mb-1">
                Họ tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Anh Nam"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[14px] outline-none focus:border-[#0E7686]"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#0D2A33] mb-1">
                Số điện thoại / Zalo *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[14px] outline-none focus:border-[#0E7686]"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#0D2A33] mb-1">
                Quan tâm
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[14px] outline-none focus:border-[#0E7686]"
              >
                <option value="Thấp tầng OCP2-3">Thấp tầng OCP2-3</option>
                <option value="Chung cư chuyển nhượng">Chung cư chuyển nhượng</option>
                <option value="Căn hộ mới Masteri / Lumière">Căn hộ mới Masteri / Lumière</option>
                <option value="Ký gửi bán căn">Ký gửi bán căn</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#0D2A33] mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tài chính, phân khu, diện tích..."
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[14px] outline-none focus:border-[#0E7686]"
              />
            </div>

            {/* Honeypot anti-spam */}
            <input
              type="text"
              name="web"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <label className="flex items-start gap-2 text-[12.5px] text-[#557079] cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[#0E7686]"
              />
              <span>
                Tôi đồng ý để {SITE_CONFIG.brandName} liên hệ tư vấn qua số điện thoại này.
              </span>
            </label>

            {error && (
              <div className="text-[13px] font-semibold text-[#D7263D]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[12px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[15px] cursor-pointer disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi số điện thoại"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-[13.5px] font-semibold text-[#557079] hover:text-[#0D2A33] cursor-pointer"
            >
              Để sau
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function SellModal({
  defaultCategory,
  onClose,
}: {
  defaultCategory: "chung-cu" | "thap-tang";
  onClose: () => void;
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [project, setProject] = useState<"ocp2" | "ocp3">("ocp2");
  const [zone, setZone] = useState("Chà Là");
  const [unitCode, setUnitCode] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("Nhà thô");
  const [legal, setLegal] = useState("Sổ đỏ");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("Thu về");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const zonesForProject = ZONES.filter((z) => z.project === project);
  const secondaryAgent = SITE_CONFIG.agents[1] || SITE_CONFIG.agents[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Vui lòng xác nhận đồng ý để chuyên viên liên hệ lại.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          project,
          zone,
          unitCode,
          area,
          status,
          legal,
          price,
          priceType,
          ownerName,
          phone,
          consent,
          web: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="gb-f"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white rounded-[18px] p-5 shadow-2xl"
      >
        {done ? (
          <div id="gb-done" className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#0E7686] mx-auto" />
            <h3 className="font-display font-extrabold text-[20px] text-[#0D2A33]">
              Đã tiếp nhận ký gửi!
            </h3>
            <p className="text-[14px] text-[#557079]">
              Quản lý quỹ hàng <strong>{secondaryAgent.name}</strong> sẽ liên hệ xác nhận thông tin căn{" "}
              <strong>{unitCode || zone}</strong> và định giá thị trường nhanh nhất.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-[12px] bg-[#0E7686] text-white font-semibold text-[14px] cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-extrabold text-[19px] text-[#0D2A33]">
                  Gửi bán căn nhanh
                </h3>
                <p className="text-[13px] text-[#557079]">
                  Tiếp cận trực tiếp khách mua thực tại Ocean Park 2 & 3
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F2F6F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-[12px] bg-[#F2F6F7]">
              <button
                type="button"
                onClick={() => setCategory("thap-tang")}
                className={`py-2 rounded-[9px] text-[13px] font-bold cursor-pointer ${
                  category === "thap-tang"
                    ? "bg-white text-[#0D2A33] shadow-xs"
                    : "text-[#557079]"
                }`}
              >
                🏡 Thấp tầng
              </button>
              <button
                type="button"
                onClick={() => setCategory("chung-cu")}
                className={`py-2 rounded-[9px] text-[13px] font-bold cursor-pointer ${
                  category === "chung-cu"
                    ? "bg-white text-[#0D2A33] shadow-xs"
                    : "text-[#557079]"
                }`}
              >
                🏢 Chung cư
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  Dự án *
                </label>
                <select
                  value={project}
                  onChange={(e) => {
                    const p = e.target.value as "ocp2" | "ocp3";
                    setProject(p);
                    const first = ZONES.find((z) => z.project === p);
                    if (first) setZone(first.name);
                  }}
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                >
                  <option value="ocp2">Ocean Park 2</option>
                  <option value="ocp3">Ocean Park 3</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  {category === "thap-tang" ? "Phân khu *" : "Tòa / Phân khu *"}
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                >
                  {zonesForProject.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                  <option value="Masteri / Lumière">Masteri / Lumière</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  Mã căn đầy đủ *
                </label>
                <input
                  type="text"
                  required
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  placeholder="VD: CL8-12 hoặc S2.1205"
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  Diện tích (m²)
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="VD: 80"
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[13px]">
              <div>
                <span className="block text-[12px] font-semibold mb-1">
                  Tình trạng
                </span>
                <div className="flex gap-3">
                  {["Nhà thô", "Hoàn thiện"].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={status === item}
                        onChange={() => setStatus(item)}
                        className="accent-[#0E7686]"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[12px] font-semibold mb-1">
                  Pháp lý
                </span>
                <div className="flex gap-3">
                  {["Sổ đỏ", "HĐMB"].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="legal"
                        checked={legal === item}
                        onChange={() => setLegal(item)}
                        className="accent-[#0E7686]"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  Giá mong muốn (tỷ)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 9.5"
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                />
              </div>
              <div className="flex gap-3 pb-2 text-[13px]">
                {["Thu về", "Bao phí"].map((item) => (
                  <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      checked={priceType === item}
                      onChange={() => setPriceType(item)}
                      className="accent-[#0E7686]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  Họ tên chủ nhà
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Anh / Chị..."
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1">
                  SĐT / Zalo *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3 py-2 rounded-[10px] bg-[#F2F6F7] border border-[#D6E2E5] text-[13.5px]"
                />
              </div>
            </div>

            <input
              type="text"
              name="web"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <label className="flex items-start gap-2 text-[12.5px] text-[#557079] cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[#0E7686]"
              />
              <span>
                Tôi đồng ý để {SITE_CONFIG.brandName} liên hệ qua số điện thoại này để tư vấn ký gửi.
              </span>
            </label>

            {error && (
              <div className="text-[13px] font-semibold text-[#D7263D]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[12px] bg-[#0D2A33] hover:bg-[#173E4B] text-white font-bold text-[15px] cursor-pointer disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi thông tin căn"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
