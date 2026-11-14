import type { HouseModel, Opening, Wall } from "@/lib/house3d/types";

/*
 * Liền kề HL-LKD-M2 · phân khu Đảo Dừa · Vinhomes Ocean Park 2 (The Empire)
 * Nguồn: ảnh mặt bằng tầng 1–5 + bảng DTXD (docs/drawings/hl-lkd-m2/).
 *
 * Bản vẽ không ghi kích thước; đo pixel bằng skill tao-can-3d (~74,5–75 px/m, cả 2 ảnh)
 * và hiệu chỉnh theo DTXD:
 *  - Nhà rộng 4,0 m, sâu 11,35 m → 45,4 m²/sàn
 *  - T1: 45,4 m² (DTXD 45,9)
 *  - T2: 45,4 + ban công sau 3,15 × 0,85 ≈ 2,7 m² = 48,1 m² (DTXD 48,1)
 *  - T3: 45,4 + ban công trước 1,2 m = 50,2 m² (DTXD 50,1)
 *  - T4: 45,4 + cửa sổ lồi ≈ 3,5 m² = 48,9 m² (DTXD 48,6)
 *  - T5: phần có mái d 1,33 → 9,42 = 32,4 m² (DTXD 45,6 — bảng tính cả sân & áp mái)
 *  - Ô gạch chéo hình cung trước mặt tiền tầng 2 là mái kính sảnh tầng 1 (không tính DTXD) — không dựng.
 * Lõi thang sát tường phải (x 1,22 → 3,89, d 5,8 → 7,68), hành lang bên trái
 * → thang chữ U chiếu nghỉ bên phải (landingSide "R"), giống mẫu MRC-LK3D.3.
 * Cao tầng không có mặt cắt → ước lượng 3,6 / 3,3 / 3,3 / 3,3 / 3,2 m.
 */

const W = 4.0;
const XI = 0.11;
const XR = W - 0.11;
const SX0 = 1.22; // mép trái lõi thang
const LAND = 0.88;
const SXL = XR - LAND; // 3,01: chỗ chiếu nghỉ bắt đầu
const S0 = 5.8;
const S1 = 7.68;
const DM = (S0 + S1) / 2; // 6,74
const BACK = 11.35;
const BI = BACK - 0.2;

const LEVELS = [0, 3.6, 6.9, 10.2, 13.5];
const STEPS = 10;
const LANDING_T1 = (LEVELS[1] * (STEPS + 1)) / (2 * STEPS + 1); // ≈1,89 m
const T1_CEIL = LEVELS[1] - 0.15;

const win = (from: number, to: number, bottom = 0.9, top = 2.4): Opening => ({ from, to, bottom, top, type: "window" });
const door = (from: number, to: number, top = 2.2): Opening => ({ from, to, bottom: 0, top, type: "door" });

const stairMid: Wall = { axis: "x", from: SX0, to: SXL, at: [DM - 0.04, DM + 0.04], height: 1.1 };

/** Tầng 2–3: WC trước lõi thang (x 1,4 → 3,89, d 4,28 → 5,72), hành lang dọc tường trái. */
const wcBlock = (backDoor: [number, number]): Wall[] => [
  // Vách sau lõi thang / phòng phía sau, cửa phòng ở đầu hành lang
  { axis: "x", from: XI, to: XR, at: [S1, S1 + 0.1], openings: [door(backDoor[0], backDoor[1])] },
  stairMid,
  // Vách giữa WC và lõi thang
  { axis: "x", from: 1.32, to: XR, at: [5.72, S0], tiled: true },
  // Vách trái WC, cửa mở ra hành lang
  { axis: "d", from: 4.28, to: 5.72, at: [1.32, 1.4], tiled: true, openings: [door(4.44, 5.09, 2.1)] },
  // Vách phòng ngủ trước, cửa ở đầu hành lang
  { axis: "x", from: XI, to: XR, at: [4.2, 4.28], openings: [door(0.25, 1.1)] },
];

const wcFurniture = [
  { kind: "basin" as const, rect: [1.45, 1.95, 5.2, 5.7] as [number, number, number, number], facing: "B" as const },
  { kind: "wc" as const, rect: [2.3, 2.7, 5.1, 5.7] as [number, number, number, number], facing: "B" as const },
  { kind: "shower" as const, rect: [3.13, XR, 4.28, 5.72] as [number, number, number, number], facing: "L" as const },
];

const wcRoom = { name: "WC", kind: "w" as const, rect: [1.4, XR, 4.28, 5.72] as [number, number, number, number] };
const hallRooms = [
  { name: "Hành lang", kind: "h" as const, rect: [XI, 1.32, 4.28, S0] as [number, number, number, number] },
  { name: "Hành lang", kind: "h" as const, rect: [XI, SX0, S0, S1] as [number, number, number, number] },
];
const stairRoom = { name: "Thang", kind: "h" as const, rect: [SX0, XR, S0, S1] as [number, number, number, number] };

export const HL_LKD_M2: HouseModel = {
  id: "hl-lkd-m2",
  name: "Liền kề HL-LKD-M2 · Đảo Dừa",
  shortName: "Đảo Dừa HL-LKD-M2",
  code: "HL-LKD-M2",
  zone: "Phân khu Đảo Dừa",
  project: "Vinhomes Ocean Park 2 · The Empire",
  width: W,
  levels: LEVELS,
  roofY: 16.7,
  topY: 17.3,
  groundY: -0.45,
  lot: [-0.9, 13.0],
  frontSteps: [0.44, 3.38, -0.45, 0],
  stair: { rect: [SX0, XR, S0, S1], landing: LAND, steps: STEPS, landingSide: "R" },
  specs: ["Nhà 4,0 × 11,35 m", "5 tầng · thang bộ chữ U", "4 phòng ngủ · 4 WC", "Mẫu đối xứng"],
  estimated: true,
  totalGrossArea: 238.3,
  listingHref: "/quy-can?du-an=ocp2&phan-khu=dao-dua&loai=Li%E1%BB%81n%20k%E1%BB%81",
  note:
    "Toạ độ đo từ ảnh mặt bằng và hiệu chỉnh theo DTXD công bố (sai số khoảng ±10 cm). Chiều cao tầng là ước lượng vì chưa có mặt cắt. DTXD tầng 5 (45,6 m²) gồm cả sân và áp mái nên lớn hơn phần phòng có mái trong mô hình; mái kính sảnh trước tầng 1 chưa dựng.",
  floors: [
    {
      name: "Tầng 1",
      title: "Phòng khách, bếp + ăn",
      description:
        "Cửa đôi mặt tiền có bậc tam cấp vào phòng khách, sofa dọc tường phải, kệ tivi tường trái. Lõi thang sát tường phải: vế đầu đi lên từ phía hành lang/phòng khách, WC (chậu rửa + bồn cầu) nằm dưới vế 2 và chiếu nghỉ, cửa ra phía bếp. Bếp chữ I dọc tường phải, bàn ăn 6 ghế; cửa đôi ra sân sau.",
      front: 0,
      back: BACK,
      grossArea: 45.9,
      frontOpenings: [door(0.5, 3.4, 2.7)],
      backOpenings: [door(0.84, 3.25, 2.5)],
      walls: [
        // Vách giữa vế 1 và WC (dưới vế 2): mép trên chéo theo mặt dưới vế 2
        // (vế 2 đi lên từ chiếu nghỉ bên phải về phía hành lang bên trái)
        {
          axis: "x",
          from: SX0,
          to: SXL,
          at: [DM - 0.045, DM + 0.045],
          tiled: true,
          profile: [
            [SX0, 0],
            [SXL, 0],
            [SXL, LANDING_T1],
            [SX0, T1_CEIL],
          ],
        },
        // Vách trái phần chậu rửa (giáp hành lang)
        { axis: "d", from: DM + 0.045, to: S1, at: [SX0 - 0.08, SX0], tiled: true },
        // Phần bồn cầu dưới chiếu nghỉ: vách trái & vách trước thấp hơn đáy chiếu nghỉ
        { axis: "d", from: S0, to: DM - 0.045, at: [SXL - 0.08, SXL], height: LANDING_T1 - 0.17, tiled: true },
        { axis: "x", from: SXL - 0.08, to: XR, at: [S0 - 0.08, S0], height: LANDING_T1 - 0.17, tiled: true },
        // Vách sau WC (giáp bếp), cửa vào WC
        { axis: "x", from: SX0 - 0.08, to: XR, at: [S1, S1 + 0.1], tiled: true, openings: [door(2.3, 3.0, 2.1)] },
      ],
      rooms: [
        { name: "Phòng khách", kind: "r", rect: [XI, XR, 0.25, S0 - 0.08] },
        { name: "Hành lang", kind: "h", rect: [XI, SX0 - 0.08, S0 - 0.08, S1 + 0.1] },
        { name: "Thang", kind: "h", rect: [SX0, SXL - 0.08, S0, DM - 0.045] },
        // WC chữ L dưới thang → diện tích ghi thủ công
        { name: "WC", kind: "w", rect: [SX0, SXL, DM + 0.045, S1], area: 1.6 },
        { name: "WC", kind: "w", rect: [SXL, XR, S0, S1], area: 1.65 },
        { name: "Bếp + ăn", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "sofa", rect: [3.15, XR, 2.0, 4.3], facing: "R" },
        { kind: "arm", rect: [1.85, 2.7, 4.3, 4.95], facing: "B" },
        { kind: "ctab", rect: [2.0, 2.55, 2.6, 3.6] },
        { kind: "tv", rect: [XI, 0.35, 2.8, 4.15], facing: "L" },
        { kind: "basin", rect: [1.3, 1.85, 6.85, 7.6], facing: "L" },
        { kind: "wc", rect: [3.3, 3.75, 7.05, 7.65], facing: "B" },
        { kind: "fridge", rect: [3.3, XR, S1 + 0.1, 8.8] },
        { kind: "kit", rect: [3.3, XR, 8.9, 11.0], facing: "R" },
        { kind: "dtab", rect: [0.3, 1.65, 9.2, 9.95] },
      ],
    },
    {
      name: "Tầng 2",
      title: "Hai phòng ngủ, WC chung",
      description:
        "Phòng ngủ trước và phòng ngủ sau, mỗi phòng có dải tủ áo; phòng sau mở ra ban công. Hành lang dọc tường trái nối lõi thang với cửa hai phòng và cửa WC (buồng tắm kính sát tường phải).",
      front: 0,
      back: BACK,
      grossArea: 48.1,
      frontOpenings: [win(0.6, 3.4)],
      backOpenings: [door(0.9, 3.2, 2.4)],
      walls: wcBlock([0.25, 1.1]),
      balconies: [{ rect: [0.45, 3.6, BACK, BACK + 0.85], rails: ["B", "L", "R"] }],
      rooms: [
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, XR, 0.25, 4.2] },
        wcRoom,
        ...hallRooms,
        stairRoom,
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
        { name: "Ban công sau", kind: "o", rect: [0.45, 3.6, BACK, BACK + 0.85] },
      ],
      furniture: [
        { kind: "bed", rect: [1.8, 3.75, 1.25, 3.0], facing: "R" },
        { kind: "ward", rect: [1.8, 3.8, 3.75, 4.2], facing: "B" },
        { kind: "tv", rect: [XI, 0.3, 1.6, 3.0], facing: "L" },
        ...wcFurniture,
        { kind: "ward", rect: [1.8, 3.8, S1 + 0.1, 8.3], facing: "F" },
        { kind: "bed", rect: [1.8, 3.75, 9.0, 10.8], facing: "R" },
        { kind: "tv", rect: [XI, 0.3, 8.8, 10.2], facing: "L" },
      ],
    },
    {
      name: "Tầng 3",
      title: "Phòng ngủ ban công, WC, phòng làm việc",
      description:
        "Phòng ngủ phía trước mở cửa đôi ra ban công mặt tiền, tủ áo ngăn với WC. Hành lang dọc tường trái dẫn tới cửa WC, cửa phòng ngủ và cửa phòng làm việc phía sau (bàn làm việc, góc ghế đọc sách, kệ dọc tường phải).",
      front: 0,
      back: BACK,
      grossArea: 50.1,
      frontOpenings: [door(1.29, 2.69, 2.4), win(0.4, 1.15), win(2.85, 3.6)],
      backOpenings: [win(0.55, 1.4), win(2.6, 3.5)],
      walls: wcBlock([0.29, 1.09]),
      balconies: [{ rect: [0, W, -1.2, 0], rails: ["F", "L", "R"] }],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, -1.2, 0] },
        { name: "Phòng ngủ 3", kind: "r", rect: [XI, XR, 0.25, 4.2] },
        wcRoom,
        ...hallRooms,
        stairRoom,
        { name: "Phòng làm việc", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "bed", rect: [1.85, 3.75, 1.28, 2.88], facing: "R" },
        { kind: "ward", rect: [1.83, XR, 3.67, 4.2], facing: "B" },
        { kind: "tv", rect: [XI, 0.35, 1.0, 2.8], facing: "L" },
        ...wcFurniture,
        { kind: "desk", rect: [1.76, 2.49, 8.75, 10.35] },
        { kind: "chair", rect: [2.55, 2.9, 9.3, 9.7] },
        { kind: "arm", rect: [0.3, 0.9, 10.5, 11.1], facing: "L" },
        { kind: "arm", rect: [0.3, 0.9, 9.0, 9.6], facing: "L" },
        { kind: "ctab", rect: [0.35, 0.8, 9.95, 10.4] },
        { kind: "shelf", rect: [3.5, XR, 8.0, 11.1], facing: "R", height: 2.0 },
      ],
    },
    {
      name: "Tầng 4",
      title: "Phòng ngủ master cửa sổ lồi, phòng thay đồ, WC",
      description:
        "Phòng ngủ master chiếm toàn bộ phía trước lõi thang, ô cửa sổ lồi lớn nhô ra mặt tiền, tủ dọc tường phải. Phía sau là phòng thay đồ (kệ treo, bàn trang điểm) và WC riêng vào qua phòng thay đồ.",
      front: 0,
      back: BACK,
      grossArea: 48.6,
      bay: { x0: 0.35, x1: 3.65, depth: 1.25 },
      frontOpenings: [door(0.35, 3.65, 2.5)],
      backOpenings: [win(0.3, 1.3), win(2.4, 3.6)],
      walls: [
        // Vách sau lõi thang, cửa phòng thay đồ ở đầu hành lang
        { axis: "x", from: XI, to: XR, at: [S1, S1 + 0.1], openings: [door(0.15, 1.05)] },
        stairMid,
        // Vách trước lõi thang, cửa phòng ngủ ở phía trái
        { axis: "x", from: XI, to: XR, at: [S0 - 0.08, S0], openings: [door(0.25, 1.05)] },
        // Vách phòng thay đồ | WC, cửa WC
        { axis: "d", from: S1 + 0.1, to: BI, at: [2.2, 2.28], tiled: true, openings: [door(8.15, 8.8, 2.1)] },
      ],
      rooms: [
        { name: "Phòng ngủ master", kind: "r", rect: [XI, XR, 0.25, S0 - 0.08] },
        { name: "Phòng ngủ master", kind: "r", rect: [0.35, 3.65, -1.25, 0], area: 3.5 },
        { name: "Sảnh thang", kind: "h", rect: [XI, SX0, S0, S1] },
        stairRoom,
        { name: "Phòng thay đồ", kind: "r", rect: [XI, 2.2, S1 + 0.1, BI] },
        { name: "WC", kind: "w", rect: [2.28, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "bed", rect: [1.75, 3.4, 2.1, 3.95], facing: "R" },
        { kind: "ward", rect: [3.45, XR, 4.3, 5.6], facing: "R" },
        { kind: "ward", rect: [3.45, XR, 0.45, 1.8], facing: "R" },
        { kind: "tv", rect: [XI, 0.35, 2.2, 3.6], facing: "L" },
        { kind: "plant", rect: [1.8, 2.2, -0.95, -0.55] },
        { kind: "ward", rect: [1.6, 2.2, 9.05, BI], facing: "R" },
        { kind: "desk", rect: [XI, 0.65, 9.8, BI], facing: "L" },
        { kind: "chair", rect: [0.75, 1.1, 10.3, 10.7] },
        { kind: "shower", rect: [2.28, 3.1, 10.3, BI], facing: "R" },
        { kind: "wc", rect: [3.35, XR, 9.6, 10.1], facing: "R" },
        { kind: "basin", rect: [3.4, XR, 8.6, 9.4], facing: "R" },
      ],
    },
    {
      name: "Tầng 5",
      title: "Phòng đa năng, phòng giặt, sân",
      description:
        "Phòng đa năng phía trước (tập thể thao, giải trí) mở cửa đôi ra ban công trồng cây. Sau lõi thang là phòng giặt và sân phơi phía sau, cửa ra sân ở đầu sảnh thang.",
      front: 1.33,
      back: 9.42,
      roofed: [1.33, 9.42],
      grossArea: 45.6,
      frontOpenings: [door(0.85, 2.6)],
      backOpenings: [door(0.12, 0.98)],
      walls: [
        stairMid,
        // Vách phòng đa năng | sảnh thang, cửa phía trái
        { axis: "x", from: XI, to: XR, at: [S0 - 0.08, S0], openings: [door(0.19, 0.99)] },
        // Phòng giặt sau lõi thang, cửa ở vách trái
        { axis: "x", from: 1.45, to: XR, at: [S1, S1 + 0.1] },
        { axis: "d", from: S1 + 0.1, to: 9.22, at: [1.45, 1.52], openings: [door(8.4, 9.05, 2.1)] },
      ],
      balconies: [
        { rect: [0, W, 0, 1.26], rails: ["F"] },
        { rect: [0, W, 9.42, BACK], rails: ["B", "L", "R"] },
      ],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, 0, 1.26] },
        { name: "Phòng đa năng", kind: "r", rect: [XI, XR, 1.53, S0 - 0.08] },
        { name: "Sảnh thang", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "Sảnh thang", kind: "h", rect: [XI, 1.45, S1, 9.22] },
        stairRoom,
        { name: "Phòng giặt", kind: "r", rect: [1.52, XR, S1 + 0.1, 9.22] },
        { name: "Sân", kind: "o", rect: [XI, XR, 9.42, BI] },
      ],
      furniture: [
        { kind: "plant", rect: [0.15, 0.6, 0.3, 0.75] },
        { kind: "plant", rect: [3.4, 3.85, 0.3, 0.75] },
        { kind: "gym", rect: [0.6, 1.2, 3.3, 3.9] },
        { kind: "gym", rect: [2.85, 3.45, 3.3, 3.9] },
        { kind: "wash", rect: [3.35, XR, 8.6, 9.15] },
        { kind: "wash", rect: [3.35, XR, 7.9, 8.45] },
      ],
    },
  ],
};
