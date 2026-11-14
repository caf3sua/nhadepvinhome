/**
 * Mô hình dữ liệu nhà 3D dựng theo bản vẽ mặt bằng.
 *
 * Hệ toạ độ (mét):
 *  - x: bề ngang nhà, 0 = mặt ngoài tường bên trái (nhìn từ đường vào), tăng sang phải.
 *  - d: chiều sâu, 0 = mặt ngoài mặt tiền tầng 2+, tăng dần vào phía sau nhà.
 *  - y: cao độ, 0 = cốt sàn tầng 1.
 */

/** Hình chữ nhật trên mặt bằng: [x0, x1, d0, d1] */
export type Rect = [number, number, number, number];

/** r: phòng · w: WC · h: sảnh/hành lang/thang · o: ngoài trời (ban công, sân) */
export type RoomKind = "r" | "w" | "h" | "o";

export interface Room {
  name: string;
  kind: RoomKind;
  rect: Rect;
  /** Diện tích ghi trên bản vẽ (nếu có) — dùng thay số tự tính. */
  area?: number;
}

/** Ô cửa trên một bức tường: [a, b] theo chiều dài tường, [đáy, đỉnh] tính từ sàn. */
export interface Opening {
  from: number;
  to: number;
  bottom: number;
  top: number;
  /** door: cửa đi (để trống) · window: cửa sổ (có kính) */
  type: "door" | "window";
}

/** Tường chạy theo trục x (song song mặt tiền) tại khoảng d0..d1, hoặc theo trục d. */
export interface Wall {
  axis: "x" | "d";
  /** Với axis "x": from/to là x, at = [d0, d1]. Với axis "d": from/to là d, at = [x0, x1]. */
  from: number;
  to: number;
  at: [number, number];
  openings?: Opening[];
  /** Chiều cao tường (mặc định = cao tầng). */
  height?: number;
  /** Ốp gạch men (tường WC). */
  tiled?: boolean;
  /**
   * Hình dạng tường khác chữ nhật (VD vách dưới thang có mép trên chéo theo vế thang):
   * đa giác các điểm [vị trí dọc tường, cao độ tính từ sàn]. Khi có profile thì
   * from/to/height/openings không dùng để dựng hình.
   */
  profile?: [number, number][];
}

export type FurnitureKind =
  | "sofa"
  | "arm"
  | "ctab"
  | "tv"
  | "bed"
  | "ward"
  | "desk"
  | "chair"
  | "kit"
  | "fridge"
  | "dtab"
  | "wc"
  | "basin"
  | "shower"
  | "wash"
  | "plant"
  | "ac"
  | "tank"
  | "gym"
  | "shelf";

export interface Furniture {
  kind: FurnitureKind;
  rect: Rect;
  /**
   * Phía tựa lưng / mặt quay vào tường: L, R, F (mặt tiền), B (phía sau).
   * Riêng "shower": phía có vách kính + cửa (mặc định "R"; "L" khi buồng tắm sát tường phải).
   */
  facing?: "L" | "R" | "F" | "B";
  height?: number;
}

export interface Balcony {
  rect: Rect;
  /** Lan can ở các cạnh: F (phía trước), B (phía sau), L, R. */
  rails: ("F" | "B" | "L" | "R")[];
}

/** Ô cửa sổ lồi (bay window) gắn vào mặt tiền. */
export interface BayWindow {
  x0: number;
  x1: number;
  /** Độ nhô ra phía trước (m, theo chiều -d). */
  depth: number;
}

export interface FloorPlan {
  name: string;
  /** Tiêu đề ngắn của tầng. */
  title: string;
  /** Mô tả bố trí. */
  description: string;
  /** Mặt ngoài tường trước / sau của phần nhà kín ở tầng này (d). */
  front: number;
  back: number;
  /** Phần nhà có mái che phía trên (mặc định = front..back). Dùng cho tầng có sân thượng. */
  roofed?: [number, number];
  frontOpenings: Opening[];
  backOpenings: Opening[];
  /** Thang đi lên từ tầng này nếu khác thang chữ U chung (`HouseModel.stair`). */
  stairUp?: StraightStair;
  /**
   * Lỗ sàn của tầng này cho thang từ tầng dưới đi lên (mặc định = `HouseModel.stair.rect`).
   * Dùng khi tầng dưới có `stairUp` riêng; `null` = không khoét lỗ.
   */
  stairHole?: Rect | null;
  /** Cửa sổ/cửa đi trên tường hông trái / phải (căn góc): from/to là d, đáy/đỉnh tính từ sàn. */
  leftOpenings?: Opening[];
  rightOpenings?: Opening[];
  walls: Wall[];
  rooms: Room[];
  furniture: Furniture[];
  balconies?: Balcony[];
  bay?: BayWindow;
  /** Diện tích xây dựng (DTXD) ghi trên bản vẽ cho tầng này. */
  grossArea?: number;
}

/** Thang chữ U: vế 1 ở dải trước (d0..dm), chiếu nghỉ ở phía x0, vế 2 ở dải sau. */
export interface UStair {
  rect: Rect;
  /** Bề rộng chiếu nghỉ (theo x, tính từ x0). */
  landing: number;
  /** Số bậc mỗi vế. */
  steps: number;
  /**
   * Phía đặt chiếu nghỉ (mặc định "L" = phía x0, vế 1 đi lên theo −x từ hành lang bên phải).
   * "R": chiếu nghỉ ở phía x1, vế 1 đi lên theo +x từ hành lang bên trái (lõi thang sát tường phải).
   */
  landingSide?: "L" | "R";
}

/**
 * Thang thẳng một vế (VD shophouse: tầng 1 cao, thang dọc tường lên tầng 2).
 * Bậc đầu ở phía ngược `dir`, bậc cuối tới đúng cao độ tầng trên ở mép theo `dir`.
 */
export interface StraightStair {
  kind: "straight";
  rect: Rect;
  /** Hướng đi lên: "+d" đi vào phía sau nhà, "-d" ra mặt tiền, "+x" sang phải, "-x" sang trái. */
  dir: "+d" | "-d" | "+x" | "-x";
  /** Số bậc (số lần nâng). */
  steps: number;
}

export interface HouseModel {
  id: string;
  /** Tên hiển thị: "Liền kề VN-LKB-M1 · Chà Là" */
  name: string;
  shortName: string;
  code: string;
  zone: string;
  project: string;
  /** Bề rộng nhà (mặt ngoài tường trái → phải). */
  width: number;
  /** Cao độ sàn từng tầng. */
  levels: number[];
  /** Cao độ trần tầng trên cùng (đáy sàn mái). */
  roofY: number;
  /** Cao độ đỉnh tường chắn mái / mái. */
  topY: number;
  /** Cốt sân (thường âm, có bậc tam cấp lên tầng 1). */
  groundY: number;
  /** Vùng sân/lô vẽ nền: [d0, d1]. */
  lot: [number, number];
  /** Bậc tam cấp trước cửa tầng 1: [x0, x1, d0, d1]. */
  frontSteps?: Rect;
  /** Mái mansard ngói phía trước tầng trên cùng: d0..d1 (dốc lên từ d0). */
  mansard?: { d0: number; d1: number; height: number };
  stair: UStair;
  floors: FloorPlan[];
  specs: string[];
  /** true khi có số liệu ước lượng (VD bản vẽ không ghi kích thước). */
  estimated: boolean;
  /** Ghi chú nguồn số liệu, hiển thị trên trang. */
  note: string;
  /** DTXD tổng ghi trên bản vẽ. */
  totalGrossArea?: number;
  /** Link sang danh sách căn đang bán cùng loại (VD /quy-can đã lọc sẵn). */
  listingHref?: string;
  /** Căn góc có sân hông: nền sân mở rộng sang phía đó, không dựng nhà bên cạnh ở phía đó. */
  sideYard?: { side: "L" | "R"; width: number };
}
