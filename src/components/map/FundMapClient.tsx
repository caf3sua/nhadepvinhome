"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Maximize2, Minimize2, Layers } from "lucide-react";
import { Unit, Apartment, Zone } from "@/types/property";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, ZONES } from "@/data/zones";
import { formatPrice, isUnitHot } from "@/lib/format";
import { useContact } from "@/components/contact/ContactProvider";
import { SITE_CONFIG } from "@/config/site";

/** Từ mức zoom này trở lên mới hiện nhãn giá từng căn. */
const DETAIL_ZOOM = 15;

interface FundMapClientProps {
  units: Unit[];
  apartments: Apartment[];
  selectedZone: Zone | null;
  heightClass?: string;
}

export function FundMapClient({
  units,
  apartments,
  selectedZone,
  heightClass = "h-[460px] sm:h-[540px]",
}: FundMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [layerMode, setLayerMode] = useState<"satellite" | "street">("satellite");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(MAP_DEFAULT_ZOOM);

  const { openUnitDrawer, openLeadModal } = useContact();

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      zoomControl: true,
    });

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    map.on("zoomend", () => setZoom(map.getZoom()));

    // Draw subtle zone polygons/circles
    ZONES.forEach((zone) => {
      L.circle(zone.center, {
        radius: 170,
        color: zone.color,
        weight: 1.5,
        opacity: 0.55,
        fillColor: zone.color,
        fillOpacity: 0.08,
      })
        .bindTooltip(`${zone.name} (${zone.code})`, {
          direction: "center",
          className: "text-[11px] font-bold",
        })
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch tile layer (Satellite vs Street)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      layerMode === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

    const attribution = "Tiles © Esri";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [layerMode]);

  // Render price markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    // Zoom xa: mỗi phân khu 1 bong bóng số căn để nhãn giá không đè nhau.
    // Bấm bong bóng → bay tới phân khu (zoom chi tiết hiện nhãn giá từng căn).
    if (zoom < DETAIL_ZOOM) {
      const byZone = new Map<string, Unit[]>();
      units.forEach((u) => {
        const list = byZone.get(u.zoneId) ?? [];
        list.push(u);
        byZone.set(u.zoneId, list);
      });

      byZone.forEach((list, zoneId) => {
        const zone = ZONES.find((z) => z.id === zoneId);
        const lat = list.reduce((s, u) => s + u.lat, 0) / list.length;
        const lng = list.reduce((s, u) => s + u.lng, 0) / list.length;
        const hotCount = list.filter(isUnitHot).length;
        const icon = L.divIcon({
          className: "",
          html: `<div class="zbubble${hotCount ? " zbubble-hot" : ""}" title="${zone?.name ?? ""}"><b>${list.length}</b><span>${zone?.name ?? ""}</span></div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([lat, lng], { icon });
        marker.on("click", () => {
          mapRef.current?.flyTo(zone?.center ?? [lat, lng], zone?.zoom ?? DETAIL_ZOOM + 1, {
            duration: 0.8,
          });
        });
        marker.addTo(layer);
      });
    } else {
      units.forEach((unit) => {
        const hot = isUnitHot(unit);
        const cls = hot ? "ctag ctag-hot" : "ctag ctag-normal";
        const icon = L.divIcon({
          className: "",
          html: `<div class="${cls}">${hot ? "🔥 " : ""}${formatPrice(unit.price)}</div>`,
          iconSize: [78, 24],
          iconAnchor: [39, 12],
        });

        const marker = L.marker([unit.lat, unit.lng], { icon });
        marker.on("click", () => openUnitDrawer(unit));
        marker.addTo(layer);
      });
    }

    apartments.forEach((apt) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="ctag ctag-apt">🏢 ${apt.price.toFixed(1)} tỷ</div>`,
        iconSize: [76, 24],
        iconAnchor: [38, 12],
      });

      const marker = L.marker([apt.lat, apt.lng], { icon });
      marker.on("click", () =>
        openLeadModal(
          `Quan tâm căn hộ ${apt.code} - ${apt.projectName} (${apt.type}, ${apt.price} tỷ)`
        )
      );
      marker.addTo(layer);
    });
  }, [units, apartments, zoom, openUnitDrawer, openLeadModal]);

  // Fly to selected zone
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedZone) return;
    map.flyTo(selectedZone.center, selectedZone.zoom, { duration: 0.8 });
  }, [selectedZone]);

  // Handle fullscreen resize
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-white"
          : `relative w-full ${heightClass} rounded-[16px] overflow-hidden border border-[#D6E2E5] shadow-md`
      }
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top right controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            setLayerMode((m) => (m === "satellite" ? "street" : "satellite"))
          }
          className="px-3 py-1.5 rounded-[10px] bg-white/95 backdrop-blur-xs border border-[#D6E2E5] shadow-sm text-[12.5px] font-bold text-[#0D2A33] flex items-center gap-1.5 hover:bg-[#F2F6F7] cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#0E7686]" />
          {layerMode === "satellite" ? "Ảnh vệ tinh" : "Bản đồ đường"}
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen((f) => !f)}
          aria-label="Toàn màn hình"
          className="p-2 rounded-[10px] bg-white/95 backdrop-blur-xs border border-[#D6E2E5] shadow-sm text-[#0D2A33] hover:bg-[#F2F6F7] cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Bottom left legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-[#D6E2E5] rounded-[12px] px-3 py-2 shadow-sm flex flex-wrap items-center gap-3 text-[11.5px] font-semibold text-[#0D2A33]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D7263D]" />
          HOT (&lt;{SITE_CONFIG.hotPricePerM2Threshold}tr/m²)
        </span>
        {zoom < DETAIL_ZOOM && (
          <span className="text-[#557079] font-medium">
            Phóng to hoặc bấm số để xem giá từng căn
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0E7686]" />
          Đang bán
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D2A33]" />
          Chung cư
        </span>
      </div>
    </div>
  );
}
