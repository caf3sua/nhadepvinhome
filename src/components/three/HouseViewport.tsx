"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { HouseModel } from "@/lib/house3d/types";
import { buildHouse, createMaterials, disposeTree, type BuiltHouse } from "@/lib/house3d/build";
import { computeFloorAreas, fmtM2 } from "@/lib/house3d/areas";

export type HouseViewMode = "floor" | "all" | "raw" | "top";

interface Props {
  model: HouseModel;
  /** main: cả tòa có mặt cắt ngang · exploded: các tầng tách rời xếp một hàng */
  variant: "main" | "exploded";
  mode: HouseViewMode;
  /** Tầng đang chọn (0-based). */
  floor: number;
  /** Cao độ mặt cắt ngang (chỉ khung main). */
  clip: number;
  hideLeft: boolean;
  showFurniture: boolean;
  showNeighbors: boolean;
  onFloorClick?: (index: number) => void;
}

interface Label {
  el: HTMLDivElement;
  floor: number;
  pos: THREE.Vector3;
  ex: [THREE.Vector3, THREE.Vector3];
  ed: [THREE.Vector3, THREE.Vector3];
  w: number;
  h: number;
}

const EXPLODE_GAP = 2.2;

export function HouseViewport({
  model,
  variant,
  mode,
  floor,
  clip,
  hideLeft,
  showFurniture,
  showNeighbors,
  onFloorClick,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onFloorClickRef = useRef(onFloorClick);
  onFloorClickRef.current = onFloorClick;

  const ctx = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    plane: THREE.Plane;
    house: BuiltHouse;
    labels: Label[];
    invalidate: () => void;
    frameView: (mode: HouseViewMode, floor: number) => void;
    state: { mode: HouseViewMode };
  } | null>(null);

  // ---------- Khởi tạo scene cho mỗi căn ----------
  useEffect(() => {
    const mount = mountRef.current;
    const labelLayer = labelRef.current;
    if (!mount || !labelLayer) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError("Thiết bị không hỗ trợ WebGL nên không hiển thị được mô hình 3D.");
      return;
    }
    setError(null);

    const exploded = variant === "exploded";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !exploded;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(exploded ? 0xefede8 : 0xe9e7e2);
    scene.add(new THREE.HemisphereLight(0xfff4e2, 0x6b6157, 0.95));
    const sun = new THREE.DirectionalLight(0xffe6c4, 1.35);
    sun.castShadow = !exploded;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 });
    sun.shadow.bias = -0.0006;
    sun.position.set(-14, 30, 12);
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = exploded ? 220 : 90;

    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
    renderer.clippingPlanes = exploded ? [] : [plane];

    const mats = createMaterials();
    const house = buildHouse(model, mats);
    scene.add(house.root);

    const W = model.width;
    const step = W + EXPLODE_GAP;
    const n = model.floors.length;
    if (exploded) {
      house.floors.forEach((g, k) => g.position.set(k * step, -model.levels[k], 0));
      house.roof.visible = false;
      house.neighbors.visible = false;
      house.site.visible = false;
      const ground = new THREE.Mesh(
        new THREE.BoxGeometry((n - 1) * step + W + 6, 0.2, house.size.depth + 4),
        new THREE.MeshStandardMaterial({ color: 0xdcd6cc, roughness: 1 })
      );
      ground.position.set(((n - 1) * step) / 2, -0.28, 0);
      scene.add(ground);
    }

    // ---------- Tường hai bên tự trong suốt khi quay về phía camera ----------
    // Khung main: chỉ tường phải (tường trái đã có nút "Bỏ tường bên trái").
    // Khung tách tầng: cả hai bên, mỗi tầng xét riêng theo vị trí của nó.
    house.root.updateMatrixWorld(true);
    const sideWalls: { mesh: THREE.Mesh; x: number; nx: number }[] = [];
    house.root.traverse((o) => {
      const side = (o.userData as { side?: "L" | "R" | null }).side;
      if (!side || (!exploded && side === "L")) return;
      const v = new THREE.Vector3();
      o.getWorldPosition(v);
      sideWalls.push({ mesh: o as THREE.Mesh, x: v.x, nx: side === "R" ? 1 : -1 });
    });
    const updateSideWalls = () => {
      for (const sw of sideWalls) {
        const ud = sw.mesh.userData as { mat: THREE.Material; raw: THREE.Material | null };
        // Camera ở phía ngoài của tường (theo pháp tuyến hướng ra ngoài nhà)
        const facing = (camera.position.x - sw.x) * sw.nx > 0.05;
        const base = state.mode === "raw" && ud.raw ? ud.raw : ud.mat;
        sw.mesh.material = facing ? mats.wallGhost : base;
        for (const ch of sw.mesh.children) ch.visible = !facing;
      }
    };

    // ---------- Nhãn phòng (DOM chiếu từ 3D) ----------
    const Dc = house.offset.z;
    const toWorld = (x: number, y: number, d: number, k: number) =>
      new THREE.Vector3(x - W / 2 + (exploded ? k * step : 0), y, -d + Dc);
    const labels: Label[] = [];
    labelLayer.innerHTML = "";
    computeFloorAreas(model).forEach((fa) => {
      const yy = exploded ? 0.05 : model.levels[fa.index] + 0.05;
      for (const r of fa.rooms) {
        const [x0, x1, d0, d1] = r.main;
        const xc = (x0 + x1) / 2;
        const dc = (d0 + d1) / 2;
        const el = document.createElement("div");
        el.className = "h3d-area";
        const nm = document.createElement("span");
        nm.textContent = r.name;
        const ar = document.createElement("b");
        ar.textContent = `${fmtM2(r.area)} m²`;
        el.append(nm, ar);
        el.style.visibility = "hidden";
        labelLayer.appendChild(el);
        labels.push({
          el,
          floor: fa.index,
          pos: toWorld(xc, yy, dc, fa.index),
          ex: [toWorld(x0, yy, dc, fa.index), toWorld(x1, yy, dc, fa.index)],
          ed: [toWorld(xc, yy, d0, fa.index), toWorld(xc, yy, d1, fa.index)],
          w: 0,
          h: 0,
        });
      }
    });

    // Nút tên tầng trước mặt tiền (khung tách tầng)
    const floorButtons: { el: HTMLButtonElement; pos: THREE.Vector3 }[] = [];
    if (exploded) {
      model.floors.forEach((fl, k) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "h3d-flname";
        el.textContent = fl.name;
        el.addEventListener("click", () => onFloorClickRef.current?.(k));
        labelLayer.appendChild(el);
        floorButtons.push({ el, pos: toWorld(W / 2, 0.05, house.size.d0 - 1.2, k) });
      });
    }

    // ---------- Vẽ theo yêu cầu ----------
    // Trạng thái hiển thị đọc trong vòng render (effect bên dưới cập nhật)
    const state = { mode: "floor" as HouseViewMode };
    let dirty = 3;
    const invalidate = () => {
      dirty = 3;
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let anim: { t0: number; dur: number; p0: THREE.Vector3; q0: THREE.Vector3; p1: THREE.Vector3; q1: THREE.Vector3 } | null = null;
    const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, instant = false) => {
      if (instant || reduceMotion) {
        camera.position.copy(pos);
        controls.target.copy(target);
        anim = null;
      } else {
        anim = { t0: performance.now(), dur: 900, p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: target };
      }
      invalidate();
    };

    // Vị trí camera theo chế độ xem, tính theo kích thước nhà và tỉ lệ khung.
    // Khung dọc (hẹp) thì lùi camera xa hơn để nhà vừa khung.
    let lastView: { mode: HouseViewMode; floor: number } | null = null;
    let userMoved = false;
    controls.addEventListener("start", () => {
      userMoved = true;
    });
    const viewPose = (mode: HouseViewMode, floor: number) => {
      const { depth, height } = house.size;
      // Xem cả tòa cần lùi xa hơn vì nhà cao ~17 m trong khung hẹp
      const whole = mode === "all" || mode === "raw";
      const kk = whole
        ? Math.min(2.6, Math.max(1.1, 1.2 / Math.max(camera.aspect, 0.3)))
        : Math.min(1.8, Math.max(1, 0.8 / Math.max(camera.aspect, 0.3)));
      let p: THREE.Vector3;
      let t: THREE.Vector3;
      if (mode === "top") {
        p = new THREE.Vector3(0, depth * 1.9 + 6, 0.01);
        t = new THREE.Vector3(0, 0, 0);
      } else if (mode === "all" || mode === "raw") {
        t = new THREE.Vector3(0, height * 0.38, 0);
        p = new THREE.Vector3(-depth * 0.85 - 2, height * 0.9 + 3, depth * 0.35 + 4);
      } else {
        const h = model.levels[floor] ?? 0;
        t = new THREE.Vector3(0, h + 0.5, 0);
        p = new THREE.Vector3(-depth * 0.75 - 3, h + depth * 0.95 + 3, depth * 0.55 + 3);
      }
      p.sub(t).multiplyScalar(kk).add(t);
      return { p, t };
    };
    const frameView = (mode: HouseViewMode, floor: number) => {
      if (exploded) return;
      const first = lastView === null;
      lastView = { mode, floor };
      userMoved = false;
      const { p, t } = viewPose(mode, floor);
      flyTo(p, t, first);
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      if (w === 0) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (exploded) fitRow();
      else if (lastView && !userMoved && !anim) {
        // Khung đổi kích thước khi khách chưa tự xoay → đặt lại camera cho vừa
        const { p, t } = viewPose(lastView.mode, lastView.floor);
        camera.position.copy(p);
        controls.target.copy(t);
      }
      invalidate();
    };

    function fitRow() {
      const rx = ((n - 1) * step) / 2;
      const hf = Math.atan(Math.tan((19 * Math.PI) / 180) * camera.aspect);
      const dist = Math.max((rx + W / 2 + 1) / Math.tan(hf), house.size.depth * 1.5) * 1.1;
      camera.position.set(rx, dist * 0.85, dist * 0.55);
      controls.target.set(rx, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    controls.addEventListener("change", invalidate);

    const tmp = new THREE.Vector3();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const project = (v: THREE.Vector3, w: number, h: number): [number, number, number] => {
      tmp.copy(v).project(camera);
      return [((tmp.x + 1) / 2) * w, ((1 - tmp.y) / 2) * h, tmp.z];
    };

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (anim) {
        const t = Math.min(1, (now - anim.t0) / anim.dur);
        const e = ease(t);
        camera.position.lerpVectors(anim.p0, anim.p1, e);
        controls.target.lerpVectors(anim.q0, anim.q1, e);
        if (t >= 1) anim = null;
        dirty = 3;
      }
      controls.update();
      if (dirty <= 0) return;
      dirty--;
      updateSideWalls();
      renderer.render(scene, camera);

      const w = mount.clientWidth;
      const h = mount.clientHeight;
      // Tầng có nhãn: khung main → tầng đang bị cắt; khung exploded → tất cả
      let active = -1;
      if (!exploded) {
        for (let k = 0; k < model.levels.length; k++) if (model.levels[k] < plane.constant - 0.3) active = k;
        if (plane.constant >= model.topY + 0.5 || state.mode === "raw") active = -1;
      }
      for (const lb of labels) {
        let ok = exploded || lb.floor === active;
        if (ok) {
          const [sx, sy, sz] = project(lb.pos, w, h);
          ok = sz < 1 && sx > -40 && sx < w + 40 && sy > -40 && sy < h + 40;
          if (ok) {
            if (!lb.w) {
              lb.el.style.visibility = "visible";
              lb.w = lb.el.offsetWidth || 60;
              lb.h = lb.el.offsetHeight || 28;
            }
            const a = project(lb.ex[0], w, h);
            const b = project(lb.ex[1], w, h);
            const c = project(lb.ed[0], w, h);
            const d = project(lb.ed[1], w, h);
            const sw = Math.max(Math.abs(b[0] - a[0]), Math.abs(d[0] - c[0]));
            const sh = Math.max(Math.abs(b[1] - a[1]), Math.abs(d[1] - c[1]));
            const s = Math.max(0.32, Math.min(1, (0.85 * sw) / lb.w, (0.85 * sh) / lb.h));
            lb.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%) scale(${s.toFixed(3)})`;
          }
        }
        lb.el.style.visibility = ok ? "visible" : "hidden";
      }
      for (const fb of floorButtons) {
        const [sx, sy, sz] = project(fb.pos, w, h);
        fb.el.style.visibility = sz < 1 ? "visible" : "hidden";
        fb.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
      }
    };

    resize();
    if (exploded) fitRow();
    raf = requestAnimationFrame(frame);

    ctx.current = { renderer, camera, controls, plane, house, labels, invalidate, frameView, state };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposeTree(scene);
      mats.all.forEach((m) => m.dispose());
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (m && !mats.all.includes(m as THREE.Material)) (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.innerHTML = "";
      ctx.current = null;
    };
  }, [model, variant]);

  // ---------- Áp dụng lựa chọn hiển thị ----------
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    c.state.mode = mode;
    const raw = mode === "raw";
    c.house.root.traverse((o) => {
      const ud = o.userData as {
        kind?: string;
        left?: boolean;
        side?: "L" | "R" | null;
        mat?: THREE.Material;
        raw?: THREE.Material | null;
      };
      if (!ud.kind || ud.kind === "edge" || ud.kind === "cap") return;
      let vis = true;
      if (hideLeft && ud.left) vis = false;
      if (ud.kind === "furn") vis = vis && showFurniture && !raw;
      if (ud.kind === "finish") vis = vis && !raw;
      o.visible = vis;
      // Tường hai bên do updateSideWalls() quyết định vật liệu mỗi khung hình
      if (ud.kind === "wall" && ud.mat && !ud.side) (o as THREE.Mesh).material = raw && ud.raw ? ud.raw : ud.mat;
    });
    if (variant === "main") {
      c.house.neighbors.visible = showNeighbors;
      c.plane.constant = clip;
    }
    c.invalidate();
  }, [mode, hideLeft, showFurniture, showNeighbors, clip, variant, model]);

  // ---------- Camera theo chế độ xem (khung main) ----------
  useEffect(() => {
    ctx.current?.frameView(mode, floor);
  }, [mode, floor, variant, model]);

  return (
    <div className="relative w-full h-full min-h-[320px] select-none overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <div ref={labelRef} className="h3d-labels pointer-events-none absolute inset-0 overflow-hidden" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-[14px] font-semibold text-[#6F6A62]">
          {error}
        </div>
      )}
    </div>
  );
}
