import type { HouseModel, Opening, Wall } from "@/lib/house3d/types";

/*
 * Liền kề MRC-LK3D.3 · phân khu Cọ Xanh · Vinhomes Ocean Park 2 (The Empire) — căn góc
 * Nguồn: ảnh mặt bằng tầng 1–5 + bảng DTXD (docs/drawings/mrc-lk3d3/).
 *
 * Bản vẽ không ghi kích thước; đo pixel bằng skill tao-can-3d và hiệu chỉnh theo DTXD:
 *  - Ảnh T1–T2: 71,2 px/m (ảnh T1 bị kéo giãn ngang: 74,4 px/m theo x). Ảnh T3–T5: ~74,3 px/m.
 *  - Nhà rộng 5,0 m, sâu 12,55 m → T1: 62,75 m² (DTXD 62,8)
 *  - T2: 62,75 + ban công trước 0,9 m + sau 0,65 m = 70,5 m² (DTXD 70,0)
 *  - T3: 62,75 + cửa sổ lồi ≈ 3,0 m² = 65,8 m² (DTXD 66,2)
 *  - T4: 62,75 m² (DTXD 63,7)
 *  - T5: phần có mái d 2,16 → 8,29 = 30,7 m² (DTXD 34,0 — bảng tính cả phần "áp mái")
 *  - Căn góc: sân hông trái ~2,0 m, tường trái có cửa sổ ở mọi tầng.
 * Lõi thang sát tường phải (x 2,04 → 4,89, d 6,18 → 8,05), hành lang bên trái
 * → thang chữ U lật: chiếu nghỉ bên phải (landingSide "R").
 * Cao tầng không có mặt cắt → ước lượng 3,6 / 3,3 / 3,3 / 3,3 / 3,2 m.
 */

const W = 5.0;
const XI = 0.11; // mặt trong tường trái
const XR = W - 0.11; // mặt trong tường phải
const SX0 = 2.04; // mép trái lõi thang
const LAND = 0.85; // chiếu nghỉ (phía phải)
const SXL = XR - LAND; // 4,04: chỗ chiếu nghỉ bắt đầu
const S0 = 6.18; // d trước lõi thang
const S1 = 8.05; // d sau lõi thang
const DM = (S0 + S1) / 2;
const WL = 1.71; // vách trái khối WC tầng 2–4
const BACK = 12.55;
const BI = BACK - 0.2; // mặt trong tường sau

const LEVELS = [0, 3.6, 6.9, 10.2, 13.5];
const STEPS = 10;
const LANDING_T1 = (LEVELS[1] * (STEPS + 1)) / (2 * STEPS + 1); // ≈1,89 m
const T1_CEIL = LEVELS[1] - 0.15;

const win = (from: number, to: number, bottom = 0.9, top = 2.4): Opening => ({ from, to, bottom, top, type: "window" });
const door = (from: number, to: number, top = 2.2): Opening => ({ from, to, bottom: 0, top, type: "door" });

/** Vách quanh lõi thang tầng 2–4: sau lõi thang + vách giữa 2 vế (thấp, không chạm chiếu nghỉ). */
const stairBack: Wall = { axis: "x", from: SX0, to: XR, at: [S1, S1 + 0.1] };
const stairMid: Wall = { axis: "x", from: SX0, to: SXL, at: [DM - 0.04, DM + 0.04], height: 1.1 };

/** Khối WC trước lõi thang (tầng 2–4): x 1,8 → 4,89, d 4,61 → 6,07; cửa ở vách trái. */
const wcBlockWalls: Wall[] = [
  { axis: "x", from: WL, to: XR, at: [6.07, S0] }, // giữa WC và lõi thang
  {
    axis: "d",
    from: 4.61,
    to: 6.07,
    at: [WL, WL + 0.09],
    tiled: true,
    openings: [door(4.75, 5.4, 2.1)],
  },
];

const wcFurniture = [
  { kind: "shower" as const, rect: [3.87, XR, 4.61, 6.07] as [number, number, number, number], facing: "L" as const },
  { kind: "wc" as const, rect: [3.0, 3.45, 5.45, 6.07] as [number, number, number, number], facing: "B" as const },
  { kind: "basin" as const, rect: [1.9, 2.5, 5.62, 6.07] as [number, number, number, number], facing: "B" as const },
];

const wcRoom = { name: "WC", kind: "w" as const, rect: [WL + 0.09, XR, 4.61, 6.07] as [number, number, number, number] };

export const MRC_LK3D3: HouseModel = {
  id: "mrc-lk3d3",
  name: "Liền kề MRC-LK3D.3 · Cọ Xanh",
  shortName: "Cọ Xanh MRC-LK3D.3",
  code: "MRC-LK3D.3",
  zone: "Phân khu Cọ Xanh",
  project: "Vinhomes Ocean Park 2 · The Empire",
  width: W,
  levels: LEVELS,
  roofY: 16.7,
  topY: 17.3,
  groundY: -0.45,
  lot: [-0.8, 14.6],
  sideYard: { side: "L", width: 2.0 },
  frontSteps: [0.6, 4.55, -0.7, 0],
  stair: { rect: [SX0, XR, S0, S1], landing: LAND, steps: STEPS, landingSide: "R" },
  specs: ["Nhà 5,0 × 12,55 m", "Căn góc · sân hông 2 m", "5 tầng · thang bộ chữ U", "3 phòng ngủ · 4 WC"],
  estimated: true,
  totalGrossArea: 296.7,
  listingHref: "/quy-can?du-an=ocp2&phan-khu=co-xanh&loai=Li%E1%BB%81n%20k%E1%BB%81",
  note:
    "Toạ độ đo từ ảnh mặt bằng và hiệu chỉnh theo DTXD công bố (sai số khoảng ±10 cm). Chiều cao tầng là ước lượng vì chưa có mặt cắt. DTXD tầng 5 trên bảng (34 m²) gồm cả phần áp mái nên lớn hơn phần phòng có mái trong mô hình.",
  floors: [
    {
      name: "Tầng 1",
      title: "Phòng khách, bếp + ăn",
      description:
        "Cửa kính lớn mặt tiền mở vào phòng khách, sofa dọc tường phải, kệ tivi tường trái. Hành lang bên trái nối ra bếp; lõi thang sát tường phải, vế đầu đi lên từ phía hành lang. WC (chậu rửa + bồn cầu) nằm dưới vế 2 và chiếu nghỉ, cửa ra phía bếp. Bếp chữ I dọc tường phải, bàn ăn 4 ghế cạnh cửa sổ hông; cửa kính trượt ra sân sau.",
      front: 0,
      back: BACK,
      grossArea: 62.8,
      frontOpenings: [door(1.1, 3.9, 2.7), win(0.3, 1.0, 0.5, 2.7), win(4.0, 4.7, 0.5, 2.7)],
      backOpenings: [door(1.3, 3.75, 2.5)],
      leftOpenings: [win(0.35, 1.3, 0.4, 2.7), win(3.15, 5.65, 0.4, 2.7), win(6.2, 7.6, 0.4, 2.7), win(7.85, 9.3, 0.4, 2.7), win(11.15, 12.05, 0.4, 2.7)],
      walls: [
        // Vách trước lõi thang (giáp phòng khách); lối lên thang từ hành lang bên trái
        { axis: "x", from: SX0, to: XR, at: [6.07, S0] },
        // Vách giữa vế 1 và WC (dưới vế 2): mép trên chéo theo mặt dưới vế 2,
        // vế 2 đi lên từ chiếu nghỉ (x 4,04) về phía hành lang (x 2,04)
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
        // Vách trái phần chậu rửa của WC (giáp hành lang), dưới vế 2 — bản vẽ: cột x≈365px, d 7,0 → 7,94
        { axis: "d", from: DM + 0.045, to: S1, at: [SX0 - 0.08, SX0], tiled: true },
        // Vách trái phần bồn cầu (dưới chiếu nghỉ) — thấp hơn đáy chiếu nghỉ
        { axis: "d", from: S0, to: DM - 0.045, at: [SXL - 0.08, SXL], height: LANDING_T1 - 0.17, tiled: true },
        // Vách sau WC (giáp bếp), cửa vào WC
        { axis: "x", from: SX0, to: XR, at: [S1, S1 + 0.1], tiled: true, openings: [door(3.0, 3.64, 2.1)] },
      ],
      rooms: [
        { name: "Phòng khách", kind: "r", rect: [XI, XR, 0.25, 6.07] },
        { name: "Hành lang", kind: "h", rect: [XI, SX0, 6.07, S1 + 0.1] },
        { name: "Thang", kind: "h", rect: [SX0, SXL, S0, DM - 0.045] },
        // WC chữ L dưới thang → ghi diện tích thủ công (tự tính sẽ bị trừ lõi thang)
        { name: "WC", kind: "w", rect: [SX0, SXL, DM + 0.045, S1], area: 1.8 },
        { name: "WC", kind: "w", rect: [SXL, XR, S0, S1], area: 1.6 },
        { name: "Bếp + ăn", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "sofa", rect: [4.25, XR, 2.3, 4.4], facing: "R" },
        { kind: "arm", rect: [3.15, 3.75, 4.55, 5.1], facing: "B" },
        { kind: "arm", rect: [3.15, 3.75, 1.65, 2.2], facing: "F" },
        { kind: "ctab", rect: [3.2, 3.75, 2.9, 3.85] },
        { kind: "tv", rect: [XI, 0.45, 2.3, 4.45], facing: "L" },
        { kind: "plant", rect: [4.45, 4.85, 4.75, 5.15] },
        { kind: "plant", rect: [4.45, 4.85, 1.75, 2.15] },
        { kind: "kit", rect: [4.3, XR, 8.75, 12.3], facing: "R" },
        { kind: "fridge", rect: [4.25, XR, S1 + 0.1, 8.75] },
        { kind: "dtab", rect: [0.5, 1.6, 10.4, 11.3] },
        { kind: "basin", rect: [2.1, 2.6, 7.35, 7.95], facing: "L" },
        { kind: "wc", rect: [4.3, 4.75, 7.4, S1], facing: "B" },
      ],
    },
    {
      name: "Tầng 2",
      title: "Phòng sinh hoạt chung, phòng ngủ, WC",
      description:
        "Phòng ngủ phía trước nhìn ra ban công mặt tiền, tủ áo ngăn với hành lang. Hành lang dọc tường trái (có cửa sổ hông) dẫn qua WC — buồng tắm kính sát tường phải — tới lõi thang và phòng sinh hoạt chung phía sau, mở ra ban công sau.",
      front: 0,
      back: BACK,
      grossArea: 70.0,
      frontOpenings: [door(1.3, 3.7, 2.4)],
      backOpenings: [door(1.3, 3.7, 2.4)],
      leftOpenings: [win(0.25, 2.95), win(4.0, 4.95), win(6.35, 6.95), win(7.85, 8.8), win(9.75, 12.0)],
      walls: [
        stairBack,
        stairMid,
        ...wcBlockWalls,
        // Vách phòng ngủ trước | hành lang + WC, cửa phòng ở phía hành lang
        { axis: "x", from: XI, to: XR, at: [4.49, 4.61], openings: [door(0.7, 1.52)] },
      ],
      balconies: [
        { rect: [0, W, -0.9, 0], rails: ["F", "L", "R"] },
        { rect: [0, W, BACK, BACK + 0.65], rails: ["B", "L", "R"] },
      ],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, -0.9, 0] },
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, XR, 0.25, 4.49] },
        wcRoom,
        { name: "Hành lang", kind: "h", rect: [XI, WL, 4.61, S1 + 0.1] },
        { name: "Hành lang", kind: "h", rect: [WL, SX0, S0, S1 + 0.1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "P. sinh hoạt chung", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
        { name: "Ban công sau", kind: "o", rect: [XI, XR, BACK, BACK + 0.65] },
      ],
      furniture: [
        { kind: "bed", rect: [2.85, XR, 1.45, 3.05], facing: "R" },
        { kind: "ward", rect: [WL, XR, 3.93, 4.49], facing: "B" },
        { kind: "tv", rect: [XI, 0.35, 1.4, 3.0], facing: "L" },
        ...wcFurniture,
        { kind: "sofa", rect: [4.3, XR, 9.1, 11.2], facing: "R" },
        { kind: "arm", rect: [3.2, 3.8, 11.35, 11.9], facing: "B" },
        { kind: "arm", rect: [3.2, 3.8, 8.6, 9.1], facing: "F" },
        { kind: "ctab", rect: [3.2, 3.8, 9.6, 10.6] },
        { kind: "tv", rect: [XI, 0.4, 9.4, 11.4], facing: "L" },
        { kind: "plant", rect: [4.45, 4.85, 11.75, 12.15] },
        { kind: "plant", rect: [4.45, 4.85, 8.6, 9.0] },
      ],
    },
    {
      name: "Tầng 3",
      title: "Phòng ngủ cửa sổ lồi, WC riêng, phòng làm việc",
      description:
        "Phòng ngủ phía trước có ô cửa sổ lồi lớn nhô ra mặt tiền, tủ áo và WC riêng (vào từ dải phòng dọc tường trái). Cửa phòng ngủ và cửa phòng làm việc đều mở ra sảnh thang bên trái. Phía sau là phòng làm việc với bàn lớn và góc ghế đọc sách.",
      front: 0,
      back: BACK,
      grossArea: 66.2,
      bay: { x0: 1.09, x1: 3.98, depth: 1.25 },
      frontOpenings: [door(1.09, 3.98, 2.5)],
      backOpenings: [win(1.29, 3.7)],
      leftOpenings: [win(3.18, 3.98), win(5.05, 5.85), win(7.05, 7.84), win(8.92, 9.7)],
      walls: [
        stairBack,
        stairMid,
        ...wcBlockWalls,
        // Vách trước lõi thang chạy hết bề ngang, cửa phòng ngủ ở phía trái
        { axis: "x", from: XI, to: WL, at: [6.07, S0], openings: [door(0.69, 1.51)] },
        // Vách tủ áo | WC (phòng ngủ thông với dải dọc tường trái)
        { axis: "x", from: WL, to: XR, at: [4.49, 4.61] },
        // Vách phòng làm việc, cửa ở phía trái
        { axis: "x", from: XI, to: SX0, at: [S1, S1 + 0.1], openings: [door(0.73, 1.49)] },
      ],
      rooms: [
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, XR, 0.25, 4.49] },
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, WL, 4.49, 6.07] },
        { name: "Phòng ngủ 2", kind: "r", rect: [1.09, 3.98, -1.25, 0], area: 3.0 },
        wcRoom,
        { name: "Sảnh thang", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Phòng làm việc", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "bed", rect: [2.85, XR, 1.13, 2.88], facing: "R" },
        { kind: "ward", rect: [WL, XR, 3.93, 4.49], facing: "B" },
        { kind: "tv", rect: [XI, 0.35, 1.7, 2.9], facing: "L" },
        { kind: "plant", rect: [2.3, 2.7, -0.95, -0.55] },
        ...wcFurniture,
        { kind: "plant", rect: [0.15, 0.55, 6.9, 7.3] },
        { kind: "desk", rect: [3.04, 3.6, 9.3, 11.0] },
        { kind: "chair", rect: [3.65, 4.0, 10.0, 10.4] },
        { kind: "arm", rect: [0.85, 1.45, 11.1, 11.7], facing: "B" },
        { kind: "ctab", rect: [1.6, 2.0, 11.4, 11.8] },
      ],
    },
    {
      name: "Tầng 4",
      title: "Hai phòng ngủ, WC chung",
      description:
        "Hai phòng ngủ trước và sau, mỗi phòng có dải tủ áo. Hành lang dọc tường trái dẫn từ sảnh thang tới cửa phòng ngủ trước và cửa WC (buồng tắm kính sát tường phải).",
      front: 0,
      back: BACK,
      grossArea: 63.7,
      frontOpenings: [win(1.29, 3.7)],
      backOpenings: [win(1.29, 3.7)],
      leftOpenings: [win(3.18, 3.98), win(5.05, 5.85), win(7.05, 7.84), win(8.92, 9.7)],
      walls: [
        stairBack,
        stairMid,
        ...wcBlockWalls,
        { axis: "x", from: XI, to: XR, at: [4.49, 4.61], openings: [door(0.73, 1.52)] },
        { axis: "x", from: XI, to: SX0, at: [S1, S1 + 0.1], openings: [door(0.69, 1.56)] },
      ],
      rooms: [
        { name: "Phòng ngủ 3", kind: "r", rect: [XI, XR, 0.25, 4.49] },
        wcRoom,
        { name: "Hành lang", kind: "h", rect: [XI, WL, 4.61, S0] },
        { name: "Hành lang", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Phòng ngủ 4", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "bed", rect: [2.85, XR, 1.13, 2.88], facing: "R" },
        { kind: "ward", rect: [WL, XR, 3.93, 4.49], facing: "B" },
        { kind: "tv", rect: [XI, 0.35, 1.7, 2.9], facing: "L" },
        ...wcFurniture,
        { kind: "plant", rect: [0.15, 0.55, 5.4, 5.8] },
        { kind: "plant", rect: [0.15, 0.55, 6.9, 7.3] },
        { kind: "ward", rect: [WL, XR, S1 + 0.1, 8.75], facing: "F" },
        { kind: "bed", rect: [2.85, XR, 9.8, 11.55], facing: "R" },
        { kind: "tv", rect: [XI, 0.35, 9.9, 11.3], facing: "L" },
      ],
    },
    {
      name: "Tầng 5",
      title: "Phòng đa năng, sân trước & sân sau",
      description:
        "Phần có mái gồm sảnh thang và phòng đa năng phía trước lõi thang. Cửa đôi ra sân trước và sân sau; sân sau đặt bồn nước, máy nước nóng năng lượng mặt trời và dàn nóng điều hoà.",
      front: 2.16,
      back: 8.29,
      roofed: [2.16, 8.29],
      grossArea: 34.0,
      frontOpenings: [door(0.63, 1.73), win(1.84, 4.4, 1.0, 2.2)],
      backOpenings: [door(0.7, 1.77), win(3.2, 4.38, 1.0, 2.2)],
      leftOpenings: [win(5.05, 5.8)],
      walls: [
        stairMid,
        // Vách phòng đa năng | sảnh thang, cửa phía trái
        { axis: "x", from: XI, to: XR, at: [6.06, S0], openings: [door(0.34, 1.22)] },
        // Tường chắn sân trước (d 0 → 2,16) và sân sau (d 8,29 → 12,55)
        { axis: "x", from: 0, to: W, at: [0, 0.11], height: 1.1 },
        { axis: "d", from: 0.11, to: 2.16, at: [0, XI], height: 1.1 },
        { axis: "d", from: 0.11, to: 2.16, at: [XR, W], height: 1.1 },
        { axis: "x", from: 0, to: W, at: [BACK - 0.11, BACK], height: 1.1 },
        { axis: "d", from: 8.29, to: BACK - 0.11, at: [0, XI], height: 1.1 },
        { axis: "d", from: 8.29, to: BACK - 0.11, at: [XR, W], height: 1.1 },
      ],
      rooms: [
        { name: "Sân trước", kind: "o", rect: [XI, XR, 0.11, 2.16] },
        { name: "Phòng đa năng", kind: "r", rect: [XI, XR, 2.36, 6.06] },
        { name: "Sảnh thang", kind: "h", rect: [XI, SX0, S0, 8.09] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Sân sau", kind: "o", rect: [XI, XR, 8.29, BACK - 0.11] },
      ],
      furniture: [
        { kind: "tank", rect: [2.45, 3.2, 10.3, 11.2] },
        { kind: "ac", rect: [2.45, 3.25, 11.9, 12.4] },
        { kind: "shelf", rect: [3.4, 4.85, 10.5, 12.4], height: 0.9 },
      ],
    },
  ],
};
