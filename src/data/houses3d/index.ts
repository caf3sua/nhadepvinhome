import type { HouseModel } from "@/lib/house3d/types";
import { HL_LKD_M2 } from "./hl-lkd-m2";
import { MRC_LK3D3 } from "./mrc-lk3d3";
import { VN_LKB_M1 } from "./vn-lkb-m1";
import { VN_SHA_M2 } from "./vn-sha-m2";

/** Các căn 3D dựng theo bản vẽ thật (toạ độ phòng). */
export const HOUSE_MODELS: HouseModel[] = [VN_LKB_M1, MRC_LK3D3, VN_SHA_M2, HL_LKD_M2];
