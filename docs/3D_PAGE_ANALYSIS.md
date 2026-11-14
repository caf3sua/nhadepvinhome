# Phân tích trang 3D ocean23.vn/3d → kế hoạch cải thiện `/3d`

> Quét ngày 13/11/2026: chụp màn hình desktop 1440px + mobile 390px, đọc script inline (~105 KB) của trang gốc, so sánh với `src/app/(map)/3d/ThreeDView.tsx` + `src/components/three/House3DViewer.tsx`.
> Ảnh: `docs/reference/3d-original-desktop.png`, `3d-original-mobile.png`, `3d-current.png`.
> **Bản quyền:** dữ liệu căn của bản gốc (toạ độ phòng, nội thất, ghi chú lấy từ hồ sơ thiết kế họ có) là nội dung của ocean23.vn. Chỉ học **cách tổ chức dữ liệu và kỹ thuật dựng hình**; số liệu từng căn phải nhập từ bản vẽ mà chúng ta có quyền dùng.

---

## 1. Tóm tắt

Khác biệt lớn nhất: bản gốc **dựng nhà từ dữ liệu bản vẽ thật** (mỗi phòng, tường, thang, nội thất đều có toạ độ mét), còn bản hiện tại dùng **một mẫu nhà chung** cho mọi căn (chỉ đổi kích thước lô; phòng và nội thất giống nhau ở mọi căn; diện tích là chuỗi gõ tay hoặc ước `landArea × 0,32`). Vì vậy mọi cải tiến khác (nhãn phòng đúng chỗ, bảng diện tích, khung "bóc mái" 3D) đều phụ thuộc việc **chuyển sang mô hình dữ liệu theo toạ độ**.

| | ocean23.vn/3d | `/3d` hiện tại |
|---|---|---|
| Nguồn hình | Dữ liệu từng căn: phòng, tường, cửa, thang, thang máy, mái, nội thất | Mẫu chung, chỉ co giãn theo kích thước lô |
| Số căn | 13 căn (8 căn đánh dấu "ước lượng") | 8 nút: 2 căn viết tay + 6 căn sinh từ `DESIGN_TEMPLATES` với số liệu ước chừng |
| Cao độ tầng | Mảng `LV` riêng từng căn (VD 0 / 3,9 / 7,2 / 10,5 / 13,8) | Cố định 3,4 m |
| Số tầng | 3 tầng + tum … 5 tầng, tuỳ căn | Luôn 5 (lưới `grid-cols-5` cứng) |
| Diện tích phòng | **Tự tính** từ toạ độ, trừ lõi thang; cho phép ghi đè số trên bản vẽ | Chuỗi gõ tay |
| Khung "Từng tầng · bóc mái" | **Khung 3D thứ 2**: các tầng tách rời xếp 1 hàng, có nhãn phòng, bấm tên tầng | Thẻ HTML 3 ô chữ, không phải 3D |
| Bảng "Diện tích các phòng" | Có, đủ từng tầng | Không có |
| Kích thước lô (dim) | Đường kích thước vàng + số mm trên nền | Không có |
| Camera | Bay mượt 0,9s, tự lùi theo tỉ lệ khung, tôn trọng `prefers-reduced-motion` | Nhảy tức thì |
| Hiệu năng | Chỉ vẽ khi có thao tác; 1 canvas cho 2 khung | Vẽ liên tục 60fps; dựng lại toàn bộ scene khi đổi căn và **không giải phóng** geometry/material |
| Dark mode | Có (biến CSS + theo hệ điều hành) | Không |
| Hash URL | Đổi căn → cập nhật `#id`, mở link đúng căn | Đọc hash lúc vào, có cập nhật khi bấm |
| Lỗi tải 3D | Báo "Không tải được thư viện 3D…" | Không xử lý |

---

## 2. Bản gốc: bố cục & tương tác

### 2.1 Bố cục
**Desktop (> 880px)** – 3 cột, cao bằng màn hình:
1. **Khung "Cả tòa"** (trái): tiêu đề trạng thái `Cả tòa · Cắt ngang ở +3,9 m`; tab `Tầng 1…n · Toàn nhà · Khung thô · Từ trên`; mô hình 3D có mặt cắt ngang; nhãn phòng (tên + m²) chỉ hiện cho **tầng đang bị cắt**; đường kích thước lô; dưới cùng: 3 checkbox (`Bỏ tường bên trái`, `Nội thất`, `Nhà bên cạnh`) + thanh trượt `Cắt ngang`.
2. **Khung "Từng tầng · bóc mái"** (giữa): cùng mô hình nhưng các tầng được **dịch ngang thành 1 hàng** (mỗi tầng hạ về cao độ 0, bỏ trần/mái), nhãn phòng thu nhỏ theo kích thước phòng, nút tên tầng (vàng) nằm trước mặt tiền; bấm → chuyển khung trái sang tầng đó.
3. **Panel phải**: lưới chọn căn (2 cột, nút đang xem tô vàng + badge `▶ Đang xem`), eyebrow phân khu · dự án, H1 tên căn, chip thông số, thẻ mô tả tầng (tiêu đề + đoạn + danh sách diện tích), bảng **Diện tích các phòng** (tổng tầng + từng phòng), "Xem thêm", ghi chú nguồn số liệu (theo bản vẽ / ước lượng / hướng dẫn chuột).

**Mobile (≤ 880px)** – xếp dọc: khung 3D trái (~490px) → khung bóc mái (~354px) → panel (dài ~2.100px). Hai khung 3D dùng chung **một canvas** chia viewport.

### 2.2 Các chế độ xem
| Nút | Hành vi |
|---|---|
| Tầng k | Mặt cắt đặt ngay dưới sàn tầng k+1 (`LV[k+1] − 0,05`), camera bay tới tầng k, panel hiện mô tả + diện tích tầng k |
| Toàn nhà | Bỏ mặt cắt, camera nhìn cả tòa, ghi chú nguồn số liệu + cao độ đỉnh nhà |
| Khung thô | Ẩn nội thất/hoàn thiện, tường đổi sang vật liệu **gạch** (`raw`), xem khung cột-sàn-thang |
| Từ trên | Camera nhìn thẳng xuống như mặt bằng, kéo thanh cắt để đổi tầng |
| Thanh cắt ngang | 0 → đỉnh mái + 2 m; nhãn phòng đi theo tầng đang bị cắt |

---

## 3. Bản gốc: mô hình dữ liệu (nên áp dụng)

Toạ độ mét: `x` ngang nhà (từ tường trái, nhìn từ đường vào), `d` sâu từ mép lô phía trước.

```ts
interface HouseUnit {
  id: string;               // "pho-bien-119" – dùng làm hash
  name: string;             // "Phố Biển 119 m²"
  project: string;          // "Phân khu Phố Biển · Vinhomes Ocean Park 3"
  W: number;                // bề rộng nhà
  F: number;                // khoảng lùi mặt tiền (bậc tam cấp)
  R: number;                // d của tường sau
  LOT: number;              // chiều sâu lô
  side?: [number, number];  // [x bắt đầu, x kết thúc] sân/vườn hông (căn góc)
  corner?: "L" | "R";
  LV: number[];             // cao độ sàn từng tầng, VD [0, 3.9, 7.2, 10.5, 13.8]
  roof: { y: number; top: number; tank?: Rect; tum?: number[]; mansard?: …; glass?: … };
  canopy?: number[][];      // mái kính/mái che
  core: { stair: Rect; lift?: Rect; wrap?: "L" | "R"; liftDoor: "L" | "R" | "F" | "B" };
  specs: string[];          // chip thông số
  est?: boolean;            // true = có số liệu ước lượng
  note: string;             // nguồn số liệu
  floors: {
    name: string; t: string; d: string; front?: number;   // front: tầng lùi (lô gia)
    rooms: [name, kind: "r"|"w"|"h"|"o", x0, x1, d0, d1, areaOverride?][];
    furn: [kind, x0, x1, d0, d1, facing?: "L"|"R"|"F"|"B", height?][];
  }[];
}
type Rect = [x0: number, x1: number, d0: number, d1: number];
```

- **Loại phòng** quyết định vật liệu: `r` phòng (sàn gỗ), `w` WC (gạch men, tường ốp), `h` sảnh/hành lang, `o` ngoài trời (lát sân, không trần).
- **Nội thất** ~25 loại tham số hoá: `sofa, arm, ctab, tv, bed, ward, desk, shelf, kit, fridge, dtab, wc, basin, shower, tub, wash, altar, plant, pool, golf, car, sauna, tank…` – mỗi loại là 1 hàm dựng từ hộp/trụ.
- **Diện tích tự tính**: cộng các hình chữ nhật cùng tên phòng, trừ phần giao với lõi thang/thang máy (trừ phòng loại `h`), hoặc dùng số ghi đè từ bản vẽ.
- **Thang**: 4 kiểu dựng (`stairWrap` quấn quanh thang máy, `stairI`, `stairU`, `stairSpiral`) + `liftShaft`; sàn được khoét lỗ thang bằng `slabHoles`.
- **Tường có ô cửa**: `wallX / wallD(…, ops)` với danh sách lỗ `[a, b, đáy, đỉnh]`.

---

## 4. Bản gốc: kỹ thuật dựng hình đáng học

1. **Một renderer, hai viewport** (`setScissorTest` + `setViewport` theo `getBoundingClientRect` của từng khung): khung trái có clipping plane, khung phải không. Trước mỗi lượt vẽ gọi `setExplode(true/false)` để dịch các mesh theo tầng – không nhân đôi scene.
2. **Tách tầng**: mỗi mesh lưu `userData.fl` (tầng) và `ceil` (là trần); khi tách: `position += (k × bước, −LV[k], 0)`, ẩn mái/trần/nhà bên.
3. **Mặt cắt "đen"**: mỗi tường có thêm mesh `BackSide` màu đen + mặt trên đen → nhìn như bản vẽ mặt cắt kiến trúc.
4. **Nhãn HTML chiếu 3D → 2D**, **co giãn theo kích thước phòng trên màn hình** (`scale` 0,3–1), ẩn khi ra ngoài khung.
5. **Chỉ render khi cần**: biến đếm `canVe` reset khi có pointer/wheel/resize/đổi theme hoặc camera đang bay; còn lại bỏ qua frame → tiết kiệm pin.
6. **Camera**: `camFor(key)` tính vị trí theo kích thước nhà; `flyTo` nội suy ease-out cubic 900 ms; hệ số lùi theo aspect để nhà vừa khung dọc (mobile).
7. **Ánh sáng/vật liệu**: Hemisphere + Directional có bóng (2048), ACES tone mapping, sRGB, viền cạnh `EdgesGeometry` mờ 28%, bảng vật liệu đặt tên (`concrete, brick, plaster, wcTile, floorWood…`).
8. **Theme**: màu nền/sàn/viền đọc từ biến CSS `--scene, --ground, --edge`, cập nhật khi đổi dark mode.

---

## 5. `/3d` hiện tại: vấn đề cụ thể

| # | Vấn đề | Vị trí |
|---|---|---|
| 1 | Hình nhà là mẫu chung: phòng/nội thất giống nhau ở mọi căn, không theo bản vẽ | `House3DViewer.tsx` (~870 dòng dựng tay) |
| 2 | 6/8 căn có số liệu ước chừng: diện tích `landArea × 0,32`, lõi thang luôn "8,5 m²", mô tả lặp `t.summary` ở mọi tầng, luôn 5 tầng | `ThreeDView.tsx:192-236` |
| 3 | Nhãn phòng đặt theo tỉ lệ `nx/nz` ước chừng → lệch khỏi phòng thật, chồng nhau | `ThreeDView.tsx` `rooms[].nx/nz` |
| 4 | Cao tầng cố định 3,4 m; thanh cắt tính `floor × 3,4 − 0,2` | `FLOOR_HEIGHT`, `selectFloor()` |
| 5 | Cột "Từng tầng · bóc mái" chỉ là thẻ HTML, không có hình 3D | `ThreeDView.tsx:416-471` |
| 6 | Không có bảng diện tích từng phòng, không có kích thước lô | — |
| 7 | Đổi căn → dựng lại toàn scene, **không dispose** geometry/material/texture → rò rỉ bộ nhớ GPU khi bấm nhiều căn | effect đầu, cleanup chỉ `renderer.dispose()` |
| 8 | Render liên tục 60fps kể cả khi đứng yên | `animate()` |
| 9 | Chỉ nghe `window.resize`, không `ResizeObserver` → canvas sai kích thước khi layout đổi | `handleResize` |
| 10 | Camera nhảy tức thì; khi "Bỏ tường bên trái" camera đổi phía | effect thứ hai |
| 11 | `PCFSoftShadowMap` đã bị bỏ ở three r187 → cảnh báo console mỗi lần dựng scene | console |
| 12 | "Khung thô" = bật `wireframe` cho mọi vật liệu (lưới tam giác), khác hẳn ý nghĩa "nhà thô" | `wireframe` |
| 13 | Không có thông báo khi WebGL lỗi; không dark mode; không `prefers-reduced-motion` | — |

---

## 6. Kế hoạch cải thiện (đề xuất)

### Giai đoạn 1: Nền dữ liệu (bắt buộc, làm trước)
1. Tạo `src/data/houses3d/types.ts` theo schema mục 3 (kèm `est`, `note`, ghi đè diện tích).
2. Mỗi căn 1 file `src/data/houses3d/<id>.ts`; `index.ts` xuất danh sách. Bỏ `MODELS_3D` sinh tự động từ `DESIGN_TEMPLATES`.
3. `src/lib/house3d/areas.ts`: hàm thuần tính diện tích từng phòng/tầng (có unit test).
4. **Nhập dữ liệu 1–2 căn mẫu** từ bản vẽ chúng ta có, để dựng engine; căn chưa có bản vẽ thì **ẩn** thay vì bịa số.

### Giai đoạn 2: Engine dựng hình mới
5. Tách `House3DViewer` thành module thuần (không React): `buildHouse(unit) → { group, meshes(userData.fl/ceil/kind/tag), labels, dims }` gồm `box, wallX/wallD (ô cửa), slabHoles, stair*, liftShaft, furniture/*`.
6. Vật liệu theo loại phòng + vật liệu "thô" (gạch) cho chế độ Khung thô (thay `wireframe`); viền `EdgesGeometry`; mặt cắt đen.
7. `dispose()` đầy đủ khi đổi căn (traverse geometry + material), dùng chung material.
8. Render theo yêu cầu (dirty flag) + `ResizeObserver` + bỏ `PCFSoftShadowMap` → `PCFShadowMap`/`VSMShadowMap`.

### Giai đoạn 3: Giao diện ngang bản gốc
9. **1 canvas, 2 viewport**: khung trái "Cả tòa" (có cắt) + khung giữa "Từng tầng · bóc mái" 3D thật, nút tên tầng bấm được.
10. Nhãn phòng co giãn theo kích thước phòng, chỉ hiện tầng đang cắt; đường kích thước lô (mm).
11. Camera `flyTo` ease-out + `prefers-reduced-motion`; vị trí camera tính theo kích thước nhà.
12. Panel phải: thêm bảng **Diện tích các phòng**, ghi chú nguồn số liệu (Theo bản vẽ / Ước lượng), "Xem thêm"; số tầng động (bỏ `grid-cols-5`).
13. Thông báo lỗi WebGL; dark mode bằng biến CSS (tuỳ chọn).

### Giai đoạn 4: Khác biệt so với bản gốc (giá trị riêng của mình)
14. Nút **"Tìm căn đang bán giống mẫu này"** lọc thẳng sang `/quy-can?phan-khu=…&dt=…` thay vì chỉ mở form.
15. Liên kết 2 chiều với `/mau-thiet-ke` (mỗi mẫu → `/3d#id`) và với thẻ căn trong `/quy-can` (căn có mẫu 3D hiện nút "Xem 3D").
16. (Tuỳ chọn) đo khoảng cách bằng cách bấm 2 điểm; chụp ảnh khung 3D để gửi Zalo.

### Ước lượng
| Giai đoạn | Khối lượng |
|---|---|
| 1 (schema + diện tích + 1–2 căn) | nhỏ – vừa; phụ thuộc bản vẽ |
| 2 (engine) | lớn nhất: viết lại ~70% `House3DViewer` |
| 3 (UI 2 viewport) | vừa |
| 4 | nhỏ |

---

## 7. Cần bạn quyết định
1. **Nguồn dữ liệu căn**: có bản vẽ (PDF/CAD/ảnh mặt bằng) cho những mẫu nào? Mỗi căn cần: kích thước lô, cao độ tầng, toạ độ phòng, vị trí thang/thang máy.
2. Trong lúc chưa có bản vẽ: **ẩn** các căn chưa có dữ liệu thật, hay giữ hiển thị với nhãn "minh hoạ"?
3. Có làm khung "bóc mái" 3D thật (giai đoạn 3, mục 9) ngay không, hay giữ thẻ HTML ở bản đầu?
4. Có cần dark mode cho trang 3D không?
