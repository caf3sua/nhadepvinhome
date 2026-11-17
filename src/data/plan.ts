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

// Ảnh "MB Tổng_VHOP2-3" đã xoay ngang (hướng Bắc bên trái), thu về 5000px, ~2MB.
export const PLAN_IMAGE = {
  src: "/images/map/mb-tong-vhop23.jpg",
  width: 5000,
  height: 3147,
};

/** Tâm từng phân khu thấp tầng (khớp `id` trong `data/zones.ts`). */
export const ZONE_ANCHORS: Record<string, PlanPoint> = {
  // Ocean Park 2 (nửa phải ảnh)
  "kinh-do": [0.758, 0.5302],
  "sao-bien": [0.7674, 0.62],
  "san-ho": [0.7548, 0.4003],
  "co-xanh": [0.7549, 0.7498],
  "hai-au": [0.8556, 0.7096],
  "dao-dua": [0.925, 0.6595],
  "ngoc-trai": [0.8304, 0.2255],
  "cha-la": [0.9123, 0.2752],
  // Ocean Park 3 (nửa trái ảnh)
  "vinh-xanh": [0.3494, 0.6618],
  "dao-ngoc": [0.377, 0.8276],
  "anh-duong": [0.41, 0.5963],
  "vinh-tay": [0.4568, 0.8145],
  "thoi-dai": [0.534, 0.7006],
  "vinh-thien-duong": [0.5119, 0.6091],
  "pho-bien": [0.4788, 0.4432],
  "hai-dang": [0.1486, 0.4107],
  "hung-dong": [0.4252, 0.7622],
};

/** Ghim dự án chung cư (khớp `projectKey` trong `data/apartments.ts`). */
export const APARTMENT_ANCHORS: Record<
  string,
  { short: string; project: ProjectSlug; point: PlanPoint }
> = {
  "masteri-trinity": { short: "Trinity", project: "ocp2", point: [0.7816, 0.6541] },
  "lumiere-springbay": { short: "Springbay", project: "ocp2", point: [0.6316, 0.3491] },
  "masteri-grand-coast": { short: "Grand Coast", project: "ocp2", point: [0.6909, 0.241] },
  "the-parkland": { short: "Parkland", project: "ocp2", point: [0.908, 0.4022] },
  "masteri-era": { short: "Era Landmark", project: "ocp3", point: [0.5191, 0.7392] },
};

/** Ga tuyến metro 8B theo quy hoạch (tham khảo, vị trí có thể thay đổi). */
export const METRO_STATIONS: { name: string; point: PlanPoint }[] = [
  // Ga thật nằm ngay ngoài mép dưới ảnh → đặt sát mép dưới cho vẫn nhìn thấy
  { name: "Ga 8B.04 (phía Nam OCP2)", point: [0.6741, 0.955] },
  { name: "Ga Vincom Ocean City", point: [0.6178, 0.5615] },
  { name: "Ga Vinhomes Ocean Park 3", point: [0.4889, 0.2124] },
];

/** Khung nhìn khi lọc theo dự án: [x1, y1, x2, y2]. */
export const PLAN_VIEWS: Record<"all" | ProjectSlug, [number, number, number, number]> = {
  all: [0, 0, 1, 1],
  ocp2: [0.6048, 0.0016, 1, 0.9871],
  ocp3: [0, 0.1532, 0.623, 0.9504],
};
