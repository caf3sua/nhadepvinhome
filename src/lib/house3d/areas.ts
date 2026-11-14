import type { HouseModel, Rect, RoomKind } from "./types";

export interface RoomArea {
  name: string;
  kind: RoomKind;
  area: number;
  /** Phần hình chữ nhật lớn nhất của phòng — dùng đặt nhãn. */
  main: Rect;
}

export interface FloorAreas {
  index: number;
  name: string;
  rooms: RoomArea[];
  /** Tổng diện tích sử dụng trong nhà (không tính ngoài trời). */
  indoor: number;
  /** Diện tích ngoài trời (ban công, lô gia, sân thượng). */
  outdoor: number;
  /** DTXD ghi trên bản vẽ (nếu có). */
  gross?: number;
}

const rectArea = (r: Rect) => Math.max(0, r[1] - r[0]) * Math.max(0, r[3] - r[2]);

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0])) *
  Math.max(0, Math.min(a[3], b[3]) - Math.max(a[2], b[2]));

/**
 * Gộp các hình chữ nhật cùng tên phòng trên một tầng thành một phòng.
 * Phòng không phải sảnh/thang được trừ phần chồng lên lõi thang.
 * Nếu bản vẽ có ghi diện tích (room.area) thì dùng số đó cho phần hình đó.
 */
export function computeFloorAreas(model: HouseModel): FloorAreas[] {
  return model.floors.map((floor, index) => {
    // Lõi thang của tầng: thang riêng đi lên từ tầng này (nếu có), ngược lại thang chữ U chung
    const stair = floor.stairUp?.rect ?? model.stair.rect;
    const groups = new Map<string, RoomArea & { mainArea: number }>();

    for (const room of floor.rooms) {
      let a = room.area ?? rectArea(room.rect);
      if (room.area == null && room.kind !== "h") a -= overlap(room.rect, stair);
      const own = rectArea(room.rect);

      const g = groups.get(room.name);
      if (!g) {
        groups.set(room.name, { name: room.name, kind: room.kind, area: a, main: room.rect, mainArea: own });
      } else {
        g.area += a;
        if (own > g.mainArea) {
          g.main = room.rect;
          g.mainArea = own;
        }
      }
    }

    const rooms: RoomArea[] = [...groups.values()].map(({ mainArea: _m, ...r }) => ({
      ...r,
      area: Math.round(r.area * 10) / 10,
    }));
    const indoor = rooms.filter((r) => r.kind !== "o").reduce((s, r) => s + r.area, 0);
    const outdoor = rooms.filter((r) => r.kind === "o").reduce((s, r) => s + r.area, 0);

    return {
      index,
      name: floor.name,
      rooms,
      indoor: Math.round(indoor * 10) / 10,
      outdoor: Math.round(outdoor * 10) / 10,
      gross: floor.grossArea,
    };
  });
}

/** Định dạng số m² kiểu Việt Nam: 24,1 */
export const fmtM2 = (v: number) => v.toFixed(1).replace(".", ",");
