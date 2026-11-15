export type ProjectSlug = "ocp2" | "ocp3";

export type UnitType =
  | "Liền kề"
  | "Liền kề góc"
  | "Shophouse"
  | "Song lập"
  | "Tứ lập"
  | "Xẻ khe"
  | "Đơn lập";

export type Direction =
  | "Đông"
  | "Tây"
  | "Nam"
  | "Bắc"
  | "Đông Bắc"
  | "Đông Nam"
  | "Tây Bắc"
  | "Tây Nam";

export type LegalStatus = "Có sổ" | "HĐMB";
export type PriceType = "Bao phí" | "Thu về";

export interface Unit {
  id: string;
  code: string;
  project: ProjectSlug;
  zoneId: string;
  zoneName: string;
  type: UnitType;
  landArea: number;
  floorArea: number;
  floors: number;
  frontage: number;
  depth: number;
  direction: Direction;
  legal: LegalStatus;
  status: "Nhà thô" | "Hoàn thiện";
  statusNote?: string;
  price: number; // tỷ VNĐ
  priceType: PriceType;
  isHot?: boolean;
  isSold?: boolean;
  roadLabel?: string;
  images: string[];
  lat: number;
  lng: number;
  /** Vị trí trên ảnh mặt bằng [x, y] (0–1). Bỏ trống → tự xếp quanh tâm phân khu. */
  plan?: [number, number];
  updatedAt: string;
}

export interface Apartment {
  id: string;
  code: string;
  projectKey: string;
  projectName: string;
  building: string;
  type: "Studio" | "1PN+" | "2PN" | "2PN+" | "3PN";
  area: number;
  direction: Direction;
  view: string;
  originalPrice: number;
  discount: string;
  price: number;
  priceType: PriceType;
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  project: ProjectSlug;
  center: [number, number];
  zoom: number;
  color: string;
  description: string;
}

export interface ProjectHighlight {
  id: string;
  badge?: string;
  badgeVariant?: "hot" | "lagoon" | "gold" | "green";
  name: string;
  location: string;
  summary: string;
  href: string;
  ctaLabel: string;
  image?: string;
}

export interface DesignTemplate {
  slug: string;
  title: string;
  project: string;
  zone: string;
  landArea: number;
  floors: number;
  floorArea: number;
  dimensions: string;
  summary: string;
  rooms: { floor: string; items: string[] }[];
}

export interface FoodPlace {
  id: string;
  name: string;
  category:
    | "Ăn sáng"
    | "Cơm & Lẩu"
    | "Cà phê - Trà sữa"
    | "Nhà hàng"
    | "Dịch vụ BQL";
  emoji: string;
  address: string;
  hours: string;
  priceRange: string;
  lat: number;
  lng: number;
  note: string;
}
