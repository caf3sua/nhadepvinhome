import type { HouseModel, Wall } from "@/lib/house3d/types";

/*
 * MẪU FILE DỮ LIỆU CĂN 3D — copy sang src/data/houses3d/<id>.ts rồi sửa.
 * Đây là khung liền kề 5 tầng, thang chữ U giữa nhà, 2 WC kẹp lõi thang ở tầng 2–4.
 * Mọi số dưới đây là VÍ DỤ — thay bằng số đo từ bản vẽ (xem SKILL.md mục 2).
 *
 * <Tên mẫu> · phân khu <…> · <dự án>
 * Nguồn: docs/drawings/<id>/ (ảnh mặt bằng tầng 1–5 + bảng DTXD)
 * Đối chiếu DTXD:
 *  - T1: <rộng> × <sâu> = … m² (DTXD …)
 *  - T2: … + ban công … = … m² (DTXD …)
 * Cao tầng: <theo mặt cắt | ước lượng 3,6 / 3,3 / 3,3 / 3,3 / 3,2 m>
 */

const W = 4.0; // bề rộng nhà (mặt ngoài tường)
const XI = 0.11; // mặt trong tường trái
const XR = W - 0.11; // mặt trong tường phải
const XC = 2.65; // mép phải lõi thang / WC
const XC2 = 2.75; // mặt ngoài vách phải WC (bắt đầu hành lang)

// Lõi thang (giống nhau mọi tầng) — d trước / sau của lõi
const S0 = 6.28;
const S1 = 8.21;

/** Vách bao lõi thang tầng trên: trước, sau, vách giữa 2 vế (cao 1,1 m). */
const stairWalls: Wall[] = [
  { axis: "x", from: XI, to: XC2, at: [S0 - 0.1, S0] },
  { axis: "x", from: XI, to: XC2, at: [S1, S1 + 0.11] },
  { axis: "x", from: 1.0, to: XC, at: [(S0 + S1) / 2 - 0.04, (S0 + S1) / 2 + 0.04], height: 1.1 },
];

/** Bộ nội thất WC: buồng tắm kính (sát tường trái) + bồn cầu + chậu rửa. */
const wc = (d0: number, d1: number, toiletAtFront: boolean) => {
  const mid = (d0 + d1) / 2;
  return [
    { kind: "shower" as const, rect: [XI, 0.95, d0, d1] as [number, number, number, number] },
    {
      kind: "wc" as const,
      rect: [1.15, 1.55, toiletAtFront ? d0 : d1 - 0.65, toiletAtFront ? d0 + 0.65 : d1] as [number, number, number, number],
      facing: toiletAtFront ? ("F" as const) : ("B" as const),
    },
    { kind: "basin" as const, rect: [1.85, 2.5, mid - 0.25, mid + 0.25] as [number, number, number, number], facing: "R" as const },
  ];
};

// Cao độ (ước lượng nếu không có mặt cắt)
const LEVELS = [0, 3.6, 6.9, 10.2, 13.5];
const STEPS = 10;
// Chiếu nghỉ tầng 1: H × (steps+1)/(2·steps+1); đáy chiếu nghỉ thấp hơn ~0,17 m
const LANDING_T1 = (LEVELS[1] * (STEPS + 1)) / (2 * STEPS + 1);
const T1_CEIL = LEVELS[1] - 0.15;

export const TEMPLATE_HOUSE: HouseModel = {
  id: "mau-id",
  name: "Liền kề <MÃ MẪU> · <Phân khu>",
  shortName: "<Phân khu> <MÃ MẪU>",
  code: "<MÃ MẪU>",
  zone: "Phân khu <…>",
  project: "Vinhomes Ocean Park <…>",
  width: W,
  levels: LEVELS,
  roofY: 16.7,
  topY: 17.5,
  groundY: -0.45,
  lot: [-1.4, 15.6],
  frontSteps: [0.8, 3.2, -0.15, 0.45],
  mansard: { d0: 0, d1: 1.6, height: 2.0 },
  stair: { rect: [XI, XC, S0, S1], landing: 0.9, steps: STEPS },
  specs: ["Nhà 4,0 × 14,15 m", "5 tầng · thang bộ chữ U", "4 phòng ngủ · 5 WC"],
  estimated: true,
  totalGrossArea: 0,
  listingHref: "/quy-can?du-an=ocp2&phan-khu=<id-phan-khu>",
  note: "Toạ độ đo từ ảnh mặt bằng và hiệu chỉnh theo DTXD công bố (sai số khoảng ±10 cm). Chiều cao tầng là ước lượng vì chưa có mặt cắt.",
  floors: [
    {
      name: "Tầng 1",
      title: "Phòng khách, bếp & ăn",
      description: "<Mô tả bố trí theo bản vẽ>",
      front: 0.45, // tầng 1 thường lùi vào so với tầng trên
      back: 14.15,
      grossArea: 0,
      frontOpenings: [
        { from: 1.45, to: 2.55, bottom: 0, top: 2.6, type: "door" },
        { from: 0.35, to: 1.3, bottom: 0.5, top: 2.6, type: "window" },
        { from: 2.7, to: 3.65, bottom: 0.5, top: 2.6, type: "window" },
      ],
      backOpenings: [{ from: 1.4, to: 2.55, bottom: 0, top: 2.5, type: "door" }],
      walls: [
        // Vế thang 1 mở ra phòng khách: chỉ giữ đoạn vách ngắn nếu bản vẽ có (đo bằng `runs`)
        { axis: "x", from: XI, to: 0.92, at: [S0 - 0.1, S0] },
        stairWalls[1],
        // Vách WC dưới thang: dưới chiếu nghỉ thấp, phần còn lại chéo theo vế 2 lên trần
        {
          axis: "x",
          from: XI,
          to: XC2,
          at: [7.2, 7.3],
          tiled: true,
          profile: [
            [XI, 0],
            [XC2, 0],
            [XC2, T1_CEIL],
            [1.0, LANDING_T1],
            [1.0, LANDING_T1 - 0.17],
            [XI, LANDING_T1 - 0.17],
          ],
        },
        {
          axis: "d",
          from: 7.3,
          to: S1,
          at: [XC, XC2],
          tiled: true,
          openings: [{ from: 7.4, to: 8.1, bottom: 0, top: 2.0, type: "door" }],
        },
      ],
      rooms: [
        { name: "Phòng khách", kind: "r", rect: [XI, XR, 0.67, S0 - 0.1] },
        { name: "Thang", kind: "h", rect: [XI, XC, S0, 7.2] },
        // WC dưới thang bị trừ lõi thang khi tự tính → ghi area thủ công
        { name: "WC", kind: "w", rect: [XI, XC, 7.3, S1], area: 2.3 },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, S0 - 0.1, S1 + 0.11] },
        { name: "Bếp & ăn", kind: "r", rect: [XI, XR, S1 + 0.11, 13.95] },
      ],
      furniture: [
        { kind: "sofa", rect: [XI, 0.95, 2.55, 4.85], facing: "L" },
        { kind: "ctab", rect: [1.45, 2.15, 3.1, 4.3] },
        { kind: "tv", rect: [3.6, XR, 2.8, 4.6], facing: "R" },
        { kind: "kit", rect: [XI, 0.71, 9.45, 12.8], facing: "L" },
        { kind: "fridge", rect: [XI, 0.81, 8.85, 9.45] },
        { kind: "dtab", rect: [1.75, 2.6, 11.1, 12.65] },
        { kind: "wc", rect: [0.25, 0.65, 7.35, 7.95], facing: "L" },
      ],
    },
    {
      name: "Tầng 2",
      title: "<Tiêu đề tầng>",
      description: "<Mô tả>",
      front: 0,
      back: 14.15,
      grossArea: 0,
      frontOpenings: [{ from: 1.15, to: 2.85, bottom: 0, top: 2.4, type: "door" }],
      backOpenings: [{ from: 1.15, to: 2.85, bottom: 0, top: 2.4, type: "door" }],
      walls: [
        ...stairWalls,
        // Vách phòng trước | WC trước, cửa phòng mở ra hành lang
        { axis: "x", from: XI, to: XR, at: [4.56, 4.67], openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }] },
        { axis: "d", from: 4.67, to: S0 - 0.1, at: [XC, XC2], tiled: true, openings: [{ from: 5.1, to: 5.8, bottom: 0, top: 2.1, type: "door" }] },
        { axis: "d", from: S1 + 0.11, to: 9.84, at: [XC, XC2], tiled: true, openings: [{ from: 8.6, to: 9.3, bottom: 0, top: 2.1, type: "door" }] },
        { axis: "x", from: XI, to: XR, at: [9.84, 9.95], openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }] },
      ],
      balconies: [
        { rect: [0, W, -0.95, 0], rails: ["F", "L", "R"] },
        { rect: [0, W, 14.15, 14.95], rails: ["B", "L", "R"] },
      ],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, -0.95, 0] },
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, XR, 0.25, 4.56] },
        { name: "WC 1", kind: "w", rect: [XI, XC, 4.67, S0 - 0.1] },
        { name: "Thang", kind: "h", rect: [XI, XC, S0, S1] },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, 4.67, 9.84] },
        { name: "WC 2", kind: "w", rect: [XI, XC, S1 + 0.11, 9.84] },
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, XR, 9.95, 13.95] },
        { name: "Ban công sau", kind: "o", rect: [XI, XR, 14.15, 14.95] },
      ],
      furniture: [
        { kind: "bed", rect: [XI, 2.3, 2.15, 3.95], facing: "L" },
        { kind: "ward", rect: [XI, 2.0, 3.98, 4.56], facing: "B" },
        ...wc(4.67, S0 - 0.1, false),
        ...wc(S1 + 0.11, 9.84, true),
        { kind: "bed", rect: [XI, 2.3, 11.05, 12.85], facing: "L" },
      ],
    },
    // Tầng 3, 4: tương tự tầng 2 (cửa sổ lồi → `bay`, lô gia → `front` lùi + `balconies`)
    // Tầng trên cùng: `roofed: [d_đầu_mái, back]`, sân thượng là room kind "o",
    // tường chắn sân thượng là walls axis "d" ở x [0, XI] và [XR, W] cao ~1,2 m.
  ],
};
