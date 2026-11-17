"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Maximize2, Minimize2, Plus, Minus, Expand, X } from "lucide-react";
import { Apartment, ProjectSlug, Unit } from "@/types/property";
import { ZONES } from "@/data/zones";
import {
  APARTMENT_ANCHORS,
  METRO_STATIONS,
  PLAN_IMAGE,
  PLAN_VIEWS,
  PlanPoint,
  ZONE_ANCHORS,
} from "@/data/plan";
import { isUnitHot } from "@/lib/format";
import { useContact } from "@/components/contact/ContactProvider";
import { SITE_CONFIG } from "@/config/site";

/** Yêu cầu bay tới phân khu / dự án chung cư (từ hàng chip bên ngoài). */
export interface PlanFocus {
  kind: "zone" | "apt";
  id: string;
  /** Tăng mỗi lần bấm để bấm lại cùng một chip vẫn bay tới. */
  nonce: number;
}

interface PlanMapClientProps {
  units: Unit[];
  apartments: Apartment[];
  view: "all" | ProjectSlug;
  focus: PlanFocus | null;
}

type Panel = { kind: "zone"; id: string } | { kind: "apt"; id: string } | null;

const W = PLAN_IMAGE.width;
const H = PLAN_IMAGE.height;

/** Toạ độ tương đối trên ảnh → LatLng của CRS.Simple (1 đơn vị = 1px ảnh ở zoom 0). */
const toLatLng = ([x, y]: PlanPoint) => L.latLng(-y * H, x * W);
const toPoint = (ll: L.LatLng): PlanPoint => [ll.lng / W, -ll.lat / H];
const boxBounds = ([x1, y1, x2, y2]: [number, number, number, number]) =>
  L.latLngBounds(toLatLng([x1, y2]), toLatLng([x2, y1]));

const fmtTy = (v: number) =>
  v.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
const isBP = (u: { priceType: string }) => u.priceType === "Bao phí";
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Căn không có toạ độ mặt bằng riêng → xếp thành lưới quanh tâm phân khu
 * (ghim minh hoạ đúng phân khu, không phải vị trí lô thật).
 */
function layoutUnits(units: Unit[]): Map<string, PlanPoint> {
  const pos = new Map<string, PlanPoint>();
  const byZone = new Map<string, Unit[]>();
  units.forEach((u) => {
    if (u.plan) pos.set(u.id, u.plan);
    else byZone.set(u.zoneId, [...(byZone.get(u.zoneId) ?? []), u]);
  });
  // Khoảng cách cột/hàng theo tỉ lệ bề ngang ảnh → không phụ thuộc độ phân giải ảnh
  const DX = 0.04;
  const DY = (0.02 * W) / H;
  byZone.forEach((list, zoneId) => {
    const anchor = ZONE_ANCHORS[zoneId];
    if (!anchor) return;
    const sorted = [...list].sort((a, b) => a.price - b.price);
    const cols = Math.ceil(Math.sqrt(sorted.length));
    const rows = Math.ceil(sorted.length / cols);
    sorted.forEach((u, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      pos.set(u.id, [
        anchor[0] + (c - (cols - 1) / 2) * DX,
        anchor[1] + (r - (rows - 1) / 2) * DY + DY / 2,
      ]);
    });
  });
  return pos;
}

export function PlanMapClient({ units, apartments, view, focus }: PlanMapClientProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const farRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coord, setCoord] = useState<string | null>(null);

  const { openUnitDrawer, openLeadModal } = useContact();

  const positions = useMemo(() => layoutUnits(units), [units]);

  const aptGroups = useMemo(() => {
    const g = new Map<string, Apartment[]>();
    apartments.forEach((a) => {
      if (!APARTMENT_ANCHORS[a.projectKey]) return;
      g.set(a.projectKey, [...(g.get(a.projectKey) ?? []), a]);
    });
    return g;
  }, [apartments]);

  const fitView = (v: "all" | ProjectSlug, animate = true) => {
    const map = mapRef.current;
    if (!map) return;
    const b = boxBounds(PLAN_VIEWS[v]);
    // Không thu nhỏ quá mức "ảnh phủ kín khung" → không lộ khoảng trống
    const cover = map.getBoundsZoom(boxBounds(PLAN_VIEWS.all), true);
    map.setView(b.getCenter(), Math.max(map.getBoundsZoom(b, false), cover), { animate });
  };

  const flyTo = (point: PlanPoint, extra = 0.5) => {
    const map = mapRef.current;
    if (!map) return;
    const z = Math.max(farRef.current + extra, map.getZoom());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView(toLatLng(point), z);
    else map.flyTo(toLatLng(point), z, { duration: 0.6 });
  };

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      crs: L.CRS.Simple,
      zoomControl: false,
      attributionControl: false,
      // Không làm tròn mức zoom → ảnh vừa khít khung, không bị cắt dư
      zoomSnap: 0,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      // zoom 0 = đúng 1 px ảnh; cho phóng tối đa gấp đôi ảnh gốc
      minZoom: -6,
      maxZoom: 1,
      bounceAtZoomLimits: false,
    });
    mapRef.current = map;

    const all = boxBounds(PLAN_VIEWS.all);
    L.imageOverlay(PLAN_IMAGE.src, all, {
      interactive: false,
      alt: "Tổng mặt bằng Vinhomes Ocean Park 2 và 3",
    }).addTo(map);
    map.setMaxBounds(all);
    map.options.maxBoundsViscosity = 1;

    map.createPane("metro").style.zIndex = "650";
    layerRef.current = L.layerGroup().addTo(map);

    // Ngưỡng "zoom xa": nhỏ hơn mức này chỉ hiện bong bóng số căn theo phân khu
    const syncZoom = () => {
      // Mức thu nhỏ tối đa = ảnh vừa phủ kín khung (giống ocean23), không còn viền trống
      map.setMinZoom(map.getBoundsZoom(all, true));
      farRef.current = map.getBoundsZoom(boxBounds(PLAN_VIEWS.ocp3), false) + 0.9;
      el.classList.toggle("pfar", map.getZoom() < farRef.current);
    };
    map.on("zoomend", syncZoom);

    map.setView(all.getCenter(), map.getBoundsZoom(all, true), { animate: false });
    syncZoom();

    // Khung bản đồ đổi kích thước (điện thoại, toàn màn hình) → đo lại
    const ro = new ResizeObserver(() => {
      map.invalidateSize(false);
      syncZoom();
    });
    ro.observe(el);

    METRO_STATIONS.forEach((st) => {
      L.marker(toLatLng(st.point), {
        pane: "metro",
        title: st.name,
        icon: L.divIcon({
          className: "pmwrap",
          iconSize: [0, 0],
          html: `<div class="pmetro"><i>🚇</i><b>${esc(st.name)}</b></div>`,
        }),
      })
        .bindPopup(`<b>${esc(st.name)}</b><br>Tuyến metro 8B · quy hoạch tham khảo, vị trí ga có thể thay đổi`)
        .addTo(map);
    });

    // ?toado=1 → bấm lên bản đồ để lấy toạ độ tương đối khi nhập vị trí căn
    if (new URLSearchParams(window.location.search).has("toado")) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const [x, y] = toPoint(e.latlng);
        setCoord(`[${x.toFixed(4)}, ${y.toFixed(4)}]`);
      });
    }

    setReady(true);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Vẽ ghim: phân khu (zoom xa), giá từng căn (zoom gần), chung cư
  useEffect(() => {
    const layer = layerRef.current;
    if (!ready || !layer) return;
    layer.clearLayers();

    const byZone = new Map<string, Unit[]>();
    units.forEach((u) => byZone.set(u.zoneId, [...(byZone.get(u.zoneId) ?? []), u]));

    byZone.forEach((list, zoneId) => {
      const anchor = ZONE_ANCHORS[zoneId];
      if (!anchor) return;
      const zone = ZONES.find((z) => z.id === zoneId);
      const hot = list.some(isUnitHot);
      L.marker(toLatLng(anchor), {
        title: zone?.name ?? zoneId,
        zIndexOffset: list.length,
        icon: L.divIcon({
          className: "pwrap pzwrap",
          iconSize: [0, 0],
          html: `<div class="ppin pzone ${hot ? "hot" : "live"}"><i>${list.length}</i></div>`,
        }),
      })
        .on("click", () => {
          setPanel({ kind: "zone", id: zoneId });
          flyTo(anchor, 0.4);
        })
        .addTo(layer);
    });

    units.forEach((u) => {
      const p = positions.get(u.id);
      if (!p) return;
      const hot = isUnitHot(u);
      const sel = selectedId === u.id;
      const sub = [`${u.landArea.toLocaleString("vi-VN")}m²`, u.status === "Nhà thô" ? "Thô" : "HT"];
      L.marker(toLatLng(p), {
        title: u.code,
        zIndexOffset: sel ? 3000 : hot ? 900 : 500,
        icon: L.divIcon({
          className: "pwrap puwrap",
          iconSize: [0, 0],
          html: `<div class="ppin ${hot ? "hot" : "live"}${sel ? " sel" : ""}"><b${isBP(u) ? ' class="bp"' : ""}>${fmtTy(u.price)}${isBP(u) ? "<em>BP</em>" : ""}</b><small>${sub.join(" · ")}</small></div>`,
        }),
      })
        .on("click", () => {
          setSelectedId(u.id);
          openUnitDrawer(u);
        })
        .addTo(layer);
    });

    aptGroups.forEach((list, key) => {
      const a = APARTMENT_ANCHORS[key];
      const min = Math.min(...list.map((x) => x.price));
      const open = () => {
        setPanel({ kind: "apt", id: key });
        flyTo(a.point, 0.9);
      };
      L.marker(toLatLng(a.point), {
        title: list[0].projectName,
        zIndexOffset: list.length,
        icon: L.divIcon({
          className: "pwrap pafar",
          iconSize: [0, 0],
          html: `<div class="ppin pzone apt"><i>${list.length}</i></div>`,
        }),
      })
        .on("click", open)
        .addTo(layer);
      L.marker(toLatLng(a.point), {
        title: list[0].projectName,
        zIndexOffset: 600,
        icon: L.divIcon({
          className: "pwrap pawrap",
          iconSize: [0, 0],
          html: `<div class="ppin apt"><b>${esc(a.short)} · ${list.length} căn</b><small>chuyển nhượng · từ ${fmtTy(min)}</small></div>`,
        }),
      })
        .on("click", open)
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, units, positions, aptGroups, selectedId, openUnitDrawer]);

  // Lọc theo dự án → khung nhìn tương ứng
  useEffect(() => {
    if (ready) fitView(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, ready]);

  // Bấm chip phân khu / chung cư bên ngoài
  useEffect(() => {
    if (!ready || !focus) return;
    const point =
      focus.kind === "zone" ? ZONE_ANCHORS[focus.id] : APARTMENT_ANCHORS[focus.id]?.point;
    if (!point) return;
    setPanel({ kind: focus.kind, id: focus.id });
    flyTo(point, focus.kind === "apt" ? 0.9 : 0.5);
    wrapRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, ready]);

  // Esc để thoát toàn màn hình
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const panelZoneUnits =
    panel?.kind === "zone"
      ? units.filter((u) => u.zoneId === panel.id).sort((a, b) => a.price - b.price)
      : [];
  const panelZone = panel?.kind === "zone" ? ZONES.find((z) => z.id === panel.id) : undefined;
  const panelApts =
    panel?.kind === "apt" ? [...(aptGroups.get(panel.id) ?? [])].sort((a, b) => a.price - b.price) : [];

  const ctrlBtn =
    "w-9 h-9 flex items-center justify-center bg-white border border-[#D6E2E5] text-[#0D2A33] hover:bg-[#F2F6F7] cursor-pointer";

  return (
    <div
      ref={wrapRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[45] isolate bg-[#EEF2EE]"
          : // Điện thoại: khung cao cố định (kéo ngang để xem); màn rộng: khung theo tỉ lệ ảnh
            "relative isolate w-full h-[clamp(440px,72vh,760px)] sm:h-auto sm:aspect-(--plan-ar) sm:max-h-[82vh] rounded-[16px] overflow-hidden border border-[#D6E2E5] shadow-md bg-[#EEF2EE]"
      }
      style={{ "--plan-ar": `${W} / ${H}` } as React.CSSProperties}
    >
      <div
        ref={containerRef}
        className="plan-map w-full h-full"
        aria-label="Mặt bằng quỹ căn Ocean Park 2 và 3"
      />

      {/* Chú thích */}
      <div className="absolute top-2.5 left-2.5 right-[60px] z-[1000] flex flex-wrap gap-1.5 pointer-events-none">
        {[
          { c: "bg-[#D7263D]", t: `HOT <${SITE_CONFIG.hotPricePerM2Threshold} tr/m²` },
          { c: "bg-[#0E7686]", t: "Đang bán" },
          { c: "bg-[#FFE27A] border border-[#C9A400]", t: "BP = giá bao phí" },
          { c: "bg-[#6E45C9]", t: "Chung cư chuyển nhượng" },
          { c: "bg-[#1E9E5A]", t: "Ga metro 8B (quy hoạch)" },
        ].map((l) => (
          <span
            key={l.t}
            className="bg-white/95 border border-[#D6E2E5] rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold text-[#0D2A33] flex items-center gap-1.5 shadow-xs"
          >
            <i className={`w-2.5 h-2.5 rounded-full ${l.c}`} />
            {l.t}
          </span>
        ))}
      </div>

      {/* Phóng to / thu nhỏ / xem toàn bộ / toàn màn hình */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex flex-col gap-2 items-end">
        <div className="flex flex-col rounded-[10px] overflow-hidden shadow-sm [&>button+button]:border-t-0">
          <button type="button" aria-label="Phóng to" className={ctrlBtn} onClick={() => mapRef.current?.zoomIn(0.75)}>
            <Plus className="w-4 h-4" />
          </button>
          <button type="button" aria-label="Thu nhỏ" className={ctrlBtn} onClick={() => mapRef.current?.zoomOut(0.75)}>
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" aria-label="Xem toàn bộ" className={ctrlBtn} onClick={() => fitView(view)}>
            <Expand className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          aria-label={isFullscreen ? "Thoát toàn màn hình" : "Xem bản đồ toàn màn hình"}
          onClick={() => setIsFullscreen((f) => !f)}
          className={`${ctrlBtn} rounded-[10px] shadow-sm`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Danh sách căn của phân khu / dự án chung cư đang chọn */}
      {panel && (
        <div className="absolute left-2.5 bottom-2.5 z-[1000] w-[calc(100%-20px)] max-w-[380px] max-h-[calc(100%-72px)] flex flex-col bg-white border border-[#D6E2E5] rounded-[14px] shadow-[0_10px_30px_rgba(6,30,36,0.22)]">
          <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2 border-b border-[#E6EEF0]">
            <div>
              <div className="font-display font-extrabold text-[17px] text-[#0D2A33] leading-tight">
                {panel.kind === "zone" ? panelZone?.name : panelApts[0]?.projectName}
              </div>
              <div className="text-[12.5px] text-[#557079]">
                {panel.kind === "zone"
                  ? `${panelZone?.project === "ocp3" ? "Vinhomes Ocean Park 3" : "Vinhomes Ocean Park 2"} · ${panelZoneUnits.length} căn${panelZoneUnits.length ? ` · từ ${fmtTy(panelZoneUnits[0].price)}` : ""}`
                  : `Chung cư chuyển nhượng · ${panelApts.length} căn${panelApts.length ? ` · từ ${fmtTy(panelApts[0].price)}` : ""}`}
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => {
                setPanel(null);
                setSelectedId(null);
              }}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[#557079] hover:bg-[#F2F6F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto overscroll-contain">
            {panel.kind === "zone" && panelZoneUnits.length === 0 && (
              <p className="px-4 py-3 text-[13px] text-[#557079]">
                Chưa có căn phù hợp bộ lọc trong phân khu này.
              </p>
            )}
            {panel.kind === "zone" &&
              panelZoneUnits.map((u) => {
                const hot = isUnitHot(u);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(u.id);
                      const p = positions.get(u.id);
                      if (p) flyTo(p, 0.5);
                      openUnitDrawer(u);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left border-b border-[#F0F4F5] last:border-b-0 hover:bg-[#F2F6F7] cursor-pointer ${
                      selectedId === u.id ? "bg-[#EAF4F5]" : ""
                    }`}
                  >
                    <span className={`font-bold text-[13.5px] shrink-0 ${hot ? "text-[#D7263D]" : "text-[#0D2A33]"}`}>
                      {u.code}
                    </span>
                    <span className="text-[12px] text-[#557079] truncate flex-1">
                      {u.type} · {u.landArea.toLocaleString("vi-VN")} m² · {u.direction}
                    </span>
                    <span className={`font-extrabold text-[14.5px] shrink-0 ${hot ? "text-[#D7263D]" : "text-[#0E7686]"}`}>
                      {fmtTy(u.price)}
                    </span>
                    {isBP(u) && (
                      <em className="not-italic text-[9.5px] font-extrabold bg-[#FFE27A] text-[#3A2A00] rounded-[3px] px-1">
                        BP
                      </em>
                    )}
                  </button>
                );
              })}
            {panel.kind === "apt" &&
              panelApts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    openLeadModal(`Quan tâm căn hộ ${a.code} - ${a.projectName} (${a.type}, ${a.price} tỷ)`)
                  }
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left border-b border-[#F0F4F5] last:border-b-0 hover:bg-[#F2F6F7] cursor-pointer"
                >
                  <span className="font-bold text-[13.5px] text-[#0D2A33] shrink-0">{a.code}</span>
                  <span className="text-[12px] text-[#557079] truncate flex-1">
                    {a.type} · {a.area.toLocaleString("vi-VN")} m² · {a.building}
                  </span>
                  <span className="text-right shrink-0 leading-tight">
                    <span className="block font-extrabold text-[14.5px] text-[#6E45C9]">{fmtTy(a.price)}</span>
                    <span className="block text-[11px] text-[#557079] line-through">{fmtTy(a.originalPrice)}</span>
                  </span>
                </button>
              ))}
          </div>

          <div className="p-3 border-t border-[#E6EEF0]">
            <button
              type="button"
              onClick={() =>
                openLeadModal(
                  panel.kind === "zone"
                    ? `Quan tâm quỹ căn phân khu ${panelZone?.name ?? ""}`
                    : `Quan tâm chung cư chuyển nhượng ${panelApts[0]?.projectName ?? ""}`
                )
              }
              className="w-full py-2.5 rounded-[10px] bg-[#0E7686] hover:bg-[#0A5B68] text-white font-bold text-[14px] cursor-pointer"
            >
              Liên hệ nhận thông tin căn
            </button>
          </div>
        </div>
      )}

      {coord && (
        <div className="absolute right-2.5 bottom-2.5 z-[1000] bg-[#0D2A33] text-white text-[12px] font-mono px-2.5 py-1.5 rounded-[8px]">
          plan: {coord}
        </div>
      )}
    </div>
  );
}
