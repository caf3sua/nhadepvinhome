"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export interface OlympicZone {
  id: string;
  name: string;
  areaText: string;
  center: [number, number];
  polygon: [number, number][];
  color: string;
}

interface OlympicMapClientProps {
  zones: OlympicZone[];
  focusedZoneId: string | null;
  showSatellite: boolean;
  showBoundaries: boolean;
  onSelectZone: (id: string) => void;
}

export function OlympicMapClient({
  zones,
  focusedZoneId,
  showSatellite,
  showBoundaries,
  onSelectZone,
}: OlympicMapClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const polyLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [20.885, 105.845],
      zoom: 12,
      zoomControl: false,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    const polyLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    polyLayerRef.current = polyLayer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);

    // Nền sáng dùng Esri Light Gray (không cần API key). CARTO basemaps trả
    // watermark "API KEY REQUIRED"; tile.openstreetmap.org hay từ chối kết nối.
    const url = showSatellite
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

    tileRef.current = L.tileLayer(url, {
      maxZoom: showSatellite ? 18 : 16,
      attribution: "Tiles © Esri",
    }).addTo(map);
  }, [showSatellite]);

  useEffect(() => {
    const layer = polyLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showBoundaries) return;

    zones.forEach((z) => {
      const isFocused = focusedZoneId === z.id;
      const dimmed = focusedZoneId !== null && !isFocused;

      const poly = L.polygon(z.polygon, {
        color: isFocused ? "#FF5500" : "#3563E9",
        weight: isFocused ? 3 : 2,
        fillColor: z.color,
        fillOpacity: dimmed ? 0.1 : 0.28,
        opacity: dimmed ? 0.35 : 0.9,
      });
      poly.on("click", () => onSelectZone(z.id));
      poly.addTo(layer);

      const labelIcon = L.divIcon({
        className: "",
        html: `<div style="background:rgba(255,255,255,0.95);border:1.5px solid ${
          isFocused ? "#FF5500" : "#3563E9"
        };border-radius:10px;padding:4px 8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);text-align:center;white-space:nowrap;">
          <div style="font-weight:800;font-size:12px;color:#1F1D1A">${z.name}</div>
          <div style="font-size:10.5px;color:#6F6A62">${z.areaText}</div>
        </div>`,
        iconSize: [110, 38],
        iconAnchor: [55, 19],
      });
      L.marker(z.center, { icon: labelIcon })
        .on("click", () => onSelectZone(z.id))
        .addTo(layer);
    });
  }, [zones, focusedZoneId, showBoundaries, onSelectZone]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedZoneId) return;
    const found = zones.find((z) => z.id === focusedZoneId);
    if (found) {
      map.flyTo(found.center, 13, { duration: 0.7 });
    }
  }, [focusedZoneId, zones]);

  return <div ref={containerRef} className="w-screen h-screen z-0" />;
}
