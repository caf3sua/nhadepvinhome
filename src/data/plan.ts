import { ProjectSlug } from "@/types/property";

/**
 * Bản đồ quỹ căn dựng trên ẢNH TỔNG MẶT BẰNG (không phải ảnh vệ tinh).
 *
 * Mọi toạ độ trong file này là toạ độ TƯƠNG ĐỐI trên ảnh: [x, y] với
 * x = 0 → mép trái, 1 → mép phải; y = 0 → mép trên, 1 → mép dưới.
 * Nhờ vậy có thể thay ảnh nền độ phân giải khác (cùng bố cục) mà không phải
 * đo lại ghim — chỉ cần sửa `PLAN_IMAGE` cho đúng kích thước pixel.
 *
 * Mẹo lấy toạ độ: mở trang chủ với `?toado=1` rồi bấm lên bản đồ,
 * toạ độ tương đối của điểm bấm sẽ hiện ở góc dưới bên phải.
 */
export type PlanPoint = [number, number];

// LƯU Ý: ảnh hiện tại tải tạm từ ocean23.vn để phát triển —
// phải thay bằng ảnh mặt bằng của mình trước khi đưa lên production.
export const PLAN_IMAGE = {
  src: "/images/map/mat-bang-ocp23.jpg",
  width: 2119,
  height: 1400,
};

/** Tâm từng phân khu thấp tầng (khớp `id` trong `data/zones.ts`). */
export const ZONE_ANCHORS: Record<string, PlanPoint> = {
  // Ocean Park 2 (nửa phải ảnh)
  "kinh-do": [0.7581, 0.5064],
  "sao-bien": [0.7672, 0.5896],
  "san-ho": [0.755, 0.386],
  "co-xanh": [0.755, 0.7099],
  "hai-au": [0.8528, 0.6728],
  "dao-dua": [0.9201, 0.6265],
  "ngoc-trai": [0.8284, 0.2241],
  "cha-la": [0.9079, 0.2704],
  // Ocean Park 3 (nửa trái ảnh)
  "vinh-xanh": [0.3615, 0.6275],
  "dao-ngoc": [0.3882, 0.7813],
  "anh-duong": [0.4203, 0.567],
  "vinh-tay": [0.4657, 0.7693],
  "thoi-dai": [0.5406, 0.6639],
  "vinh-thien-duong": [0.5192, 0.579],
  "pho-bien": [0.4871, 0.4252],
  "hai-dang": [0.1667, 0.3944],
  "hung-dong": [0.435, 0.7207],
};

/** Ghim dự án chung cư (khớp `projectKey` trong `data/apartments.ts`). */
export const APARTMENT_ANCHORS: Record<
  string,
  { short: string; project: ProjectSlug; point: PlanPoint }
> = {
  "masteri-trinity": { short: "Trinity", project: "ocp2", point: [0.781, 0.6213] },
  "lumiere-springbay": { short: "Springbay", project: "ocp2", point: [0.6355, 0.3383] },
  "masteri-grand-coast": { short: "Grand Coast", project: "ocp2", point: [0.693, 0.2382] },
  "the-parkland": { short: "Parkland", project: "ocp2", point: [0.9037, 0.3881] },
  "masteri-era": { short: "Era Landmark", project: "ocp3", point: [0.5262, 0.6996] },
};

/** Ga tuyến metro 8B theo quy hoạch (tham khảo, vị trí có thể thay đổi). */
export const METRO_STATIONS: { name: string; point: PlanPoint }[] = [
  { name: "Ga 8B.04 (phía Nam OCP2)", point: [0.6765, 0.965] },
  { name: "Ga Vincom Ocean City", point: [0.622, 0.5351] },
  { name: "Ga Vinhomes Ocean Park 3", point: [0.497, 0.2113] },
];

/** Khung nhìn khi lọc theo dự án: [x1, y1, x2, y2]. */
export const PLAN_VIEWS: Record<"all" | ProjectSlug, [number, number, number, number]> = {
  all: [0, 0, 1, 1],
  ocp2: [0.6096, 0.0162, 0.9949, 0.9303],
  ocp3: [0.0173, 0.1555, 0.6269, 0.8955],
};
