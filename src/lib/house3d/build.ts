import * as THREE from "three";
import type { Furniture, HouseModel, Opening, Rect, RoomKind, StraightStair, Wall } from "./types";

/*
 * Dựng nhà 3D từ HouseModel.
 * Toạ độ thế giới: X = x, Y = y, Z = -d (mặt tiền ở Z = 0, phía sau Z âm).
 * Mỗi mesh có userData:
 *   kind: "struct" | "wall" | "finish" | "furn" | "roof" | "nb" | "ground"
 *   left: true nếu là tường bên trái (ẩn được để nhìn vào trong)
 *   raw:  vật liệu dùng ở chế độ "Khung thô"
 */

export type MeshKind = "struct" | "wall" | "finish" | "furn" | "roof" | "nb" | "ground";

export interface HouseMaterials {
  all: THREE.Material[];
  plaster: THREE.MeshStandardMaterial;
  facade: THREE.MeshStandardMaterial;
  brick: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  wcTile: THREE.MeshStandardMaterial;
  floorWood: THREE.MeshStandardMaterial;
  floorTile: THREE.MeshStandardMaterial;
  wcFloor: THREE.MeshStandardMaterial;
  paving: THREE.MeshStandardMaterial;
  stairMat: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  fabricLight: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  plant: THREE.MeshStandardMaterial;
  roofTile: THREE.MeshStandardMaterial;
  ghost: THREE.MeshStandardMaterial;
  ground: THREE.MeshStandardMaterial;
  grass: THREE.MeshStandardMaterial;
  wallGhost: THREE.MeshStandardMaterial;
  cap: THREE.MeshBasicMaterial;
  edge: THREE.LineBasicMaterial;
}

export function createMaterials(): HouseMaterials {
  const mk = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
  const m = {
    plaster: mk(0xf1ebe0),
    facade: mk(0xebe4d6),
    brick: mk(0xb5603c),
    concrete: mk(0xa29d95),
    wcTile: mk(0xdfe3e0, { roughness: 0.5 }),
    floorWood: mk(0xb8834f, { roughness: 0.65 }),
    floorTile: mk(0xe4d9c6, { roughness: 0.6 }),
    wcFloor: mk(0xc9d2d3, { roughness: 0.5 }),
    paving: mk(0x9a8f80, { roughness: 0.85 }),
    stairMat: mk(0xd9cbb3, { roughness: 0.7 }),
    wood: mk(0xb07a45, { roughness: 0.7 }),
    woodDark: mk(0x6b4026, { roughness: 0.7 }),
    fabric: mk(0xe6ddcc),
    fabricLight: mk(0xf4f0e8),
    white: mk(0xf6f2ea, { roughness: 0.35 }),
    dark: mk(0x34373b),
    steel: mk(0x8d939a, { roughness: 0.4, metalness: 0.5 }),
    glass: mk(0xbcd8e6, { transparent: true, opacity: 0.3, roughness: 0.1, depthWrite: false }),
    plant: mk(0x4f7f3b),
    roofTile: mk(0x6f3a2c, { roughness: 0.8 }),
    ghost: mk(0x9aa0a6, { transparent: true, opacity: 0.16, depthWrite: false }),
    ground: mk(0xd7d1c6, { roughness: 1 }),
    grass: mk(0xe1d0b5, { roughness: 1 }),
    wallGhost: mk(0xf1ebe0, { transparent: true, opacity: 0.14, depthWrite: false }),
  };
  const cap = new THREE.MeshBasicMaterial({ color: 0x1b1b1b, side: THREE.BackSide });
  const edge = new THREE.LineBasicMaterial({ color: 0x2a2d31, transparent: true, opacity: 0.25 });
  return { ...m, cap, edge, all: [...Object.values(m), cap, edge] };
}

export interface BuiltHouse {
  /** Gốc toàn bộ nhà, đã dịch để tâm mặt bằng ở gốc toạ độ. */
  root: THREE.Group;
  /** Nhóm theo tầng (sàn + tường + nội thất + thang đi lên từ tầng đó). */
  floors: THREE.Group[];
  /** Mái, tường chắn mái. */
  roof: THREE.Group;
  /** Nhà bên cạnh. */
  neighbors: THREE.Group;
  /** Nền sân, bậc tam cấp. */
  site: THREE.Group;
  /** Độ dịch từ toạ độ (x, d) sang toạ độ thế giới. */
  offset: THREE.Vector3;
  /** Kích thước để đặt camera. */
  size: { width: number; depth: number; height: number; d0: number; d1: number };
}

const SLAB = 0.15;
const FACADE_T = 0.2;
const SIDE_T = 0.11;

/** Dựng toàn bộ nhà. `mats` dùng chung, do viewer quản lý & giải phóng. */
export function buildHouse(model: HouseModel, mats: HouseMaterials): BuiltHouse {
  const W = model.width;
  const L = model.levels;
  const top = L.length - 1;
  const floorTop = (k: number) => (k < top ? L[k + 1] - SLAB : model.roofY);

  const root = new THREE.Group();
  const roof = new THREE.Group();
  const neighbors = new THREE.Group();
  const site = new THREE.Group();
  const floors = model.floors.map(() => new THREE.Group());
  root.add(site, neighbors, roof, ...floors);

  let target: THREE.Group = site;

  function reg(
    mesh: THREE.Mesh,
    kind: MeshKind,
    opts: { left?: boolean; side?: "L" | "R"; edges?: boolean; cap?: boolean; raw?: THREE.Material; shadow?: boolean } = {}
  ) {
    mesh.castShadow = opts.shadow !== false && kind !== "nb" && kind !== "ground";
    mesh.receiveShadow = kind !== "nb";
    mesh.userData = { kind, left: !!opts.left, side: opts.side ?? null, mat: mesh.material, raw: opts.raw ?? null };
    if (opts.edges) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), mats.edge);
      e.userData = { kind: "edge" };
      mesh.add(e);
    }
    if (opts.cap) {
      // Mặt sau màu đen: khi bị mặt phẳng cắt, lõi tường/sàn hiện đen như bản vẽ mặt cắt
      const c = new THREE.Mesh(mesh.geometry, mats.cap);
      c.userData = { kind: "cap" };
      mesh.add(c);
    }
    target.add(mesh);
    return mesh;
  }

  function box(
    x0: number, x1: number, y0: number, y1: number, d0: number, d1: number,
    mat: THREE.Material, kind: MeshKind,
    opts?: Parameters<typeof reg>[2]
  ) {
    if (x1 - x0 < 0.004 || y1 - y0 < 0.004 || d1 - d0 < 0.004) return null;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, d1 - d0), mat);
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, -(d0 + d1) / 2);
    return reg(mesh, kind, opts);
  }

  function cyl(x: number, d: number, y0: number, h: number, r: number, mat: THREE.Material, kind: MeshKind = "furn") {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat);
    mesh.position.set(x, y0 + h / 2, -d);
    return reg(mesh, kind);
  }

  /** Tấm phẳng đứng nối 2 điểm trên mặt bằng (dùng cho cửa sổ lồi). */
  function panel(p: [number, number], q: [number, number], y0: number, y1: number, t: number, mat: THREE.Material, kind: MeshKind) {
    const dx = q[0] - p[0];
    const dd = q[1] - p[1];
    const len = Math.hypot(dx, dd);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, y1 - y0, t), mat);
    mesh.position.set((p[0] + q[0]) / 2, (y0 + y1) / 2, -(p[1] + q[1]) / 2);
    mesh.rotation.y = Math.atan2(dd, dx);
    return reg(mesh, kind, { edges: kind !== "furn" });
  }

  // ---------- Tường có ô cửa ----------
  function wallWithOpenings(
    axis: "x" | "d", a0: number, a1: number, t0: number, t1: number, y0: number, y1: number,
    openings: Opening[], mat: THREE.Material, opts: { left?: boolean; side?: "L" | "R"; raw?: boolean } = {}
  ) {
    const piece = (s0: number, s1: number, h0: number, h1: number) =>
      axis === "x"
        ? box(s0, s1, h0, h1, t0, t1, mat, "wall", { edges: true, cap: true, left: opts.left, side: opts.side, raw: opts.raw === false ? undefined : mats.brick })
        : box(t0, t1, h0, h1, s0, s1, mat, "wall", { edges: true, cap: true, left: opts.left, side: opts.side, raw: opts.raw === false ? undefined : mats.brick });
    const glass = (s0: number, s1: number, h0: number, h1: number) => {
      const m = (t0 + t1) / 2;
      return axis === "x"
        ? box(s0, s1, h0, h1, m - 0.012, m + 0.012, mats.glass, "finish", { shadow: false, left: opts.left })
        : box(m - 0.012, m + 0.012, h0, h1, s0, s1, mats.glass, "finish", { shadow: false, left: opts.left });
    };
    let s = a0;
    const ops = openings.filter((o) => o.to > a0 && o.from < a1).sort((p, q) => p.from - q.from);
    for (const o of ops) {
      piece(s, o.from, y0, y1);
      piece(o.from, o.to, y0, y0 + o.bottom);
      piece(o.from, o.to, Math.min(y1, y0 + o.top), y1);
      if (o.type === "window" || (o.type === "door" && o.bottom === 0 && o.to - o.from > 1.0 && t1 - t0 >= FACADE_T - 0.01)) {
        // Cửa sổ & cửa đi kính lớn ở mặt ngoài: có kính
        glass(o.from + 0.03, o.to - 0.03, y0 + o.bottom, y0 + o.top);
      }
      s = o.to;
    }
    piece(s, a1, y0, y1);
  }

  function interiorWall(w: Wall, y0: number, h: number) {
    const mat = w.tiled ? mats.wcTile : mats.plaster;
    if (w.profile && w.profile.length >= 3) {
      profileWall(w, y0, mat);
      return;
    }
    wallWithOpenings(w.axis, w.from, w.to, w.at[0], w.at[1], y0, y0 + (w.height ?? h), w.openings ?? [], mat);
  }

  /** Tường có mặt đứng là đa giác (VD mép trên chéo theo vế thang), đùn theo bề dày tường. */
  function profileWall(w: Wall, y0: number, mat: THREE.Material) {
    const shape = new THREE.Shape(w.profile!.map(([a, y]) => new THREE.Vector2(a, y)));
    const t = w.at[1] - w.at[0];
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, mat);
    if (w.axis === "x") {
      // Mặt (x, y) đùn theo +Z: Z chạy từ -at[1] tới -at[0] (tức d từ at[1] về at[0])
      mesh.position.set(0, y0, -w.at[1]);
    } else {
      // Mặt (d, y); xoay +90° quanh Y: (d, y, e) → (e, y, -d) → X = bề dày, Z = -d
      mesh.rotation.y = Math.PI / 2;
      mesh.position.set(w.at[0], y0, 0);
    }
    reg(mesh, "wall", { edges: true, cap: true, raw: mats.brick });
  }

  // ---------- Sàn (có khoét lỗ thang) ----------
  function slab(rect: Rect, y: number, hole: Rect | null, mat: THREE.Material) {
    const [x0, x1, d0, d1] = rect;
    if (!hole) {
      box(x0, x1, y - SLAB, y, d0, d1, mat, "struct", { edges: true, cap: true });
      return;
    }
    const [hx0, hx1, hd0, hd1] = hole;
    box(x0, x1, y - SLAB, y, d0, hd0, mat, "struct", { edges: true, cap: true });
    box(x0, x1, y - SLAB, y, hd1, d1, mat, "struct", { edges: true, cap: true });
    box(x0, hx0, y - SLAB, y, hd0, hd1, mat, "struct", { edges: true, cap: true });
    box(hx1, x1, y - SLAB, y, hd0, hd1, mat, "struct", { edges: true, cap: true });
  }

  // ---------- Thang chữ U ----------
  function uStair(y0: number, y1: number) {
    const [x0, x1, d0, d1] = model.stair.rect;
    const n = model.stair.steps;
    const land = model.stair.landing;
    const dm = (d0 + d1) / 2;
    const H = y1 - y0;
    const riser = H / (2 * n + 1);
    const run = (x1 - x0 - land) / n;
    const mid = y0 + riser * (n + 1);
    if (model.stair.landingSide === "R") {
      // Lõi thang sát tường phải: vế 1 dải trước đi lên theo +x từ hành lang bên trái,
      // chiếu nghỉ ở phía x1, vế 2 dải sau đi lên theo −x về lại phía hành lang.
      for (let i = 0; i < n; i++) {
        const xa = x0 + i * run;
        box(xa, xa + run, y0 + i * riser - 0.12, y0 + (i + 1) * riser, d0, dm - 0.04, mats.stairMat, "struct", { edges: true });
      }
      box(x1 - land, x1, mid - 0.15, mid, d0, d1, mats.stairMat, "struct", { edges: true });
      for (let i = 0; i < n; i++) {
        const xa = x1 - land - (i + 1) * run;
        box(xa, xa + run, mid + i * riser - 0.12, mid + (i + 1) * riser, dm + 0.04, d1, mats.stairMat, "struct", { edges: true });
      }
      return;
    }
    // Vế 1: dải trước, đi lên theo -x từ phía hành lang
    for (let i = 0; i < n; i++) {
      const xa = x1 - (i + 1) * run;
      box(xa, xa + run, y0 + i * riser - 0.12, y0 + (i + 1) * riser, d0, dm - 0.04, mats.stairMat, "struct", { edges: true });
    }
    // Chiếu nghỉ
    box(x0, x0 + land, mid - 0.15, mid, d0, d1, mats.stairMat, "struct", { edges: true });
    // Vế 2: dải sau, đi lên theo +x
    for (let i = 0; i < n; i++) {
      const xa = x0 + land + i * run;
      box(xa, xa + run, mid + i * riser - 0.12, mid + (i + 1) * riser, dm + 0.04, d1, mats.stairMat, "struct", { edges: true });
    }
  }

  // ---------- Thang thẳng một vế ----------
  function straightStair(st: StraightStair, y0: number, y1: number) {
    const [x0, x1, d0, d1] = st.rect;
    const n = st.steps;
    const riser = (y1 - y0) / n;
    const alongD = st.dir === "+d" || st.dir === "-d";
    const len = alongD ? d1 - d0 : x1 - x0;
    const run = len / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + (i + 1) * riser;
      const bot = y0 + i * riser - 0.12;
      if (alongD) {
        const a = st.dir === "+d" ? d0 + i * run : d1 - (i + 1) * run;
        box(x0, x1, bot, top, a, a + run, mats.stairMat, "struct", { edges: true });
      } else {
        const a = st.dir === "+x" ? x0 + i * run : x1 - (i + 1) * run;
        box(a, a + run, bot, top, d0, d1, mats.stairMat, "struct", { edges: true });
      }
    }
  }

  // ---------- Lan can ----------
  function railing(rect: Rect, sides: ("F" | "B" | "L" | "R")[], y: number) {
    const [x0, x1, d0, d1] = rect;
    const h = 1.05;
    for (const s of sides) {
      if (s === "F" || s === "B") {
        const d = s === "F" ? d0 : d1;
        box(x0, x1, y + h - 0.05, y + h, d - 0.03, d + 0.03, mats.dark, "furn", { shadow: false });
        box(x0 + 0.05, x1 - 0.05, y + 0.1, y + h - 0.05, d - 0.01, d + 0.01, mats.glass, "finish", { shadow: false });
      } else {
        const x = s === "L" ? x0 : x1;
        box(x - 0.03, x + 0.03, y + h - 0.05, y + h, d0, d1, mats.dark, "furn", { shadow: false });
        box(x - 0.01, x + 0.01, y + 0.1, y + h - 0.05, d0 + 0.05, d1 - 0.05, mats.glass, "finish", { shadow: false });
      }
    }
  }

  // ---------- Nội thất ----------
  const strip = (r: Rect, side: "L" | "R" | "F" | "B", t: number): Rect =>
    side === "L" ? [r[0], r[0] + t, r[2], r[3]]
    : side === "R" ? [r[1] - t, r[1], r[2], r[3]]
    : side === "F" ? [r[0], r[1], r[2], r[2] + t]
    : [r[0], r[1], r[3] - t, r[3]];

  function furniture(f: Furniture, y: number) {
    const r = f.rect;
    const [x0, x1, d0, d1] = r;
    const cx = (x0 + x1) / 2;
    const cd = (d0 + d1) / 2;
    const face = f.facing ?? "L";
    const b = (rr: Rect, h0: number, h1: number, mat: THREE.Material) => box(rr[0], rr[1], y + h0, y + h1, rr[2], rr[3], mat, "furn");
    switch (f.kind) {
      case "sofa":
      case "arm": {
        b(r, 0.05, 0.42, mats.fabric);
        b(strip(r, face, 0.2), 0.42, 0.85, mats.fabric);
        const along = face === "L" || face === "R" ? "d" : "x";
        if (along === "d") {
          b([x0, x1, d0, d0 + 0.15], 0.42, 0.62, mats.fabric);
          b([x0, x1, d1 - 0.15, d1], 0.42, 0.62, mats.fabric);
        } else {
          b([x0, x0 + 0.15, d0, d1], 0.42, 0.62, mats.fabric);
          b([x1 - 0.15, x1, d0, d1], 0.42, 0.62, mats.fabric);
        }
        break;
      }
      case "ctab":
        b(r, 0, f.height ?? 0.42, mats.woodDark);
        break;
      case "tv":
        b(r, 0, 0.45, mats.woodDark);
        b(strip(r, face, 0.05), 0.85, 1.5, mats.dark);
        break;
      case "bed":
        b(r, 0.1, 0.45, mats.wood);
        b([x0 + 0.02, x1 - 0.02, d0 + 0.02, d1 - 0.02], 0.45, 0.6, mats.fabricLight);
        b(strip(r, face, 0.08), 0.1, 1.1, mats.woodDark);
        {
          // 2 gối cạnh đầu giường
          const p = strip(r, face, 0.5);
          if (face === "L" || face === "R") {
            b([p[0] + (face === "L" ? 0.12 : 0), p[1] - (face === "R" ? 0.12 : 0), d0 + 0.15, cd - 0.05], 0.6, 0.72, mats.white);
            b([p[0] + (face === "L" ? 0.12 : 0), p[1] - (face === "R" ? 0.12 : 0), cd + 0.05, d1 - 0.15], 0.6, 0.72, mats.white);
          } else {
            b([x0 + 0.15, cx - 0.05, p[2] + (face === "F" ? 0.12 : 0), p[3] - (face === "B" ? 0.12 : 0)], 0.6, 0.72, mats.white);
            b([cx + 0.05, x1 - 0.15, p[2] + (face === "F" ? 0.12 : 0), p[3] - (face === "B" ? 0.12 : 0)], 0.6, 0.72, mats.white);
          }
        }
        break;
      case "ward":
        b(r, 0, f.height ?? 2.3, mats.wood);
        break;
      case "shelf":
        b(r, 0, f.height ?? 2.0, mats.woodDark);
        break;
      case "desk":
        b(r, 0.7, 0.76, mats.wood);
        b(strip(r, face === "L" || face === "R" ? (face === "L" ? "F" : "B") : "L", 0.05), 0, 0.7, mats.wood);
        b(strip(r, face === "L" || face === "R" ? (face === "L" ? "B" : "F") : "R", 0.05), 0, 0.7, mats.wood);
        break;
      case "chair":
        b(r, 0.42, 0.48, mats.dark);
        cyl(cx, cd, y, 0.42, 0.04, mats.steel);
        break;
      case "kit":
        b(r, 0, 0.86, mats.white);
        b(r, 0.86, 0.9, mats.dark);
        b(strip(r, face, 0.35), 1.5, 2.2, mats.white);
        break;
      case "fridge":
        b(r, 0, 1.9, mats.steel);
        break;
      case "dtab": {
        b(r, 0.72, 0.76, mats.wood);
        cyl(cx, cd, y, 0.72, 0.06, mats.dark);
        const along = d1 - d0 >= x1 - x0 ? "d" : "x";
        for (let i = 0; i < 3; i++) {
          if (along === "d") {
            const dd = d0 + ((i + 0.5) * (d1 - d0)) / 3;
            b([x0 - 0.5, x0 - 0.1, dd - 0.2, dd + 0.2], 0.42, 0.47, mats.fabric);
            b([x1 + 0.1, x1 + 0.5, dd - 0.2, dd + 0.2], 0.42, 0.47, mats.fabric);
          } else {
            const xx = x0 + ((i + 0.5) * (x1 - x0)) / 3;
            b([xx - 0.2, xx + 0.2, d0 - 0.5, d0 - 0.1], 0.42, 0.47, mats.fabric);
            b([xx - 0.2, xx + 0.2, d1 + 0.1, d1 + 0.5], 0.42, 0.47, mats.fabric);
          }
        }
        break;
      }
      case "wc":
        cyl(cx, cd, y, 0.42, Math.min(x1 - x0, d1 - d0) * 0.42, mats.white);
        b(strip(r, face, 0.18), 0.35, 0.8, mats.white);
        break;
      case "basin":
        b(r, 0.45, 0.86, mats.white);
        b(strip(r, face === "F" ? "B" : face === "B" ? "F" : face === "L" ? "R" : "L", 0.04), 0.86, 1.6, mats.glass);
        break;
      case "shower": {
        // Khay sàn + vách kính ở cạnh phải buồng tắm (x1) với cánh cửa kính ở giữa,
        // mở hé 30° ra phía WC để thấy rõ lối vào.
        b(r, 0, 0.04, mats.wcFloor);
        const glassLeft = f.facing === "L";
        const gx = glassLeft ? x0 + 0.01 : x1 - 0.01;
        const sgn = glassLeft ? -1 : 1; // cửa mở hé ra phía ngoài buồng tắm
        const len = d1 - d0;
        const doorW = Math.min(0.7, len * 0.55);
        const dA = d0 + (len - doorW) / 2; // bản lề
        const dB = dA + doorW;
        const gTop = y + 2.0;
        box(gx - 0.01, gx + 0.01, y + 0.04, gTop, d0, dA, mats.glass, "finish", { shadow: false });
        box(gx - 0.01, gx + 0.01, y + 0.04, gTop, dB, d1, mats.glass, "finish", { shadow: false });
        // Nẹp inox: thanh ngang trên đỉnh vách và 2 trụ ở mép ô cửa
        box(gx - 0.015, gx + 0.015, gTop - 0.03, gTop, d0, d1, mats.steel, "furn", { shadow: false });
        cyl(gx, dA, y, 2.0, 0.015, mats.steel);
        cyl(gx, dB, y, 2.0, 0.015, mats.steel);
        // Cánh cửa kính mở hé
        const ang = Math.PI / 6;
        const q: [number, number] = [gx + sgn * Math.sin(ang) * doorW, dA + Math.cos(ang) * doorW];
        panel([gx, dA], q, y + 0.04, gTop - 0.03, 0.02, mats.glass, "finish");
        cyl(q[0], q[1], y + 0.04, 1.93, 0.012, mats.steel);
        // Tay nắm gần mép cửa
        const hx = gx + sgn * Math.sin(ang) * doorW * 0.85;
        const hd = dA + Math.cos(ang) * doorW * 0.85;
        cyl(hx + sgn * 0.03, hd, y + 0.9, 0.35, 0.012, mats.steel);
        // Bát sen (sát tường đối diện vách kính)
        cyl(glassLeft ? r[1] - 0.12 : r[0] + 0.12, cd, y + 1.9, 0.04, 0.12, mats.steel);
        break;
      }
      case "wash":
        b(r, 0, 0.85, mats.white);
        break;
      case "plant":
        cyl(cx, cd, y, 0.35, Math.min(x1 - x0, d1 - d0) * 0.4, mats.woodDark);
        {
          const s = new THREE.Mesh(new THREE.SphereGeometry(Math.min(x1 - x0, d1 - d0) * 0.75, 12, 10), mats.plant);
          s.position.set(cx, y + 0.75, -cd);
          reg(s, "furn");
        }
        break;
      case "ac":
        b(r, 0, 0.6, mats.steel);
        break;
      case "tank":
        cyl(cx, cd, y, 1.1, Math.min(x1 - x0, d1 - d0) * 0.5, mats.steel);
        break;
      case "gym":
        b(r, 0, 0.06, mats.dark);
        cyl(cx, cd, y + 0.5, 1.0, 0.16, mats.dark);
        break;
    }
  }

  // ---------- Nền, sân, bậc tam cấp ----------
  target = site;
  const [lot0, lot1] = model.lot;
  box(-8, W + 8, model.groundY - 0.4, model.groundY - 0.02, lot0 - 6, lot1 + 6, mats.grass, "ground", { shadow: false });
  const yardL = model.sideYard?.side === "L" ? model.sideYard.width : 0.2;
  const yardR = model.sideYard?.side === "R" ? model.sideYard.width : 0.2;
  box(-yardL, W + yardR, model.groundY - 0.02, model.groundY, lot0, lot1, mats.paving, "ground");
  if (model.frontSteps) {
    const [sx0, sx1, sd0, sd1] = model.frontSteps;
    const n = 3;
    const rise = (0 - model.groundY) / n;
    for (let i = 0; i < n; i++) {
      const dd = sd0 + ((sd1 - sd0) * i) / n;
      box(sx0, sx1, model.groundY, model.groundY + (i + 1) * rise, dd, sd1, mats.stairMat, "struct", { edges: true });
    }
  }
  // Móng/cốt nền dưới tầng 1
  const f1 = model.floors[0];
  box(0, W, model.groundY, -SLAB, f1.front, f1.back, mats.concrete, "struct", { edges: true });

  // ---------- Nhà bên cạnh (dãy liền kề) ----------
  target = neighbors;
  const nbFront = Math.min(...model.floors.map((f) => f.front));
  const nbBack = Math.max(...model.floors.map((f) => f.back));
  for (const side of [-1, 1]) {
    if (model.sideYard && (model.sideYard.side === "L") === side < 0) continue;
    const x0 = side < 0 ? -W : W;
    box(x0, x0 + W, model.groundY, model.roofY + 0.6, nbFront, nbBack, mats.ghost, "nb", { shadow: false });
  }

  // ---------- Từng tầng ----------
  model.floors.forEach((fl, k) => {
    target = floors[k];
    const y0 = L[k];
    const y1 = floorTop(k);
    const h = y1 - y0;

    // Sàn: phần nhà + ban công + phần ngoài trời; tầng 1 có cốt nền riêng
    if (k > 0) {
      const ds = [fl.front, ...(fl.balconies ?? []).map((b) => b.rect[2]), ...fl.rooms.filter((r) => r.kind === "o").map((r) => r.rect[2])];
      if (k === top && model.mansard) ds.push(model.mansard.d0);
      const de = [
        fl.back,
        ...(fl.balconies ?? []).map((b) => b.rect[3]),
        ...fl.rooms.filter((r) => r.kind === "o").map((r) => r.rect[3]),
      ];
      const hole = fl.stairHole !== undefined ? fl.stairHole : model.stair.rect;
      slab([0, W, Math.min(...ds), Math.max(...de)], y0, hole, mats.concrete);
    } else {
      box(0, W, -SLAB, 0, fl.front, fl.back, mats.concrete, "struct", { edges: true, cap: true });
    }

    // Lớp hoàn thiện sàn theo loại phòng — cắt bỏ phần trùng lỗ thang của tầng này
    // (lỗ sàn cho thang từ tầng dưới đi lên phải để trống, không lát đè lên).
    const floorHole = k > 0 ? (fl.stairHole !== undefined ? fl.stairHole : model.stair.rect) : null;
    for (const room of fl.rooms) {
      if (k > 0 && room.kind === "h" && overlapRatio(room.rect, model.stair.rect) > 0.5) continue;
      const mat = floorMat(room.kind, k);
      if (fl.bay && room.rect[3] <= fl.front + 0.001) continue; // phần cửa sổ lồi lát riêng
      for (const [rx0, rx1, rd0, rd1] of floorHole ? subtractRect(room.rect, floorHole) : [room.rect]) {
        box(rx0, rx1, y0, y0 + 0.02, rd0, rd1, mat, "finish", { shadow: false });
      }
    }

    // Tường bao: trái (ẩn được), phải, trước, sau — chỉ cho phần nhà kín
    const ef = fl.front;
    const eb = fl.back;
    wallWithOpenings("d", ef, eb, 0, SIDE_T, y0, y1, fl.leftOpenings ?? [], mats.plaster, { left: true, side: "L" });
    wallWithOpenings("d", ef, eb, W - SIDE_T, W, y0, y1, fl.rightOpenings ?? [], mats.plaster, { side: "R" });
    wallWithOpenings("x", 0, W, ef, ef + FACADE_T, y0, y1, fl.frontOpenings, mats.facade);
    wallWithOpenings("x", 0, W, eb - FACADE_T, eb, y0, y1, fl.backOpenings, mats.facade);

    for (const w of fl.walls) interiorWall(w, y0, h);

    // Ban công / lô gia
    for (const bal of fl.balconies ?? []) {
      railing(bal.rect, bal.rails, y0);
    }

    // Cửa sổ lồi
    if (fl.bay) {
      const { x0, x1, depth } = fl.bay;
      const chamfer = Math.min(0.45, (x1 - x0) / 4);
      const pts: [number, number][] = [
        [x0, 0],
        [x0 + chamfer, -depth],
        [x1 - chamfer, -depth],
        [x1, 0],
      ];
      const shape = new THREE.Shape(pts.map(([x, d]) => new THREE.Vector2(x, d)));
      const mk = (yy: number) => {
        const g = new THREE.ExtrudeGeometry(shape, { depth: SLAB, bevelEnabled: false });
        const mesh = new THREE.Mesh(g, mats.concrete);
        // Shape nằm trên mặt XY (x, d); xoay -90° quanh X: (x, d, e) → (x, e, -d),
        // tức Z = -d đúng quy ước và độ dày đùn (e) thành chiều cao.
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = yy - SLAB;
        return reg(mesh, "struct", { edges: true, cap: true });
      };
      mk(y0);
      mk(y0 + 2.65);
      for (let i = 0; i < pts.length - 1; i++) {
        panel(pts[i], pts[i + 1], y0, y0 + 0.5, 0.12, mats.facade, "wall");
        panel(pts[i], pts[i + 1], y0 + 0.5, y0 + 2.5, 0.03, mats.glass, "finish");
      }
      box(x0 + 0.1, x1 - 0.1, y0, y0 + 0.02, -depth + 0.1, 0, mats.floorWood, "finish", { shadow: false });
    }

    // Thang đi lên tầng trên
    if (k < top) {
      if (fl.stairUp) straightStair(fl.stairUp, y0, L[k + 1]);
      else uStair(y0, L[k + 1]);
    }

    // Mái mansard ngói phía trước tầng trên cùng
    if (k === top && model.mansard) {
      const { d0, d1, height } = model.mansard;
      const run = d1 - d0;
      const len = Math.hypot(run, height);
      const g = new THREE.BoxGeometry(W, 0.12, len);
      const mesh = new THREE.Mesh(g, mats.roofTile);
      mesh.position.set(W / 2, y0 + height / 2, -(d0 + d1) / 2);
      mesh.rotation.x = Math.atan2(height, run);
      reg(mesh, "wall", { edges: true });
      box(0, W, y0 + height - 0.05, y0 + height + 0.1, d1 - 0.1, d1 + 0.15, mats.facade, "wall", { edges: true });
    }

    for (const f of fl.furniture) furniture(f, y0 + 0.02);
  });

  // ---------- Mái ----------
  target = roof;
  const tf = model.floors[top];
  const [r0, r1] = tf.roofed ?? [tf.front, tf.back];
  box(0, W, model.roofY, model.roofY + SLAB, r0, r1, mats.concrete, "roof", { edges: true, cap: true });
  const py0 = model.roofY + SLAB;
  box(0, SIDE_T, py0, model.topY, r0, r1, mats.facade, "roof", { edges: true });
  box(W - SIDE_T, W, py0, model.topY, r0, r1, mats.facade, "roof", { edges: true });
  box(0, W, py0, model.topY, r0, r0 + SIDE_T, mats.facade, "roof", { edges: true });
  box(0, W, py0, model.topY, r1 - SIDE_T, r1, mats.facade, "roof", { edges: true });

  // Đưa tâm mặt bằng về gốc toạ độ
  const d0 = Math.min(model.lot[0], ...model.floors.map((f) => f.front));
  const d1 = Math.max(...model.floors.map((f) => f.back));
  const offset = new THREE.Vector3(-W / 2, 0, (d0 + d1) / 2);
  root.position.copy(offset);

  return {
    root,
    floors,
    roof,
    neighbors,
    site,
    offset,
    size: { width: W, depth: d1 - d0, height: model.topY, d0, d1 },
  };

  function floorMat(kind: RoomKind, k: number) {
    if (kind === "w") return mats.wcFloor;
    if (kind === "o") return mats.paving;
    if (kind === "h") return mats.floorTile;
    return k === 0 ? mats.floorTile : mats.floorWood;
  }
}

/** Phần của r nằm ngoài lỗ h, trả về tối đa 4 hình chữ nhật (r nguyên vẹn nếu không chồng). */
function subtractRect(r: Rect, h: Rect): Rect[] {
  const [x0, x1, d0, d1] = r;
  const hx0 = Math.max(x0, h[0]);
  const hx1 = Math.min(x1, h[1]);
  const hd0 = Math.max(d0, h[2]);
  const hd1 = Math.min(d1, h[3]);
  if (hx1 <= hx0 || hd1 <= hd0) return [r];
  const out: Rect[] = [
    [x0, x1, d0, hd0], // phía trước lỗ
    [x0, x1, hd1, d1], // phía sau lỗ
    [x0, hx0, hd0, hd1], // bên trái lỗ
    [hx1, x1, hd0, hd1], // bên phải lỗ
  ];
  return out.filter(([a, b, c, d]) => b - a > 0.004 && d - c > 0.004);
}

/** Tỉ lệ diện tích của a nằm trong b (0..1). */
function overlapRatio(a: Rect, b: Rect) {
  const ix = Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]));
  const id = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[2], b[2]));
  const area = Math.max(1e-9, (a[1] - a[0]) * (a[3] - a[2]));
  return (ix * id) / area;
}

/** Giải phóng geometry của một cây object (material dùng chung, giải phóng riêng). */
export function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const g = (o as THREE.Mesh).geometry;
    if (g) g.dispose();
  });
}
