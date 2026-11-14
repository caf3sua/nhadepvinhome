import type { HouseModel, Wall } from "@/lib/house3d/types";

/*
 * Liền kề VN-LKB-M1 · phân khu Chà Là · Vinhomes Ocean Park 2 (The Empire)
 * Nguồn: ảnh mặt bằng tầng 1–5 + bảng DTXD (docs/drawings/vn-lkb-m1/).
 *
 * Bản vẽ không ghi kích thước nên toạ độ được đo từ pixel ảnh và hiệu chỉnh
 * theo DTXD đã công bố:
 *  - Rộng nhà 4,0 m (tường ngoài) → T1: 4,0 × 13,7 = 54,8 m² (DTXD 54,9)
 *  - T2: 4,0 × 14,15 + ban công 0,95 + 0,80 m = 63,6 m² (DTXD 63,5)
 *  - T5: phần có mái d 6,04 → 14,15 = 32,4 m² (DTXD 32,3)
 * Cao tầng không có mặt cắt → ước lượng 3,6 / 3,3 / 3,3 / 3,3 / 3,2 m.
 */

const W = 4.0;
// Lõi thang & WC: x 0,11 → 2,65 (tường phải WC 2,65 → 2,75); hành lang x 2,75 → 3,89
const XI = 0.11; // mặt trong tường trái
const XR = W - 0.11; // mặt trong tường phải
const XC = 2.65; // mép phải lõi thang / WC
const XC2 = 2.75;

/** Tường bao quanh lõi thang: trước, sau và vách giữa 2 vế. */
const stairWalls: Wall[] = [
  { axis: "x", from: XI, to: XC2, at: [6.18, 6.28] },
  { axis: "x", from: XI, to: XC2, at: [8.21, 8.32] },
  { axis: "x", from: 1.0, to: XC, at: [7.2, 7.28], height: 1.1 },
];

/** Khối WC trước (d 4,67 → 6,18) và WC sau (d 8,32 → 9,84) của tầng 2–3. */
const twoWcWalls: Wall[] = [
  {
    axis: "x",
    from: XI,
    to: XR,
    at: [4.56, 4.67],
    openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }],
  },
  {
    axis: "d",
    from: 4.67,
    to: 6.18,
    at: [XC, XC2],
    tiled: true,
    openings: [{ from: 5.1, to: 5.8, bottom: 0, top: 2.1, type: "door" }],
  },
  {
    axis: "d",
    from: 8.32,
    to: 9.84,
    at: [XC, XC2],
    tiled: true,
    openings: [{ from: 8.6, to: 9.3, bottom: 0, top: 2.1, type: "door" }],
  },
  {
    axis: "x",
    from: XI,
    to: XR,
    at: [9.84, 9.95],
    openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }],
  },
  // Buồng tắm (x 0,11 → 0,95) ngăn với WC bằng vách kính + cửa kính,
  // dựng trong nội thất "shower" — không còn vách gạch ở đây.
];

const wcFurniture = (d0: number, d1: number, toiletAtFront: boolean) => {
  const mid = (d0 + d1) / 2;
  return [
    { kind: "shower" as const, rect: [XI, 0.95, d0, d1] as [number, number, number, number] },
    {
      kind: "wc" as const,
      rect: [1.15, 1.55, toiletAtFront ? d0 : d1 - 0.65, toiletAtFront ? d0 + 0.65 : d1] as [
        number,
        number,
        number,
        number,
      ],
      facing: toiletAtFront ? ("F" as const) : ("B" as const),
    },
    {
      kind: "basin" as const,
      rect: [1.85, 2.5, mid - 0.25, mid + 0.25] as [number, number, number, number],
      facing: "R" as const,
    },
  ];
};

export const VN_LKB_M1: HouseModel = {
  id: "vn-lkb-m1",
  name: "Liền kề VN-LKB-M1 · Chà Là",
  shortName: "Chà Là VN-LKB-M1",
  code: "VN-LKB-M1",
  zone: "Phân khu Chà Là",
  project: "Vinhomes Ocean Park 2 · The Empire",
  width: W,
  levels: [0, 3.6, 6.9, 10.2, 13.5],
  roofY: 16.7,
  topY: 17.5,
  groundY: -0.45,
  lot: [-1.4, 15.6],
  frontSteps: [0.8, 3.2, -0.15, 0.45],
  mansard: { d0: 0, d1: 1.6, height: 2.0 },
  stair: { rect: [XI, XC, 6.28, 8.21], landing: 0.9, steps: 10 },
  specs: ["Nhà 4,0 × 14,15 m", "5 tầng · thang bộ chữ U", "4 phòng ngủ · 5 WC", "Mẫu đối xứng"],
  estimated: true,
  totalGrossArea: 264.2,
  listingHref: "/quy-can?du-an=ocp2&phan-khu=cha-la&loai=Li%E1%BB%81n%20k%E1%BB%81",
  note:
    "Toạ độ đo từ ảnh mặt bằng và hiệu chỉnh theo DTXD công bố (sai số khoảng ±10 cm). Chiều cao tầng là ước lượng vì chưa có mặt cắt.",
  floors: [
    {
      name: "Tầng 1",
      title: "Phòng khách, bếp & ăn",
      description:
        "Cửa chính lùi vào 0,45 m so với tầng trên, có bậc tam cấp. Phòng khách phía trước, sofa dọc tường trái. Giữa nhà là thang chữ U, vế đầu mở thẳng ra phòng khách; WC nằm dưới vế thang thứ hai, cửa ra hành lang bên phải. Bếp chữ I dọc tường trái và bàn ăn 6 ghế phía sau, cửa đôi ra sân sau.",
      front: 0.45,
      back: 14.15,
      grossArea: 54.9,
      frontOpenings: [
        { from: 1.45, to: 2.55, bottom: 0, top: 2.6, type: "door" },
        { from: 0.35, to: 1.3, bottom: 0.5, top: 2.6, type: "window" },
        { from: 2.7, to: 3.65, bottom: 0.5, top: 2.6, type: "window" },
      ],
      backOpenings: [
        { from: 1.4, to: 2.55, bottom: 0, top: 2.5, type: "door" },
        { from: 2.9, to: 3.6, bottom: 1.0, top: 2.3, type: "window" },
      ],
      walls: [
        // T1: vế thang 1 mở thẳng ra phòng khách (bản vẽ chỉ có đoạn vách ngắn
        // 0,8 m sát tường trái ở mép trước lõi thang), chỉ giữ vách phía bếp.
        { axis: "x", from: XI, to: 0.92, at: [6.18, 6.28] },
        stairWalls[1],
        // T1: WC nằm ở dải sau, dưới vế thang 2. Vách giữa WC và vế 1:
        //  - dưới chiếu nghỉ (x 0,11 → 1,0) chỉ cao 1,72 m để đi từ chiếu nghỉ sang vế 2;
        //  - từ x 1,0 trở ra hành lang, mép trên chạy chéo theo mặt dưới vế 2
        //    (từ cao độ chiếu nghỉ ≈1,89 m lên tới trần 3,45 m) để che kín WC.
        {
          axis: "x",
          from: XI,
          to: XC2,
          at: [7.2, 7.3],
          tiled: true,
          profile: [
            [XI, 0],
            [XC2, 0],
            [XC2, 3.45],
            [1.0, 1.89],
            [1.0, 1.72],
            [XI, 1.72],
          ],
        },
        {
          axis: "d",
          from: 7.3,
          to: 8.21,
          at: [XC, XC2],
          tiled: true,
          openings: [{ from: 7.4, to: 8.1, bottom: 0, top: 2.0, type: "door" }],
        },
      ],
      rooms: [
        { name: "Phòng khách", kind: "r", rect: [XI, XR, 0.67, 6.18] },
        { name: "Thang", kind: "h", rect: [XI, XC, 6.28, 7.2] },
        // WC nằm dưới vế thang 2 → không trừ phần chồng lõi thang, ghi diện tích trực tiếp
        { name: "WC", kind: "w", rect: [XI, XC, 7.3, 8.21], area: 2.3 },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, 6.18, 8.32] },
        { name: "Bếp & ăn", kind: "r", rect: [XI, XR, 8.32, 13.95] },
      ],
      furniture: [
        { kind: "sofa", rect: [XI, 0.95, 2.55, 4.85], facing: "L" },
        { kind: "arm", rect: [1.55, 2.2, 1.6, 2.25], facing: "F" },
        { kind: "arm", rect: [1.55, 2.2, 5.0, 5.65], facing: "B" },
        { kind: "ctab", rect: [1.45, 2.15, 3.1, 4.3] },
        { kind: "tv", rect: [3.6, XR, 2.8, 4.6], facing: "R" },
        { kind: "plant", rect: [0.25, 0.65, 1.95, 2.35] },
        { kind: "plant", rect: [0.25, 0.65, 5.15, 5.55] },
        { kind: "kit", rect: [XI, 0.71, 9.45, 12.8], facing: "L" },
        { kind: "fridge", rect: [XI, 0.81, 8.85, 9.45] },
        { kind: "dtab", rect: [1.75, 2.6, 11.1, 12.65] },
        { kind: "wc", rect: [0.25, 0.65, 7.35, 7.95], facing: "L" },
        { kind: "basin", rect: [1.9, 2.5, 7.35, 7.75], facing: "F" },
      ],
    },
    {
      name: "Tầng 2",
      title: "Hai phòng ngủ đối xứng, mỗi phòng 1 WC",
      description:
        "Hai phòng ngủ đối xứng qua lõi thang: phòng trước nhìn ra ban công mặt tiền, phòng sau ra ban công sau. Mỗi phòng có WC riêng kẹp hai bên lõi thang, cửa vào từ hành lang bên phải.",
      front: 0,
      back: 14.15,
      grossArea: 63.5,
      frontOpenings: [{ from: 1.15, to: 2.85, bottom: 0, top: 2.4, type: "door" }],
      backOpenings: [{ from: 1.15, to: 2.85, bottom: 0, top: 2.4, type: "door" }],
      walls: [...stairWalls, ...twoWcWalls],
      balconies: [
        { rect: [0, W, -0.95, 0], rails: ["F", "L", "R"] },
        { rect: [0, W, 14.15, 14.95], rails: ["B", "L", "R"] },
      ],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, -0.95, 0] },
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, XR, 0.25, 4.56] },
        { name: "WC 1", kind: "w", rect: [XI, XC, 4.67, 6.18] },
        { name: "Thang", kind: "h", rect: [XI, XC, 6.28, 8.21] },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, 4.67, 9.84] },
        { name: "WC 2", kind: "w", rect: [XI, XC, 8.32, 9.84] },
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, XR, 9.95, 13.95] },
        { name: "Ban công sau", kind: "o", rect: [XI, XR, 14.15, 14.95] },
      ],
      furniture: [
        { kind: "bed", rect: [XI, 2.3, 2.15, 3.95], facing: "L" },
        { kind: "ward", rect: [XI, 2.0, 3.98, 4.56], facing: "B" },
        { kind: "desk", rect: [3.45, XR, 0.9, 2.4], facing: "R" },
        { kind: "chair", rect: [3.0, 3.4, 1.4, 1.8] },
        { kind: "ac", rect: [0.3, 1.0, -0.75, -0.35] },
        ...wcFurniture(4.67, 6.18, false),
        ...wcFurniture(8.32, 9.84, true),
        { kind: "bed", rect: [XI, 2.3, 11.05, 12.85], facing: "L" },
        { kind: "ward", rect: [XI, 2.0, 9.95, 10.5], facing: "F" },
        { kind: "desk", rect: [3.45, XR, 11.6, 13.1], facing: "R" },
        { kind: "chair", rect: [3.0, 3.4, 12.1, 12.5] },
        { kind: "plant", rect: [3.3, 3.7, 14.35, 14.75] },
      ],
    },
    {
      name: "Tầng 3",
      title: "Phòng ngủ cửa sổ lồi, phòng làm việc",
      description:
        "Phòng ngủ phía trước có ô cửa sổ lồi (bay window) nhô ra mặt tiền. Bố trí 2 WC kẹp lõi thang giống tầng 2. Phía sau là phòng làm việc với bàn lớn và góc đọc sách.",
      front: 0,
      back: 14.15,
      grossArea: 58.7,
      bay: { x0: 0.6, x1: 3.4, depth: 0.8 },
      frontOpenings: [{ from: 0.6, to: 3.4, bottom: 0, top: 2.5, type: "door" }],
      backOpenings: [{ from: 0.6, to: 3.4, bottom: 0.9, top: 2.4, type: "window" }],
      walls: [...stairWalls, ...twoWcWalls],
      rooms: [
        { name: "Phòng ngủ 3", kind: "r", rect: [XI, XR, 0.25, 4.56] },
        { name: "Phòng ngủ 3", kind: "r", rect: [0.6, 3.4, -0.8, 0], area: 2.1 },
        { name: "WC 3", kind: "w", rect: [XI, XC, 4.67, 6.18] },
        { name: "Thang", kind: "h", rect: [XI, XC, 6.28, 8.21] },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, 4.67, 9.84] },
        { name: "WC 4", kind: "w", rect: [XI, XC, 8.32, 9.84] },
        { name: "Phòng làm việc", kind: "r", rect: [XI, XR, 9.95, 13.95] },
      ],
      furniture: [
        { kind: "bed", rect: [XI, 2.15, 1.2, 2.85], facing: "L" },
        { kind: "ward", rect: [XI, 2.0, 4.0, 4.56], facing: "B" },
        { kind: "tv", rect: [3.6, XR, 1.3, 2.7], facing: "R" },
        { kind: "plant", rect: [1.8, 2.2, -0.6, -0.2] },
        ...wcFurniture(4.67, 6.18, false),
        ...wcFurniture(8.32, 9.84, true),
        { kind: "desk", rect: [1.25, 2.0, 11.0, 12.9] },
        { kind: "chair", rect: [0.6, 1.0, 11.6, 12.0] },
        { kind: "arm", rect: [2.8, 3.45, 12.95, 13.6], facing: "B" },
        { kind: "ctab", rect: [2.55, 2.95, 12.5, 12.9] },
        { kind: "shelf", rect: [XI, 0.45, 10.2, 13.6], facing: "L", height: 2.0 },
      ],
    },
    {
      name: "Tầng 4",
      title: "Phòng ngủ master, phòng thay đồ",
      description:
        "Phòng ngủ master phía trước, lùi sau lô gia đặt cục nóng điều hoà. Một WC sau lõi thang. Phía sau là phòng thay đồ với tủ dọc tường trái, tủ ngang và bàn trang điểm.",
      front: 0.98,
      back: 14.15,
      grossArea: 54.9,
      frontOpenings: [
        { from: 0.35, to: 1.75, bottom: 0, top: 2.4, type: "door" },
        { from: 2.25, to: 3.65, bottom: 0, top: 2.4, type: "door" },
      ],
      backOpenings: [{ from: 0.6, to: 3.4, bottom: 0.9, top: 2.4, type: "window" }],
      walls: [
        ...stairWalls,
        {
          axis: "x",
          from: XC2,
          to: XR,
          at: [5.75, 5.85],
          openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }],
        },
        { axis: "d", from: 5.85, to: 6.18, at: [XC, XC2] },
        twoWcWalls[2],
        twoWcWalls[3],
      ],
      balconies: [{ rect: [0, W, 0, 0.98], rails: ["F"] }],
      rooms: [
        { name: "Lô gia", kind: "o", rect: [XI, XR, 0, 0.98] },
        { name: "Phòng ngủ master", kind: "r", rect: [XI, XR, 1.15, 5.75] },
        { name: "Phòng ngủ master", kind: "r", rect: [XI, XC, 5.75, 6.18] },
        { name: "Thang", kind: "h", rect: [XI, XC, 6.28, 8.21] },
        { name: "Hành lang", kind: "h", rect: [XC2, XR, 5.85, 9.84] },
        { name: "WC 5", kind: "w", rect: [XI, XC, 8.32, 9.84] },
        { name: "Phòng thay đồ", kind: "r", rect: [XI, XR, 9.95, 13.95] },
      ],
      furniture: [
        { kind: "ac", rect: [1.75, 2.2, 0.2, 0.75] },
        { kind: "ac", rect: [3.6, 3.85, 0.2, 0.75] },
        { kind: "bed", rect: [XI, 2.2, 2.85, 4.5], facing: "L" },
        { kind: "ward", rect: [3.35, XR, 1.4, 4.4], facing: "R" },
        { kind: "chair", rect: [2.8, 3.2, 2.0, 2.4] },
        { kind: "ward", rect: [0.83, XC, 5.78, 6.18], facing: "B" },
        ...wcFurniture(8.32, 9.84, true),
        { kind: "ward", rect: [XI, 0.6, 10.5, 13.9], facing: "L" },
        { kind: "ward", rect: [0.75, 2.6, 9.95, 10.45], facing: "F" },
        { kind: "ctab", rect: [1.3, 1.75, 11.5, 13.2], height: 0.9 },
        { kind: "desk", rect: [3.35, XR, 12.0, 13.5], facing: "R" },
        { kind: "chair", rect: [2.9, 3.3, 12.6, 13.0] },
      ],
    },
    {
      name: "Tầng 5",
      title: "Phòng đa năng, sân thượng",
      description:
        "Phần có mái gồm sảnh thang và phòng đa năng (tập thể thao, giải trí) phía sau. Phía trước là sân thượng để máy giặt, bồn nước, được che bởi mái ngói mansard trên mặt tiền.",
      front: 6.04,
      back: 14.15,
      roofed: [6.04, 14.15],
      grossArea: 32.3,
      frontOpenings: [
        { from: 2.85, to: 3.7, bottom: 0, top: 2.2, type: "door" },
        { from: 0.5, to: 2.3, bottom: 1.0, top: 2.2, type: "window" },
      ],
      backOpenings: [{ from: 0.6, to: 3.4, bottom: 0.9, top: 2.4, type: "window" }],
      walls: [
        stairWalls[1],
        stairWalls[2],
        {
          axis: "x",
          from: XC2,
          to: XR,
          at: [8.21, 8.32],
          openings: [{ from: 2.9, to: 3.7, bottom: 0, top: 2.2, type: "door" }],
        },
        // Tường chắn sân thượng hai bên
        { axis: "d", from: 1.6, to: 6.04, at: [0, XI], height: 1.2 },
        { axis: "d", from: 1.6, to: 6.04, at: [XR, W], height: 1.2 },
      ],
      rooms: [
        { name: "Sân thượng", kind: "o", rect: [XI, XR, 1.6, 6.04] },
        { name: "Thang", kind: "h", rect: [XI, XC, 6.28, 8.21] },
        { name: "Sảnh", kind: "h", rect: [XC2, XR, 6.24, 8.21] },
        { name: "Phòng đa năng", kind: "r", rect: [XI, XR, 8.32, 13.95] },
      ],
      furniture: [
        { kind: "gym", rect: [0.6, 1.2, 11.1, 11.7] },
        { kind: "gym", rect: [2.8, 3.4, 11.1, 11.7] },
        { kind: "tank", rect: [3.2, 3.8, 2.0, 2.9] },
        { kind: "wash", rect: [2.35, 2.95, 2.1, 2.7] },
        { kind: "basin", rect: [1.45, 2.0, 2.2, 2.6], facing: "F" },
        { kind: "plant", rect: [0.3, 0.7, 5.4, 5.8] },
      ],
    },
  ],
};
