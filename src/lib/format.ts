import { Unit } from "@/types/property";
import { SITE_CONFIG } from "@/config/site";

/**
 * Khoảng lọc dạng nửa mở [min, max): giá trị đúng bằng mốc chỉ thuộc
 * khoảng phía trên (VD 20 tỷ thuộc "20 – 30", không thuộc "10 – 20").
 */
const PRICE_RANGES: Record<string, [number, number]> = {
  "under-10": [0, 10],
  "10-20": [10, 20],
  "20-30": [20, 30],
  "over-20": [20, Infinity],
  "over-30": [30, Infinity],
};

const AREA_RANGES: Record<string, [number, number]> = {
  "under-90": [0, 90],
  "90-130": [90, 130],
  "130-200": [130, 200],
  "over-200": [200, Infinity],
};

function inRange(value: number, ranges: Record<string, [number, number]>, key: string): boolean {
  const r = ranges[key];
  if (!r) return true; // "all" hoặc key lạ → không lọc
  return value >= r[0] && value < r[1];
}

export function inPriceRange(priceBillion: number, key: string): boolean {
  return inRange(priceBillion, PRICE_RANGES, key);
}

export function inAreaRange(area: number, key: string): boolean {
  return inRange(area, AREA_RANGES, key);
}

export function formatPrice(billion: number): string {
  return billion.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " tỷ";
}

export function calcPricePerM2(priceBillion: number, landArea: number): number {
  if (!landArea) return 0;
  return Math.round((priceBillion * 1000) / landArea);
}

export function formatArea(area: number): string {
  return area.toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  }) + " m²";
}

export function isUnitHot(unit: Unit): boolean {
  return (
    Boolean(unit.isHot) ||
    calcPricePerM2(unit.price, unit.landArea) < SITE_CONFIG.hotPricePerM2Threshold
  );
}

export function isValidVnPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, "");
  return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(cleaned);
}
