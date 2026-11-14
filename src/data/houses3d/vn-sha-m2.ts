import type { HouseModel, Opening, Wall } from "@/lib/house3d/types";

/*
 * Shophouse VN-SHA-M2 · phân khu Chà Là · Vinhomes Ocean Park 2 (The Empire)
 * Nguồn: ảnh mặt bằng tầng 1–5 + bảng DTXD (docs/drawings/vn-sha-m2/).
 *
 * Bản vẽ không ghi kích thước; đo pixel bằng skill tao-can-3d (ảnh T1–T2: 64,6 px/m,
 * ảnh T3–T5: ~61 px/m) và hiệu chỉnh theo DTXD:
 *  - Nhà rộng 5,0 m, các tầng trên sâu 11,8 m.
 *  - T1: lùi 0,45 m so với tầng trên → 5,0 × 11,35 = 56,75 m² (DTXD 60,1 — có thể tính cả hiên dưới tầng 2)
 *  - T2: 59,0 + ban công trước 1,3 m + sau 0,74 m = 69,2 m² (DTXD 69,3)
 *  - T3: 59,0 + cửa sổ lồi ≈ 2,0 m² = 61,0 m² (DTXD 61,6)
 *  - T4: nhà lùi sau lô gia 0,79 m → 55,1 + lô gia 3,9 = 59,0 m² (DTXD 58,8)
 *  - T5: phần có mái d 4,6 → 11,8 = 36,0 m² (DTXD 37,5)
 *
 * CẦU THANG — ảnh tầng 2 vẽ thang không khớp với các tầng còn lại; theo lựa chọn của
 * người dùng ("ưu tiên đi lại được"):
 *  - T1 → T2: thang thẳng dọc tường phải (như ảnh T1), lên tới trước lõi thang tầng 2.
 *  - T2 → T5: lõi thang chữ U giữa nhà như ảnh T3–T5 (x 1,93 → 4,89, d 6,08 → 8,0),
 *    chiếu nghỉ bên phải; ở tầng 2 vế đầu mở thẳng ra phòng khách.
 * Cao tầng không có mặt cắt → ước lượng 3,9 (tầng 1 kinh doanh) / 3,3 / 3,3 / 3,3 / 3,2 m.
 */

const W = 5.0;
const XI = 0.11;
const XR = W - 0.11;
const SX0 = 1.93; // mép trái lõi thang chữ U
const LAND = 0.85;
const SXL = XR - LAND; // 4,04
const S0 = 6.08;
const S1 = 8.0;
const DM = (S0 + S1) / 2;
const BACK = 11.8;
const BI = BACK - 0.2;

const win = (from: number, to: number, bottom = 0.9, top = 2.4): Opening => ({ from, to, bottom, top, type: "window" });
const door = (from: number, to: number, top = 2.2): Opening => ({ from, to, bottom: 0, top, type: "door" });

/** Vách giữa hai vế thang chữ U (thấp, không chạm chiếu nghỉ bên phải). */
const stairMid: Wall = { axis: "x", from: SX0, to: SXL, at: [DM - 0.04, DM + 0.04], height: 1.1 };

// Thang thẳng tầng 1: dọc tường phải, bắt đầu ngay sau cửa (d 0,7) và đi lên một mạch
// tới tầng 2 sát lõi thang chữ U (d 6,08) — lòng bậc ~0,26 m. WC nằm dưới phần cao của thang.
const T1_STAIR_RECT: [number, number, number, number] = [4.0, XR, 0.7, S0];
const T1_STEPS = 21;
const T1_H = 3.9;
/** Cao độ mặt dưới thang tầng 1 tại vị trí d (dưới mép bậc ~0,15 m). */
const t1Underside = (d: number) =>
  ((d - T1_STAIR_RECT[2]) / (T1_STAIR_RECT[3] - T1_STAIR_RECT[2])) * T1_H - 0.15;
const T1_WC_D0 = 3.95; // WC dưới thang từ đây tới cuối thang (đầu còn ~2,1 m)

export const VN_SHA_M2: HouseModel = {
  id: "vn-sha-m2",
  name: "Shophouse VN-SHA-M2 · Chà Là",
  shortName: "Chà Là Shophouse VN-SHA-M2",
  code: "VN-SHA-M2",
  zone: "Phân khu Chà Là",
  project: "Vinhomes Ocean Park 2 · The Empire",
  width: W,
  levels: [0, 3.9, 7.2, 10.5, 13.8],
  roofY: 17.0,
  topY: 17.6,
  groundY: -0.3,
  lot: [-1.5, 12.6],
  frontSteps: [0.3, 4.7, 0.05, 0.45],
  mansard: { d0: -0.3, d1: 1.72, height: 2.0 },
  stair: { rect: [SX0, XR, S0, S1], landing: LAND, steps: 10, landingSide: "R" },
  specs: ["Nhà 5,0 × 11,8 m", "Shophouse 5 tầng · tầng 1 kinh doanh", "4 phòng ngủ · 5 WC", "Mẫu đối xứng"],
  estimated: true,
  totalGrossArea: 287.3,
  listingHref: "/quy-can?du-an=ocp2&phan-khu=cha-la&loai=Shophouse",
  note:
    "Toạ độ đo từ ảnh mặt bằng và hiệu chỉnh theo DTXD công bố (sai số khoảng ±10 cm). Chiều cao tầng là ước lượng. Ảnh tầng 2 vẽ cầu thang không khớp các tầng khác nên mô hình dùng thang thẳng tầng 1 + lõi thang chữ U từ tầng 2 trở lên để đi lại được.",
  floors: [
    {
      name: "Tầng 1",
      title: "Không gian kinh doanh",
      description:
        "Tầng 1 cao để kinh doanh, mặt tiền cửa kính gấp lùi vào 0,45 m dưới ban công tầng 2. Thang thẳng chạy một mạch dọc tường phải từ ngay sau cửa lên tới lõi thang tầng 2; gầm thang được che kín, WC nhỏ nằm dưới phần cao của thang, cửa mở ra phía sau. Phía sau có cửa đi và cửa sổ ra sân sau.",
      front: 0.45,
      back: BACK,
      grossArea: 60.1,
      stairUp: { kind: "straight", rect: T1_STAIR_RECT, dir: "+d", steps: T1_STEPS },
      frontOpenings: [door(0.67, 4.38, 3.0)],
      backOpenings: [win(0.66, 2.06, 1.0, 2.6), door(3.07, 3.85, 2.5)],
      walls: [
        // Vách che gầm thang (phía không gian kinh doanh): chỉ phần DƯỚI thang,
        // mép trên chạy theo mặt dưới bậc — phía trên thang để thoáng.
        {
          axis: "d",
          from: T1_STAIR_RECT[2],
          to: S0,
          at: [3.9, 4.0],
          profile: [
            [T1_STAIR_RECT[2] + 0.2, 0],
            [S0, 0],
            [S0, t1Underside(S0)],
          ],
        },
        // WC dưới thang: vách trước thấp theo mặt dưới thang, vách sau có cửa
        { axis: "x", from: 4.0, to: XR, at: [T1_WC_D0 - 0.1, T1_WC_D0], height: t1Underside(T1_WC_D0), tiled: true },
        { axis: "x", from: 3.9, to: XR, at: [S0, S0 + 0.1], tiled: true, openings: [door(4.1, 4.75, 2.1)] },
      ],
      rooms: [
        { name: "Không gian kinh doanh", kind: "r", rect: [XI, 3.9, 0.67, BI] },
        { name: "Không gian kinh doanh", kind: "r", rect: [3.9, XR, S0 + 0.1, BI] },
        { name: "Thang", kind: "h", rect: [4.0, XR, 0.7, T1_WC_D0 - 0.1] },
        // WC nằm dưới thang → ghi diện tích thủ công (tự tính sẽ bị trừ phần thang)
        { name: "WC", kind: "w", rect: [4.0, XR, T1_WC_D0, S0], area: 1.9 },
      ],
      furniture: [
        { kind: "wc", rect: [4.25, 4.65, T1_WC_D0, T1_WC_D0 + 0.6], facing: "F" },
        { kind: "basin", rect: [4.45, XR, 5.0, 5.5], facing: "R" },
      ],
    },
    {
      name: "Tầng 2",
      title: "Phòng khách, bếp ăn, WC",
      description:
        "Phòng khách phía trước mở ra ban công mặt tiền (cửa kính gấp). Thang từ tầng 1 lên tới cạnh tường phải, có lan can kính quanh lỗ thang; vế đầu của thang chữ U lên tầng 3 mở thẳng ra phòng khách. WC sát tường trái. Bếp chữ I dọc tường trái, bàn ăn 6 ghế phía sau, cửa ra ban công sau.",
      front: 0,
      back: BACK,
      grossArea: 69.3,
      stairHole: [4.0, XR, 3.1, S0],
      frontOpenings: [door(0.9, 4.3, 2.5)],
      backOpenings: [door(0.8, 1.9, 2.4), win(3.1, 3.9)],
      walls: [
        { axis: "x", from: SX0, to: XR, at: [S1, S1 + 0.1] },
        stairMid,
        // WC sát tường trái, cửa mở ra phía phòng khách
        { axis: "x", from: XI, to: 1.5, at: [4.5, 4.6], tiled: true },
        { axis: "d", from: 4.6, to: 6.97, at: [1.42, 1.5], tiled: true, openings: [door(5.03, 5.9, 2.1)] },
        { axis: "x", from: XI, to: 1.5, at: [6.97, 7.07], tiled: true },
      ],
      balconies: [
        { rect: [0, W, -1.3, 0], rails: ["F", "L", "R"] },
        { rect: [0, W, BACK, BACK + 0.74], rails: ["B", "L", "R"] },
        // Lan can kính quanh lỗ thang từ tầng 1 lên (phía trái và phía trước)
        { rect: [4.0, XR, 3.1, S0], rails: ["L", "F"] },
      ],
      rooms: [
        { name: "Ban công trước", kind: "o", rect: [XI, XR, -1.3, 0] },
        // Phòng khách trừ lỗ thang tầng 1 (0,89 m × 2,98 m)
        { name: "Phòng khách", kind: "r", rect: [XI, XR, 0.25, 4.5], area: 19.1 },
        { name: "Phòng khách", kind: "r", rect: [1.5, XR, 4.5, S0], area: 4.0 },
        { name: "WC", kind: "w", rect: [XI, 1.42, 4.6, 6.97] },
        { name: "Sảnh thang", kind: "h", rect: [1.5, SX0, S0, S1 + 0.1] },
        { name: "Sảnh thang", kind: "h", rect: [XI, 1.5, 7.07, S1 + 0.1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Bếp ăn", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
        { name: "Ban công sau", kind: "o", rect: [XI, XR, BACK, BACK + 0.74] },
      ],
      furniture: [
        { kind: "sofa", rect: [XI, 0.95, 1.25, 3.5], facing: "L" },
        { kind: "arm", rect: [1.4, 2.2, 3.75, 4.35], facing: "B" },
        { kind: "arm", rect: [1.4, 2.2, 0.45, 1.05], facing: "F" },
        { kind: "ctab", rect: [1.45, 2.4, 1.9, 3.0] },
        { kind: "tv", rect: [4.5, XR, 0.6, 2.7], facing: "R" },
        { kind: "plant", rect: [0.15, 0.55, 3.7, 4.1] },
        { kind: "plant", rect: [0.15, 0.55, 0.5, 0.9] },
        { kind: "wc", rect: [0.5, 0.95, 4.62, 5.2], facing: "F" },
        { kind: "basin", rect: [0.3, 0.85, 6.4, 6.95], facing: "B" },
        { kind: "fridge", rect: [XI, 0.75, 7.15, 7.85] },
        { kind: "kit", rect: [XI, 0.7, S1 + 0.1, 11.0], facing: "L" },
        { kind: "dtab", rect: [2.2, 4.0, 9.3, 10.4] },
      ],
    },
    {
      name: "Tầng 3",
      title: "Phòng ngủ cửa sổ lồi, WC, phòng làm việc",
      description:
        "Phòng ngủ phía trước có ô cửa sổ lồi, tủ áo ngăn với WC; dải phòng dọc tường trái dẫn tới cửa WC và cửa phòng mở ra sảnh thang. WC có buồng tắm kính sát tường phải và hộp kỹ thuật. Phòng làm việc phía sau với bàn làm việc và bàn trà.",
      front: 0,
      back: BACK,
      grossArea: 61.6,
      bay: { x0: 0.62, x1: 2.75, depth: 1.2 },
      frontOpenings: [door(0.62, 2.75, 2.5), win(3.25, 4.15)],
      backOpenings: [win(0.7, 1.6), win(2.9, 4.15)],
      walls: [
        { axis: "x", from: XI, to: XR, at: [S1, S1 + 0.1], openings: [door(0.62, 1.39)] },
        stairMid,
        // Vách trước lõi thang chạy hết bề ngang, cửa phòng ngủ phía trái
        { axis: "x", from: XI, to: XR, at: [5.98, S0], openings: [door(0.61, 1.38)] },
        // Tủ áo | WC
        { axis: "x", from: 1.89, to: XR, at: [4.46, 4.54] },
        { axis: "d", from: 4.54, to: 5.98, at: [1.89, 1.95], tiled: true, openings: [door(5.16, 5.9, 2.1)] },
        // Hộp kỹ thuật góc phải trước WC
        { axis: "x", from: 3.9, to: XR, at: [4.86, 4.92], tiled: true },
        { axis: "d", from: 4.54, to: 4.86, at: [3.9, 3.96], tiled: true },
      ],
      rooms: [
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, XR, 0.25, 4.46] },
        { name: "Phòng ngủ 1", kind: "r", rect: [XI, 1.89, 4.46, 5.98] },
        { name: "Phòng ngủ 1", kind: "r", rect: [0.62, 2.75, -1.2, 0], area: 2.0 },
        { name: "WC", kind: "w", rect: [1.95, XR, 4.92, 5.98] },
        { name: "WC", kind: "w", rect: [1.95, 3.9, 4.54, 4.92] },
        { name: "Sảnh thang", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Phòng làm việc", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "bed", rect: [2.75, XR, 1.26, 3.23], facing: "R" },
        { kind: "ward", rect: [1.95, XR, 3.95, 4.46], facing: "B" },
        { kind: "tv", rect: [XI, 0.3, 1.6, 2.7], facing: "L" },
        { kind: "plant", rect: [1.5, 1.9, -0.95, -0.55] },
        { kind: "shower", rect: [3.96, XR, 4.92, 5.98], facing: "L" },
        { kind: "wc", rect: [2.95, 3.35, 4.56, 5.15], facing: "F" },
        { kind: "basin", rect: [2.0, 2.55, 4.56, 5.0], facing: "F" },
        { kind: "desk", rect: [2.5, 3.16, 8.95, 10.45] },
        { kind: "chair", rect: [3.25, 3.6, 9.5, 9.9] },
        { kind: "ctab", rect: [1.0, 1.4, 11.0, 11.4] },
        { kind: "chair", rect: [0.55, 0.9, 11.03, 11.38] },
        { kind: "chair", rect: [1.5, 1.85, 11.03, 11.38] },
      ],
    },
    {
      name: "Tầng 4",
      title: "Hai phòng ngủ, WC chung",
      description:
        "Phòng ngủ trước lùi sau lô gia đặt cục nóng điều hoà, phòng ngủ sau phía sau lõi thang; mỗi phòng có dải tủ áo. Hành lang dọc tường trái nối sảnh thang với cửa phòng ngủ trước và cửa WC (buồng tắm kính sát tường phải).",
      front: 0.79,
      back: BACK,
      grossArea: 58.8,
      frontOpenings: [door(0.7, 2.1, 2.4), win(2.6, 4.2)],
      backOpenings: [win(0.7, 1.6), win(2.9, 4.2)],
      walls: [
        { axis: "x", from: XI, to: XR, at: [S1, S1 + 0.1], openings: [door(0.56, 1.39)] },
        stairMid,
        // Vách trước lõi thang (hành lang bên trái để trống)
        { axis: "x", from: 1.89, to: XR, at: [5.98, S0] },
        // Vách phòng ngủ trước, cửa ở đầu hành lang
        { axis: "x", from: XI, to: XR, at: [4.34, 4.41], openings: [door(0.62, 1.39)] },
        { axis: "d", from: 4.41, to: 5.98, at: [1.89, 1.97], tiled: true, openings: [door(5.1, 5.79, 2.1)] },
      ],
      balconies: [{ rect: [0, W, 0, 0.79], rails: ["F"] }],
      rooms: [
        { name: "Lô gia", kind: "o", rect: [XI, XR, 0, 0.79] },
        { name: "Phòng ngủ 2", kind: "r", rect: [XI, XR, 0.99, 4.34] },
        { name: "WC", kind: "w", rect: [1.97, XR, 4.41, 5.98] },
        { name: "Hành lang", kind: "h", rect: [XI, 1.89, 4.41, S0] },
        { name: "Hành lang", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Phòng ngủ 3", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "ac", rect: [0.15, 0.5, 0.15, 0.55] },
        { kind: "ac", rect: [2.6, 3.0, 0.15, 0.55] },
        { kind: "bed", rect: [2.75, XR, 1.3, 3.1], facing: "R" },
        { kind: "ward", rect: [2.84, XR, 3.84, 4.34], facing: "B" },
        { kind: "tv", rect: [XI, 0.3, 1.5, 2.6], facing: "L" },
        { kind: "shower", rect: [3.9, XR, 4.75, 5.98], facing: "L" },
        { kind: "wc", rect: [3.0, 3.4, 4.43, 5.0], facing: "F" },
        { kind: "basin", rect: [2.05, 2.6, 4.43, 4.87], facing: "F" },
        { kind: "ward", rect: [2.84, XR, S1 + 0.1, 8.5], facing: "F" },
        { kind: "bed", rect: [2.75, XR, 9.25, 11.13], facing: "R" },
        { kind: "tv", rect: [XI, 0.3, 9.5, 10.8], facing: "L" },
      ],
    },
    {
      name: "Tầng 5",
      title: "Phòng ngủ, WC, sân thượng",
      description:
        "Phần có mái gồm phòng ngủ phía sau, sảnh thang và WC. Phía trước là sân thượng đặt bồn nước, máy nước nóng năng lượng mặt trời và cục nóng điều hoà, được che bởi mái ngói mansard trên mặt tiền.",
      front: 4.6,
      back: BACK,
      roofed: [4.6, BACK],
      grossArea: 37.5,
      frontOpenings: [door(2.08, 2.74)],
      backOpenings: [win(0.6, 1.45), win(2.1, 2.9), win(3.9, 4.6)],
      walls: [
        { axis: "x", from: XI, to: XR, at: [S1, S1 + 0.1], openings: [door(0.61, 1.38)] },
        stairMid,
        // WC góc phải trước lõi thang
        { axis: "x", from: 3.0, to: XR, at: [5.98, S0], tiled: true },
        { axis: "d", from: 4.8, to: 5.98, at: [3.0, 3.08], tiled: true, openings: [door(5.25, 5.92, 2.1)] },
        // Tường chắn sân thượng hai bên
        { axis: "d", from: 1.72, to: 4.6, at: [0, XI], height: 1.2 },
        { axis: "d", from: 1.72, to: 4.6, at: [XR, W], height: 1.2 },
      ],
      rooms: [
        { name: "Sân thượng", kind: "o", rect: [XI, XR, 1.72, 4.6] },
        { name: "Sảnh", kind: "h", rect: [XI, 3.0, 4.8, S0] },
        { name: "Sảnh", kind: "h", rect: [XI, SX0, S0, S1] },
        { name: "WC", kind: "w", rect: [3.08, XR, 4.8, 5.98] },
        { name: "Thang", kind: "h", rect: [SX0, XR, S0, S1] },
        { name: "Phòng ngủ 4", kind: "r", rect: [XI, XR, S1 + 0.1, BI] },
      ],
      furniture: [
        { kind: "tank", rect: [0.25, 1.65, 3.0, 4.25] },
        { kind: "shelf", rect: [3.66, 4.8, 2.31, 4.03], height: 0.9 },
        { kind: "ac", rect: [3.35, 4.0, 4.12, 4.5] },
        { kind: "basin", rect: [3.15, 3.7, 4.82, 5.25], facing: "F" },
        { kind: "wc", rect: [3.9, 4.3, 4.82, 5.4], facing: "F" },
        { kind: "ward", rect: [2.9, XR, S1 + 0.1, 8.62], facing: "F" },
        { kind: "bed", rect: [2.75, XR, 9.2, 11.16], facing: "R" },
        { kind: "tv", rect: [XI, 0.3, 9.7, 10.9], facing: "L" },
      ],
    },
  ],
};
