"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface Room3DLabel {
  name: string;
  area: string;
  floor: number;
  nx: number;
  nz: number;
}

export interface House3DModelInput {
  slug: string;
  lotWidth: number;
  lotDepth: number;
  houseWidth: number;
  houseDepth: number;
  frontSetback: number;
  backSetback: number;
  floors: number;
  hasSideGarden?: boolean;
  isClinicFloor1?: boolean;
  roomLabels: Room3DLabel[];
}

interface House3DViewerProps {
  model: House3DModelInput;
  viewMode: "floor" | "whole" | "wireframe" | "top";
  activeFloor: number;
  cutHeight: number;
  hideLeftWall: boolean;
  showFurniture: boolean;
  showNeighbor: boolean;
  onSelectFloor: (floor: number) => void;
  /** Khung hiển thị: cả hai, chỉ khung trái (cả tòa) hoặc chỉ khung phải (bóc mái). */
  layout?: "both" | "main" | "exploded";
}

const FLOOR_H = 4.0;

export function House3DViewer({
  model,
  viewMode,
  activeFloor,
  cutHeight,
  hideLeftWall,
  showFurniture,
  showNeighbor,
  onSelectFloor,
  layout = "both",
}: House3DViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const view1Ref = useRef<HTMLDivElement>(null);
  const view2Ref = useRef<HTMLDivElement>(null);
  const labels1Ref = useRef<HTMLDivElement>(null);
  const labels2Ref = useRef<HTMLDivElement>(null);

  const onSelectFloorRef = useRef(onSelectFloor);
  onSelectFloorRef.current = onSelectFloor;

  const stateRef = useRef<{
    clipPlane?: THREE.Plane;
    cam1?: THREE.PerspectiveCamera;
    ctrl1?: OrbitControls;
    cam2?: THREE.PerspectiveCamera;
    ctrl2?: OrbitControls;
    leftWalls1?: THREE.Group;
    furn1?: THREE.Group;
    neighbor1?: THREE.Group;
    house1?: THREE.Group;
    furn2?: THREE.Group;
    house2?: THREE.Group;
    floorHighlights2?: THREE.Mesh[];
    labels1: { el: HTMLDivElement; pos: THREE.Vector3; floor: number; isDim?: boolean }[];
    labels2: { el: HTMLDivElement; pos: THREE.Vector3; floor: number; isFloorBtn?: boolean }[];
  }>({ labels1: [], labels2: [] });

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const view1El = view1Ref.current;
    const view2El = view2Ref.current;
    const lbl1El = labels1Ref.current;
    const lbl2El = labels2Ref.current;
    if (!stage || !canvas || !view1El || !view2El || !lbl1El || !lbl2El) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    renderer.setScissorTest(true);

    // === SCENE 1 (Left: Stacked Building) ===
    const scene1 = new THREE.Scene();
    scene1.background = new THREE.Color(0xf1efeb);

    const cam1 = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
    cam1.position.set(-21, 14.5, 22);

    const ctrl1 = new OrbitControls(cam1, view1El);
    ctrl1.enableDamping = true;
    ctrl1.dampingFactor = 0.08;
    ctrl1.maxPolarAngle = Math.PI / 2 - 0.03;
    ctrl1.minDistance = 7;
    ctrl1.maxDistance = 65;

    // Warm architectural lighting matching ocean23.vn/3d
    scene1.add(new THREE.HemisphereLight(0xfff1dc, 0x3b3128, 0.85));
    const sun1 = new THREE.DirectionalLight(0xffe0b5, 1.0);
    sun1.position.set(18, 30, 14);
    sun1.castShadow = true;
    sun1.shadow.mapSize.set(2048, 2048);
    sun1.shadow.bias = -0.0004;
    sun1.shadow.camera.left = -18;
    sun1.shadow.camera.right = 18;
    sun1.shadow.camera.top = 18;
    sun1.shadow.camera.bottom = -18;
    scene1.add(sun1);

    // === SCENE 2 (Right: Exploded 5 Floors Side-by-Side) ===
    const scene2 = new THREE.Scene();
    scene2.background = new THREE.Color(0xf1efeb);

    const cam2 = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
    cam2.position.set(0, 44, 42);

    const ctrl2 = new OrbitControls(cam2, view2El);
    ctrl2.enableDamping = true;
    ctrl2.dampingFactor = 0.08;
    ctrl2.maxPolarAngle = Math.PI / 2 - 0.04;
    ctrl2.minDistance = 14;
    ctrl2.maxDistance = 95;
    ctrl2.target.set(0, 0.5, 0);

    scene2.add(new THREE.HemisphereLight(0xfff1dc, 0x3b3128, 0.88));
    const sun2 = new THREE.DirectionalLight(0xffe0b5, 0.95);
    sun2.position.set(16, 32, 18);
    sun2.castShadow = true;
    sun2.shadow.mapSize.set(2048, 2048);
    sun2.shadow.bias = -0.0004;
    sun2.shadow.camera.left = -28;
    sun2.shadow.camera.right = 28;
    sun2.shadow.camera.top = 18;
    sun2.shadow.camera.bottom = -18;
    scene2.add(sun2);

    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), cutHeight);

    // Shared Palette Materials
    const makeMats = (withClip: boolean) => {
      const cp = withClip ? [clipPlane] : [];
      return {
        wall: new THREE.MeshStandardMaterial({
          color: 0xf6f2ea,
          roughness: 0.78,
          clippingPlanes: cp,
          clipShadows: true,
          side: THREE.DoubleSide,
        }),
        wallCut: new THREE.MeshStandardMaterial({
          color: 0x34373b,
          roughness: 0.6,
          clippingPlanes: cp,
        }),
        tileFloor: new THREE.MeshStandardMaterial({
          color: 0xf1ebe0,
          roughness: 0.82,
          clippingPlanes: cp,
        }),
        woodFloor: new THREE.MeshStandardMaterial({
          color: 0xe4d9c6,
          roughness: 0.75,
          clippingPlanes: cp,
        }),
        yardFloor: new THREE.MeshStandardMaterial({
          color: 0xdcd7ce,
          roughness: 0.9,
          clippingPlanes: cp,
        }),
        plinth: new THREE.MeshStandardMaterial({
          color: 0xd9cdb9,
          roughness: 0.92,
        }),
        glass: new THREE.MeshStandardMaterial({
          color: 0xbcd8e6,
          transparent: true,
          opacity: 0.42,
          roughness: 0.15,
          clippingPlanes: cp,
        }),
        frame: new THREE.MeshStandardMaterial({
          color: 0x2c2f33,
          roughness: 0.5,
          clippingPlanes: cp,
        }),
        stair: new THREE.MeshStandardMaterial({
          color: 0xebe5d9,
          roughness: 0.75,
          clippingPlanes: cp,
        }),
        woodWarm: new THREE.MeshStandardMaterial({
          color: 0xb07a45,
          roughness: 0.65,
          clippingPlanes: cp,
        }),
        woodDark: new THREE.MeshStandardMaterial({
          color: 0x6f3a2c,
          roughness: 0.65,
          clippingPlanes: cp,
        }),
        fabric: new THREE.MeshStandardMaterial({
          color: 0xe6ddcc,
          roughness: 0.88,
          clippingPlanes: cp,
        }),
        fabricAccent: new THREE.MeshStandardMaterial({
          color: 0xb8834f,
          roughness: 0.82,
          clippingPlanes: cp,
        }),
        ceramic: new THREE.MeshStandardMaterial({
          color: 0xf6f2ea,
          roughness: 0.45,
          clippingPlanes: cp,
        }),
        mansard: new THREE.MeshStandardMaterial({
          color: 0x8d939a,
          roughness: 0.7,
          clippingPlanes: cp,
        }),
        green: new THREE.MeshStandardMaterial({
          color: 0x4f7f3b,
          roughness: 0.85,
          clippingPlanes: cp,
        }),
        lawn: new THREE.MeshStandardMaterial({
          color: 0x5f8c48,
          roughness: 0.92,
          clippingPlanes: cp,
        }),
        bluePool: new THREE.MeshStandardMaterial({
          color: 0x3b86c4,
          roughness: 0.25,
          clippingPlanes: cp,
        }),
        edgeLine: new THREE.LineBasicMaterial({
          color: 0x2a2d31,
          transparent: true,
          opacity: 0.35,
          clippingPlanes: cp,
        }),
      };
    };

    const m1 = makeMats(true);
    const m2 = makeMats(false);

    const addBox = (
      parent: THREE.Group,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      mat: THREE.Material,
      edgeMat: THREE.LineBasicMaterial | null = null,
      castShadow = true
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      parent.add(mesh);
      if (edgeMat) {
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
        lines.position.copy(mesh.position);
        parent.add(lines);
      }
      return mesh;
    };

    // Helper: builds a single floor module at local origin (0,0,0)
    const buildSingleFloor = (
      floorIdx: number, // 0..4
      mats: ReturnType<typeof makeMats>,
      houseGroup: THREE.Group,
      leftWallGroup: THREE.Group,
      furnGroup: THREE.Group,
      isExplodedView: boolean
    ) => {
      const fH = isExplodedView ? 2.55 : FLOOR_H;
      const hw = model.houseWidth;
      const hd = model.houseDepth;
      const wt = 0.16;
      const yBase = isExplodedView ? 0 : floorIdx * FLOOR_H;
      const ox = model.hasSideGarden ? -(model.lotWidth - hw) / 2 : 0;
      const oz = (model.backSetback - model.frontSetback) * 0.5;

      // Floor slab
      addBox(
        houseGroup,
        hw,
        0.14,
        hd,
        ox,
        yBase + 0.07,
        oz,
        floorIdx === 0 ? mats.tileFloor : mats.woodFloor,
        mats.edgeLine,
        false
      );

      // Front balcony on floors 2-4
      if (floorIdx >= 1 && floorIdx <= 3) {
        addBox(
          houseGroup,
          hw,
          0.12,
          1.15,
          ox,
          yBase + 0.06,
          oz + hd / 2 + 0.57,
          mats.yardFloor,
          mats.edgeLine,
          false
        );
        addBox(
          houseGroup,
          hw - 0.1,
          0.95,
          0.06,
          ox,
          yBase + 0.55,
          oz + hd / 2 + 1.12,
          mats.glass,
          mats.edgeLine,
          false
        );
      }

      // Front & Back yards on floor 1
      if (floorIdx === 0) {
        if (model.frontSetback > 0.2) {
          addBox(
            houseGroup,
            hw,
            0.1,
            model.frontSetback,
            ox,
            yBase + 0.05,
            oz + hd / 2 + model.frontSetback / 2,
            mats.yardFloor,
            mats.edgeLine,
            false
          );
        }
        if (model.backSetback > 0.2) {
          addBox(
            houseGroup,
            hw,
            0.1,
            model.backSetback,
            ox,
            yBase + 0.05,
            oz - hd / 2 - model.backSetback / 2,
            mats.yardFloor,
            mats.edgeLine,
            false
          );
        }
      }

      // Right wall
      addBox(
        houseGroup,
        wt,
        fH,
        hd,
        ox + hw / 2 - wt / 2,
        yBase + fH / 2,
        oz,
        mats.wall,
        mats.edgeLine
      );

      // Back wall
      addBox(
        houseGroup,
        hw,
        fH,
        wt,
        ox,
        yBase + fH / 2,
        oz - hd / 2 + wt / 2,
        mats.wall,
        mats.edgeLine
      );

      // Left wall (in scene 1 it can be hidden; in exploded scene 2 we always keep it low/open or thin)
      if (!isExplodedView) {
        addBox(
          leftWallGroup,
          wt,
          fH,
          hd,
          ox - hw / 2 + wt / 2,
          yBase + fH / 2,
          oz,
          mats.wall,
          mats.edgeLine
        );
      } else {
        addBox(
          houseGroup,
          wt,
          0.55,
          hd,
          ox - hw / 2 + wt / 2,
          yBase + 0.28,
          oz,
          mats.wall,
          mats.edgeLine
        );
      }

      // Front glass & aluminum frame
      addBox(
        houseGroup,
        hw - 0.36,
        fH - 0.25,
        0.06,
        ox,
        yBase + fH / 2,
        oz + hd / 2 - 0.06,
        mats.glass,
        null,
        false
      );
      addBox(
        houseGroup,
        0.2,
        fH,
        0.2,
        ox - hw / 2 + 0.1,
        yBase + fH / 2,
        oz + hd / 2 - 0.1,
        mats.wallCut,
        null
      );
      addBox(
        houseGroup,
        0.2,
        fH,
        0.2,
        ox + hw / 2 - 0.1,
        yBase + fH / 2,
        oz + hd / 2 - 0.1,
        mats.wallCut,
        null
      );

      // Interior core partition + glass elevator + stairs
      const coreZ = oz - 0.2;
      addBox(
        houseGroup,
        hw * 0.48,
        isExplodedView ? 1.65 : fH,
        0.1,
        ox - hw * 0.22,
        yBase + (isExplodedView ? 0.83 : fH / 2),
        coreZ - 1.15,
        mats.wall,
        mats.edgeLine
      );
      // Glass elevator shaft
      addBox(
        houseGroup,
        1.25,
        isExplodedView ? 2.1 : fH,
        1.25,
        ox - hw * 0.22,
        yBase + (isExplodedView ? 1.05 : fH / 2),
        coreZ,
        mats.glass,
        mats.edgeLine,
        false
      );
      // Stair steps
      for (let s = 0; s < 8; s++) {
        addBox(
          houseGroup,
          0.95,
          0.16,
          0.26,
          ox + hw * 0.24,
          yBase + 0.2 + s * (fH / 9),
          coreZ - 0.9 + s * 0.25,
          mats.stair,
          mats.edgeLine,
          false
        );
      }

      // WC partition next to core
      addBox(
        houseGroup,
        1.35,
        isExplodedView ? 1.55 : fH * 0.9,
        1.1,
        ox - hw * 0.22,
        yBase + (isExplodedView ? 0.78 : (fH * 0.9) / 2),
        coreZ + 1.25,
        mats.ceramic,
        mats.edgeLine,
        false
      );

      // Detailed Furniture
      const zFront = oz + hd * 0.27;
      const zBack = oz - hd * 0.29;

      if (floorIdx === 0) {
        if (model.isClinicFloor1) {
          // Clinic reception desk + waiting row + 2 treatment beds in rear
          addBox(furnGroup, 1.8, 0.95, 0.55, ox + 0.35, yBase + 0.55, zFront - 0.6, mats.woodWarm, mats.edgeLine);
          addBox(furnGroup, 2.2, 0.45, 0.55, ox - 0.4, yBase + 0.32, zFront + 0.75, mats.fabric, mats.edgeLine);
          // 2 treatment beds
          addBox(furnGroup, 0.85, 0.52, 1.85, ox - 0.9, yBase + 0.34, zBack, mats.ceramic, mats.edgeLine);
          addBox(furnGroup, 0.85, 0.52, 1.85, ox + 0.75, yBase + 0.34, zBack, mats.ceramic, mats.edgeLine);
        } else {
          // Living room sofa + rug + coffee table + TV
          addBox(furnGroup, 2.2, 0.38, 0.82, ox + 0.45, yBase + 0.32, zFront + 0.2, mats.fabric, mats.edgeLine);
          addBox(furnGroup, 2.2, 0.32, 0.16, ox + 0.45, yBase + 0.62, zFront + 0.52, mats.fabricAccent);
          addBox(furnGroup, 1.0, 0.34, 0.56, ox + 0.4, yBase + 0.3, zFront - 0.55, mats.woodWarm, mats.edgeLine);
          addBox(furnGroup, 1.5, 0.42, 0.36, ox - 0.5, yBase + 0.34, zFront - 1.2, mats.woodDark, mats.edgeLine);

          // Kitchen & dining
          addBox(furnGroup, hw - 0.7, 0.82, 0.58, ox, yBase + 0.54, oz - hd * 0.44, mats.ceramic, mats.edgeLine);
          addBox(furnGroup, 1.5, 0.72, 0.88, ox + 0.1, yBase + 0.48, zBack + 0.3, mats.woodWarm, mats.edgeLine);
        }
        // Plant pot
        addBox(furnGroup, 0.38, 0.55, 0.38, ox + hw * 0.36, yBase + 0.42, oz + hd * 0.43, mats.green, mats.edgeLine);
      } else if (floorIdx >= 1 && floorIdx <= 3) {
        // Upper floors: beds + pillows + blanket + wardrobe
        addBox(furnGroup, 1.7, 0.3, 1.95, ox + 0.2, yBase + 0.28, zFront, mats.woodWarm, mats.edgeLine);
        addBox(furnGroup, 1.56, 0.16, 1.82, ox + 0.2, yBase + 0.48, zFront, mats.ceramic);
        addBox(furnGroup, 1.56, 0.08, 0.78, ox + 0.2, yBase + 0.58, zFront - 0.25, mats.fabricAccent);

        addBox(furnGroup, 1.55, 0.3, 1.8, ox - 0.1, yBase + 0.28, zBack, mats.woodWarm, mats.edgeLine);
        addBox(furnGroup, 1.42, 0.16, 1.68, ox - 0.1, yBase + 0.48, zBack, mats.ceramic);

        addBox(furnGroup, 0.52, isExplodedView ? 1.5 : 2.1, 1.5, ox + hw / 2 - 0.48, yBase + (isExplodedView ? 0.85 : 1.15), zFront, mats.ceramic, mats.edgeLine);
      } else {
        // Floor 5: worship altar + terrace / laundry / jacuzzi pool look
        addBox(furnGroup, 1.4, 1.0, 0.54, ox, yBase + 0.64, zBack, mats.woodDark, mats.edgeLine);
        addBox(furnGroup, 1.5, 0.42, 1.1, ox, yBase + 0.32, zFront, mats.bluePool, mats.edgeLine);
        addBox(furnGroup, 0.45, 0.55, 0.45, ox + hw * 0.34, yBase + 0.42, zFront + 0.7, mats.green);
      }
    };

    // === POPULATE SCENE 1 (Stacked Building) ===
    const ground1 = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    );
    ground1.rotation.x = -Math.PI / 2;
    ground1.position.y = -0.25;
    ground1.receiveShadow = true;
    scene1.add(ground1);

    // Lot plinth in scene 1
    const lot1 = new THREE.Mesh(
      new THREE.BoxGeometry(model.lotWidth, 0.24, model.lotDepth),
      m1.plinth
    );
    lot1.position.y = -0.12;
    lot1.receiveShadow = true;
    scene1.add(lot1);

    const house1 = new THREE.Group();
    const leftWalls1 = new THREE.Group();
    const furn1 = new THREE.Group();
    const neighbor1 = new THREE.Group();

    if (model.hasSideGarden && model.lotWidth > model.houseWidth) {
      const gw = model.lotWidth - model.houseWidth;
      addBox(
        house1,
        gw - 0.12,
        0.08,
        model.lotDepth - 0.6,
        model.lotWidth / 2 - gw / 2,
        0.04,
        0,
        m1.lawn,
        null,
        false
      );
    }

    for (let f = 0; f < model.floors; f++) {
      buildSingleFloor(f, m1, house1, leftWalls1, furn1, false);
    }

    // Mansard / Roof cap on Scene 1
    addBox(
      house1,
      model.houseWidth + 0.24,
      0.7,
      model.houseDepth + 0.24,
      model.hasSideGarden ? -(model.lotWidth - model.houseWidth) / 2 : 0,
      model.floors * FLOOR_H + 0.35,
      (model.backSetback - model.frontSetback) * 0.5,
      m1.mansard,
      m1.edgeLine
    );

    // Clean translucent solid massing for neighbor houses (matching ocean23.vn!)
    const nbMat = new THREE.MeshStandardMaterial({
      color: 0xa29d95,
      transparent: true,
      opacity: 0.22,
      roughness: 0.9,
      clippingPlanes: [clipPlane],
    });
    const nbOx = model.hasSideGarden ? -(model.lotWidth - model.houseWidth) / 2 : 0;
    const nbOz = (model.backSetback - model.frontSetback) * 0.5;
    const nbMesh = new THREE.Mesh(
      new THREE.BoxGeometry(model.houseWidth, model.floors * FLOOR_H, model.houseDepth),
      nbMat
    );
    nbMesh.position.set(nbOx + model.houseWidth + 0.08, (model.floors * FLOOR_H) / 2, nbOz);
    neighbor1.add(nbMesh);

    scene1.add(house1);
    scene1.add(leftWalls1);
    scene1.add(furn1);
    scene1.add(neighbor1);

    // === POPULATE SCENE 2 (Exploded 5 Floors Side-by-Side) ===
    const ground2 = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 120),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    ground2.rotation.x = -Math.PI / 2;
    ground2.position.y = -0.02;
    ground2.receiveShadow = true;
    scene2.add(ground2);

    const house2 = new THREE.Group();
    const furn2 = new THREE.Group();
    const floorHighlights2: THREE.Mesh[] = [];
    const spacing = Math.max(model.houseWidth + 0.9, 5.4);
    const startX = -((model.floors - 1) * spacing) / 2;

    for (let f = 0; f < model.floors; f++) {
      const fx = startX + f * spacing;
      const fg = new THREE.Group();
      const lwg = new THREE.Group();
      const ffurn = new THREE.Group();
      fg.position.set(fx, 0, 0);
      ffurn.position.set(fx, 0, 0);

      buildSingleFloor(f, m2, fg, lwg, ffurn, true);

      // Highlight plinth under each floor
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(model.houseWidth + 0.5, 0.08, model.lotDepth + 0.4),
        new THREE.MeshStandardMaterial({
          color: 0xe3a400,
          transparent: true,
          opacity: f + 1 === activeFloor ? 0.35 : 0,
        })
      );
      pad.position.set(fx, -0.04, 0);
      scene2.add(pad);
      floorHighlights2.push(pad);

      house2.add(fg);
      furn2.add(ffurn);
    }

    scene2.add(house2);
    scene2.add(furn2);

    // === CREATE 3D PROJECTED LABELS ===
    lbl1El.innerHTML = "";
    lbl2El.innerHTML = "";

    const labels1: { el: HTMLDivElement; pos: THREE.Vector3; floor: number; isDim?: boolean }[] = [];
    const labels2: { el: HTMLDivElement; pos: THREE.Vector3; floor: number; isFloorBtn?: boolean }[] = [];

    const ox = model.hasSideGarden ? -(model.lotWidth - model.houseWidth) / 2 : 0;
    const oz = (model.backSetback - model.frontSetback) * 0.5;

    // Dimension labels in Scene 1
    const dimSpecs = [
      { text: `${(model.lotWidth * 1000).toLocaleString("de-DE")}`, pos: new THREE.Vector3(0, 0.2, model.lotDepth / 2 + 1.1) },
      { text: `${(model.lotDepth * 1000).toLocaleString("de-DE")}`, pos: new THREE.Vector3(model.lotWidth / 2 + 1.1, 0.2, 0) },
    ];
    dimSpecs.forEach((d) => {
      const div = document.createElement("div");
      div.className =
        "absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-[3px] bg-[#f6f5f1]/90 text-[#855c00] font-mono text-[11.5px] font-bold pointer-events-none whitespace-nowrap";
      div.textContent = d.text;
      lbl1El.appendChild(div);
      labels1.push({ el: div, pos: d.pos, floor: 1, isDim: true });
    });

    // Room labels for Scene 1 & Scene 2
    model.roomLabels.forEach((r) => {
      // Scene 1 label
      const d1 = document.createElement("div");
      d1.className =
        "absolute -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap bg-[#f6f5f1]/88 border border-[#e3a400] rounded-[4px] px-1.5 py-0.5 leading-tight pointer-events-none shadow-2xs";
      d1.innerHTML = `<div style="font-size:10px;color:#5f646b">${r.name}</div><div style="font-size:11px;font-weight:700;color:#1d2024">${r.area}</div>`;
      lbl1El.appendChild(d1);

      const wx = ox + (r.nx - 0.5) * model.houseWidth;
      const wz = oz + (r.nz - 0.5) * model.houseDepth;
      labels1.push({
        el: d1,
        pos: new THREE.Vector3(wx, (r.floor - 1) * FLOOR_H + 1.35, wz),
        floor: r.floor,
      });

      // Scene 2 label
      const fx = startX + (r.floor - 1) * spacing;
      const d2 = document.createElement("div");
      d2.className =
        "absolute -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap bg-[#f6f5f1]/88 border border-[#e3a400] rounded-[3px] px-1 py-0.5 leading-tight pointer-events-none";
      d2.innerHTML = `<div style="font-size:9px;color:#5f646b">${r.name}</div><div style="font-size:9.5px;font-weight:700;color:#1d2024">${r.area}</div>`;
      lbl2El.appendChild(d2);
      labels2.push({
        el: d2,
        pos: new THREE.Vector3(fx + wx, 1.35, wz),
        floor: r.floor,
      });
    });

    // Clickable Yellow Floor Buttons ("Tầng 1" .. "Tầng 5") under each 3D floor in Scene 2
    for (let f = 1; f <= model.floors; f++) {
      const fx = startX + (f - 1) * spacing;
      const btn = document.createElement("div");
      btn.className =
        "absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer whitespace-nowrap font-display font-extrabold text-[13px] bg-[#e3a400] text-[#1d1a10] rounded-[4px] px-2.5 py-0.5 shadow-md transition-transform hover:scale-105";
      btn.textContent = `Tầng ${f}`;
      btn.onclick = () => onSelectFloorRef.current(f);
      lbl2El.appendChild(btn);
      labels2.push({
        el: btn,
        pos: new THREE.Vector3(fx, 0.1, model.lotDepth / 2 + 1.45),
        floor: f,
        isFloorBtn: true,
      });
    }

    stateRef.current = {
      clipPlane,
      cam1,
      ctrl1,
      cam2,
      ctrl2,
      leftWalls1,
      furn1,
      neighbor1,
      house1,
      furn2,
      house2,
      floorHighlights2,
      labels1,
      labels2,
    };

    // Dual-Viewport Scissor Render Loop
    let rafId = 0;
    const tv = new THREE.Vector3();

    const projectLabels = (
      items: { el: HTMLDivElement; pos: THREE.Vector3; isFloorBtn?: boolean }[],
      cam: THREE.PerspectiveCamera,
      w: number,
      h: number
    ) => {
      items.forEach((item) => {
        tv.copy(item.pos).project(cam);
        if (tv.z > 1) {
          item.el.style.display = "none";
          return;
        }
        item.el.style.display = "block";
        item.el.style.left = `${(tv.x * 0.5 + 0.5) * w}px`;
        item.el.style.top = `${(-tv.y * 0.5 + 0.5) * h}px`;
      });
    };

    const renderFrame = () => {
      rafId = requestAnimationFrame(renderFrame);

      const stageRect = stage.getBoundingClientRect();
      if (stageRect.width < 10 || stageRect.height < 10) return;

      if (
        canvas.width !== Math.round(stageRect.width * renderer.getPixelRatio()) ||
        canvas.height !== Math.round(stageRect.height * renderer.getPixelRatio())
      ) {
        renderer.setSize(stageRect.width, stageRect.height, false);
      }

      ctrl1.update();
      ctrl2.update();

      const r1 = view1El.getBoundingClientRect();
      const r2 = view2El.getBoundingClientRect();

      // Viewport 1 (Left)
      if (r1.width > 4 && r1.height > 4) {
        const vx = r1.left - stageRect.left;
        const vy = stageRect.bottom - r1.bottom;
        cam1.aspect = r1.width / r1.height;
        cam1.updateProjectionMatrix();
        renderer.setViewport(vx, vy, r1.width, r1.height);
        renderer.setScissor(vx, vy, r1.width, r1.height);
        renderer.render(scene1, cam1);
        projectLabels(stateRef.current.labels1, cam1, r1.width, r1.height);
      }

      // Viewport 2 (Right exploded 5 floors)
      if (r2.width > 4 && r2.height > 4) {
        const vx = r2.left - stageRect.left;
        const vy = stageRect.bottom - r2.bottom;
        cam2.aspect = r2.width / r2.height;
        cam2.updateProjectionMatrix();
        renderer.setViewport(vx, vy, r2.width, r2.height);
        renderer.setScissor(vx, vy, r2.width, r2.height);
        renderer.render(scene2, cam2);
        projectLabels(stateRef.current.labels2, cam2, r2.width, r2.height);
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(rafId);
      ctrl1.dispose();
      ctrl2.dispose();
      renderer.dispose();
    };
  }, [model]);

  // Sync interactive controls & camera presets
  useEffect(() => {
    const s = stateRef.current;
    if (s.clipPlane) {
      s.clipPlane.constant =
        viewMode === "whole" || viewMode === "wireframe"
          ? model.floors * FLOOR_H + 3
          : cutHeight;
    }

    if (s.leftWalls1) s.leftWalls1.visible = !hideLeftWall;
    if (s.furn1) s.furn1.visible = showFurniture;
    if (s.furn2) s.furn2.visible = showFurniture;
    if (s.neighbor1) s.neighbor1.visible = showNeighbor;

    if (s.house1) {
      s.house1.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh &&
          obj.material instanceof THREE.MeshStandardMaterial
        ) {
          obj.material.wireframe = viewMode === "wireframe";
        }
      });
    }

    s.floorHighlights2?.forEach((pad, idx) => {
      const mat = pad.material as THREE.MeshStandardMaterial;
      mat.opacity = idx + 1 === activeFloor ? 0.42 : 0;
    });

    s.labels1.forEach((lbl) => {
      if (lbl.isDim) {
        lbl.el.style.opacity = "1";
        return;
      }
      const vis =
        viewMode === "whole" || viewMode === "wireframe" || lbl.floor === activeFloor;
      lbl.el.style.opacity = vis ? "1" : "0";
    });

    s.labels2.forEach((lbl) => {
      if (lbl.isFloorBtn) {
        lbl.el.style.outline =
          lbl.floor === activeFloor ? "2px solid #1d2024" : "none";
      }
    });

    if (s.cam1 && s.ctrl1) {
      if (viewMode === "top") {
        s.cam1.position.set(0, 32, 0.01);
        s.ctrl1.target.set(0, (activeFloor - 1) * FLOOR_H, 0);
      } else if (viewMode === "whole" || viewMode === "wireframe") {
        s.cam1.position.set(-22, 18, 24);
        s.ctrl1.target.set(0, (model.floors * FLOOR_H) / 2.2, 0);
      } else {
        const yT = (activeFloor - 1) * FLOOR_H + 1.4;
        s.cam1.position.set(hideLeftWall ? -21 : 21, yT + 14.5, 22);
        s.ctrl1.target.set(0, yT, 0);
      }
      s.ctrl1.update();
    }
  }, [
    model,
    viewMode,
    activeFloor,
    cutHeight,
    hideLeftWall,
    showFurniture,
    showNeighbor,
  ]);

  return (
    <div
      ref={stageRef}
      id="stage"
      className={`relative w-full h-full min-h-[540px] bg-[#f1efeb] grid grid-cols-1 ${
        layout === "both" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />

      {/* Left 3D Pane (#view) */}
      <div
        ref={view1Ref}
        id="view"
        className={`relative min-w-0 min-h-[340px] overflow-hidden touch-none cursor-grab active:cursor-grabbing ${
          layout === "exploded" ? "hidden" : ""
        }`}
      >
        <div ref={labels1Ref} className="absolute inset-0 pointer-events-none overflow-hidden" />
      </div>

      {/* Right Exploded 3D Pane (#view2) */}
      <div
        ref={view2Ref}
        id="view2"
        className={`relative min-w-0 min-h-[300px] overflow-hidden touch-none border-t lg:border-t-0 lg:border-l border-[#d3d0c9] cursor-grab active:cursor-grabbing ${
          layout === "main" ? "hidden" : ""
        }`}
      >
        <div ref={labels2Ref} className="absolute inset-0 pointer-events-none overflow-hidden" />
      </div>
    </div>
  );
}
