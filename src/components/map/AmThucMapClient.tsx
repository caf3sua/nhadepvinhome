"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { FoodPlace } from "@/types/property";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/data/zones";

interface AmThucMapClientProps {
  places: FoodPlace[];
  selectedPlace: FoodPlace | null;
  onSelectPlace: (place: FoodPlace) => void;
}

export function AmThucMapClient({
  places,
  selectedPlace,
  onSelectPlace,
}: AmThucMapClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM + 1,
    });
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 19 }
    ).addTo(map);
    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    places.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="ctag ctag-food">${p.emoji} ${p.name}</div>`,
        iconSize: [140, 26],
        iconAnchor: [70, 13],
      });
      const marker = L.marker([p.lat, p.lng], { icon });
      marker.bindPopup(
        `<div style="min-width:190px">
          <strong>${p.emoji} ${p.name}</strong><br/>
          <span style="color:#557079;font-size:12px">${p.address}</span><br/>
          <span style="color:#0E7686;font-size:12px;font-weight:600">${p.hours} · ${p.priceRange}</span><br/>
          <p style="margin:6px 0 0;font-size:12px">${p.note}</p>
        </div>`
      );
      marker.on("click", () => onSelectPlace(p));
      marker.addTo(layer);
    });
  }, [places, onSelectPlace]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;
    map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, { duration: 0.7 });
  }, [selectedPlace]);

  return <div ref={containerRef} className="w-screen h-screen z-0" />;
}
