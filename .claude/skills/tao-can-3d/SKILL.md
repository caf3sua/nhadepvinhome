---
name: tao-can-3d
description: Tạo một căn nhà 3D mới cho trang /3d từ ảnh mặt bằng (layout) các tầng — đo kích thước từ pixel, hiệu chỉnh theo bảng DTXD, viết file dữ liệu HouseModel, đăng ký vào danh sách và kiểm tra bằng ảnh chụp trình duyệt. Dùng khi người dùng gửi ảnh mặt bằng / layout / bản vẽ nhà liền kề, biệt thự, shophouse và muốn "tạo căn 3D", "dựng 3D theo layout", "thêm mẫu nhà vào trang 3d".
---

# Tạo căn 3D từ layout

Đầu vào: ảnh mặt bằng từng tầng (PNG/JPG/WEBP/PDF), tốt nhất kèm bảng DTXD (diện tích xây dựng từng tầng) và tên mẫu / phân khu / dự án.
Đầu ra: 1 file dữ liệu `src/data/houses3d/<id>.ts` được dựng tự động bởi engine có sẵn, hiện ở `/3d#<id>` với nhãn "Theo bản vẽ".

**Không sửa engine trừ khi bản vẽ có cấu kiện engine chưa hỗ trợ** (xem mục 6). Phần lớn công việc là đọc bản vẽ đúng và nhập toạ độ đúng.

## 0. Kiến trúc có sẵn (đọc trước khi làm)

| File | Vai trò |
|---|---|
| `src/lib/house3d/types.ts` | Schema `HouseModel` — đọc kỹ chú thích từng trường |
| `src/lib/house3d/build.ts` | Engine dựng hình từ dữ liệu (tường có ô cửa, `profile`, thang U, ban công, cửa sổ lồi, mansard, nội thất) |
| `src/lib/house3d/areas.ts` | Tự tính diện tích phòng (trừ lõi thang, trừ khi `area` ghi đè) |
| `src/components/three/HouseViewport.tsx` | Khung xem 3D (main có cắt ngang / exploded bóc mái) |
| `src/app/(map)/3d/ThreeDView.tsx` + `HouseDetails.tsx` | Trang /3d, panel phải |
| `src/data/houses3d/vn-lkb-m1.ts` | **Căn mẫu chuẩn** (thang sát tường trái, hành lang phải) — đọc để bắt chước cách nhập |
| `src/data/houses3d/mrc-lk3d3.ts` | Căn mẫu **căn góc, thang sát tường phải** (`landingSide: "R"`, `sideYard`, cửa sổ hông, sân trước + sau tầng 5) |
| `src/data/houses3d/vn-sha-m2.ts` | Căn mẫu **shophouse**: tầng 1 kinh doanh cao 3,9 m, thang thẳng riêng tầng 1 (`stairUp` + `stairHole` + lan can lỗ thang), lô gia tầng 4, mansard |
| `src/data/houses3d/index.ts` | Danh sách `HOUSE_MODELS` |
| `reference/template.ts` (trong skill này) | Khung file dữ liệu để copy |

Hệ toạ độ (mét): `x` ngang nhà, 0 = mặt ngoài tường trái nhìn từ đường vào · `d` chiều sâu, 0 = mặt ngoài mặt tiền tầng 2+ (tầng trên), tăng vào phía sau · `y` cao độ, 0 = sàn tầng 1. Ảnh mặt bằng thường vẽ **mặt tiền ở dưới** — xác nhận bằng bậc tam cấp / cửa chính.

## 1. Thu thập & lưu bản vẽ

1. Tạo `docs/drawings/<id>/` (id dạng `vn-lkb-m1`, `cha-la-lk-80`…), copy ảnh vào với tên `mat-bang-tang-1.png`, `…tang-3-4-5.webp`, `dien-tich.png`…
2. Ghi lại: tên mẫu, phân khu, dự án, DTXD từng tầng & tổng, số tầng, "mẫu đối xứng" hay không.
3. Thiếu thông tin quan trọng (không rõ mặt tiền, không có DTXD và không có kích thước nào) → hỏi người dùng **một lần**, gom các câu hỏi lại.

## 2. Đo pixel → mét

Dùng script `scripts/measure.py` (Python + Pillow, chạy với `python -I -X utf8`):

```bash
# Đường tường đậm theo hàng/cột trong một vùng ảnh (x0 y0 x1 y1)
python -I -X utf8 .claude/skills/tao-can-3d/scripts/measure.py peaks <ảnh> <x0> <y0> <x1> <y1> [--thr 100] [--frac 0.5]
# Các đoạn tối liên tục trên từng hàng (biết vách chạy từ đâu tới đâu)
python -I -X utf8 .claude/skills/tao-can-3d/scripts/measure.py runs <ảnh> --rows 416,479,541 [--thr 110]
python -I -X utf8 .claude/skills/tao-can-3d/scripts/measure.py runs <ảnh> --cols 90,198 [--thr 110]
```

Quy trình:
1. `peaks` cả khung mỗi tầng → tìm tường ngoài trái/phải (cột) và trước/sau (hàng). Bề rộng ngoài (px) ÷ bề rộng nhà (m) = **px/m ngang**.
2. Bề rộng nhà: lấy từ bản vẽ/đề bài; nếu không có, giải từ DTXD: tỉ lệ sâu/rộng (px) = r ⇒ rộng = √(DTXD_T1 / r). Làm tròn hợp lý (4,0 / 4,5 / 5,0 m…).
3. Hiệu chỉnh chiều sâu sao cho **diện tích ngoài tường ≈ DTXD** từng tầng (sai lệch ≤ 1–2%). Ban công / lô gia / cửa sổ lồi giải thích phần chênh giữa các tầng (VD T2 = nhà + ban công trước + sau).
4. Mỗi ảnh có thể có tỉ lệ khác nhau (ảnh tầng 3-4-5 chung một file) → **neo bằng lõi thang** (vị trí vách thang giống nhau mọi tầng) và tính px/m riêng cho từng ảnh, từng trục.
5. Với mỗi vách trong: dùng `runs` trên đúng hàng/cột của vách để biết **vách chạy từ x nào tới x nào** — đừng giả định vách chạy hết lõi thang.
6. Ghi bảng đối chiếu diện tích (mô hình vs DTXD) vào chú thích đầu file dữ liệu.

## 3. Viết file dữ liệu

Copy `reference/template.ts` → `src/data/houses3d/<id>.ts`, đổi tên hằng, điền theo bản vẽ. Thêm vào `HOUSE_MODELS` trong `src/data/houses3d/index.ts`.

Nguyên tắc nhập:
- `levels`: cao độ sàn từng tầng; không có mặt cắt → ước lượng 3,6 / 3,3 / 3,3 / 3,3 / 3,2 m, đặt `estimated: true` và ghi rõ trong `note`.
- Mỗi tầng: `front`/`back` = mặt ngoài tường trước/sau **của phần nhà kín ở tầng đó** (tầng 1 thường lùi vào; tầng có lô gia/sân thượng thì `front` lùi tương ứng; tầng trên cùng có sân thượng dùng `roofed`).
- `rooms`: hình chữ nhật lòng tường; phòng chữ L = nhiều rect **cùng tên**. Loại `r` phòng · `w` WC · `h` sảnh/thang/hành lang · `o` ngoài trời.
- `walls`: chỉ vách trong; tường bao ngoài do engine tự dựng. Cửa đi trong vách: `openings` type `door` (để trống). Tường WC: `tiled: true`.
- `frontOpenings`/`backOpenings`: cửa đi/cửa sổ mặt tiền & mặt sau theo vị trí trên ảnh.
- `furniture`: đặt theo hình vẽ nội thất trên mặt bằng (giường, sofa, bếp, bàn ăn, WC, chậu rửa, buồng tắm, tủ…). `facing` = phía tựa lưng/đầu giường.
- `stair`: thang chữ U `{ rect, landing, steps, landingSide? }` — vế 1 ở dải trước đi lên từ phía hành lang, vế 2 ở dải sau. Hành lang bên phải (lõi thang sát tường trái) → mặc định (chiếu nghỉ phía x0). **Hành lang bên trái (lõi thang sát tường phải) → `landingSide: "R"`**; khi đó vách WC dưới vế 2 có mép trên chéo **ngược chiều** (thấp ở phía chiếu nghỉ x1−landing, cao ở phía x0) và vách giữa 2 vế chạy từ x0 tới x1−landing.
- Căn góc: `sideYard: { side, width }` (nền sân hông, bỏ nhà bên cạnh phía đó) + `leftOpenings` / `rightOpenings` cho cửa sổ trên tường hông (from/to theo d).
- Buồng tắm sát tường phải: `shower` với `facing: "L"` (vách kính ở phía trái).
- Thang riêng cho một tầng (VD shophouse: tầng 1 cao, thang thẳng dọc tường lên tầng 2): `floors[k].stairUp = { kind: "straight", rect, dir: "+d" | "-d" | "+x" | "-x", steps }` và ở tầng trên `floors[k+1].stairHole = rect phần cần khoét` (chỗ bậc thang cao hơn ~1,6 m so với sàn dưới, để đủ khoảng đầu). Tầng có `stairUp` riêng thì vẫn dùng thang chữ U chung cho các tầng còn lại. Lỗ thang mở trên sàn → bao lan can kính bằng `balconies: [{ rect: lỗ, rails: [các cạnh hở] }]`.
- Điểm đổ ra của thang riêng **không được nằm dưới chiếu nghỉ** của thang chữ U tầng trên (đầu chỉ còn ~1,7 m) — cho thang kết thúc ở trước lõi thang.
- Tầng trên cùng có sân cả trước lẫn sau: `front`/`back`/`roofed` = phần có mái; 2 sân là room kind `o`; tường chắn sân là `walls` cao ~1,1 m.
- `listingHref`: link `/quy-can?du-an=…&phan-khu=…` (id phân khu lấy trong `src/data/zones.ts`).
- Chú thích (tiếng Việt) ở đầu file: nguồn bản vẽ, cách đo, bảng đối chiếu DTXD.

## 4. Quy tắc bắt buộc (rút ra từ phản hồi của người dùng)

1. **Đường đi phải hợp lệ.** Mỗi phòng phải đi tới được từ hành lang/thang; không vách nào chắn lối đi. Kiểm tra lại từng tầng sau khi nhập.
2. **Tầng 1 khác tầng trên.** Đừng tái dùng bộ vách lõi thang của tầng trên cho tầng 1. Thường ở tầng 1: vế thang đầu **mở thẳng ra phòng khách** (chỉ còn đoạn vách ngắn nếu bản vẽ có), WC nằm dưới vế thang 2.
3. **Vách WC dưới thang:** không để vách cao hết tầng cắt ngang chiếu nghỉ. Dùng `profile` (đa giác): dưới chiếu nghỉ chỉ cao tới đáy chiếu nghỉ (≈ cao độ chiếu nghỉ − 0,17 m); phần còn lại mép trên **chéo theo mặt dưới vế 2** lên tới trần để che kín WC. Chiếu nghỉ ở `H × (steps+1)/(2·steps+1)`.
4. **WC dưới thang** bị trừ phần chồng lõi thang → ghi `area` thủ công (rộng × sâu lòng WC).
5. **Buồng tắm** dùng nội thất `shower` (engine tự dựng vách kính + cửa kính mở hé). **Không** thêm vách gạch ngăn buồng tắm.
6. **Không dựng khối đặc làm tay vịn/lan can trong nhà** (sẽ trông như vách chắn). Lan can ban công dùng `balconies[].rails`.
7. Vách giữa hai vế thang ở tầng trên: chỉ cao ~1,1 m, bắt đầu từ cuối chiếu nghỉ, không chạm chiếu nghỉ.
8. Mặt cắt ngang của tầng được tính `cao độ tầng trên − 0,25 m` (dưới đáy sàn) — không đổi lại −0,05 (sẽ cắt vào giữa sàn, hiện mảng đen).
9. Số liệu đo từ ảnh luôn đánh dấu `estimated: true` + ghi sai số (±10 cm) trong `note`; chỉ bỏ khi có kích thước/mặt cắt thật.
10. Không bịa phòng/nội thất không có trên bản vẽ. Chỗ không đọc được → hỏi hoặc ghi chú.
11. Giữ nguyên các căn & giao diện khác; không đổi engine/giao diện nếu không cần cho căn mới.
12. **Mọi WC phải kín 4 phía** (trừ cửa). WC dưới thang hay bị thiếu vách phía hành lang/phòng khách — dùng `runs` dò cột/hàng tại mép WC và chụp gần lõi thang từ phía hành lang để kiểm tra.
13. Ảnh mặt bằng có thể bị kéo giãn không đều theo 2 trục (VD ảnh T1 giãn ngang 4–5%): tính px/m **riêng cho từng trục, từng khung tầng**; đối chiếu bằng chiều sâu + DTXD chứ không chỉ bề rộng.
14. Bảng DTXD có thể tính cả "tum/áp mái": nếu tầng trên cùng lệch nhiều so với phần có mái đo được, ghi rõ trong `note` thay vì nới kích thước cho khớp.
15. **Ảnh các tầng mâu thuẫn nhau** (thường là cầu thang vẽ khác vị trí giữa các tầng): kiểm tra xem ghép lại có đi được không (thang tầng dưới đổ ra đâu, có vướng chiếu nghỉ/WC tầng trên không). Nếu không ghép được → hỏi người dùng **một lần** với các phương án (ưu tiên đi lại được / đúng từng ảnh / chờ bản vẽ khác), rồi ghi lựa chọn vào chú thích đầu file và `note`. Người dùng đã chọn "ưu tiên đi lại được" cho VN-SHA-M2 — dùng làm mặc định gợi ý.
16. Shophouse: tầng 1 thường cao hơn (≈3,9 m) và là không gian kinh doanh mở; mặt tiền cửa kính gấp lớn.
17. **Thang dồn một phía (thang thẳng dọc tường):**
    - Chạy **một mạch** từ ngay sau cửa tới sát lõi thang tầng trên, nối tiếp vế đầu của thang tầng trên; lòng bậc ~0,25–0,27 m (đừng để dốc).
    - **WC đặt dưới phần cao của thang** (chỗ mặt dưới thang ≥ ~2,1 m), cửa WC mở ở đầu cao (phía sau), không mở ra phía gầm thấp.
    - Vách bên của thang phía không gian chung chỉ là phần **dưới thang**: `profile` tam giác, mép trên theo mặt dưới bậc (≈ cao độ bậc − 0,15 m). **Không** dựng vách phía trên thang; gầm thang phải che kín.
    - Lỗ sàn tầng trên khoét từ chỗ thang cao hơn (cao tầng − 0,15 − 2,0 m) tới cuối thang; bao lan can kính các cạnh hở.

## 5. Kiểm tra (bắt buộc trước khi báo xong)

1. `npx tsc --noEmit -p .` và `npx next build`.
2. Chụp trình duyệt bằng Playwright (`browser_run_code_unsafe` với file trong `.playwright-mcp/`, xem mẫu `scripts/verify3d.js`): dev server ở `http://localhost:3000` (dùng server có sẵn nếu đang chạy). Mở `/3d?v=<số mới>#<id>` để tránh cache, chụp:
   - từng tầng ở khung "Cả tòa" (góc mặc định + xoay sang phải, phóng gần lõi thang);
   - "Toàn nhà", "Khung thô", "Từ trên" (tầng có cửa sổ lồi/ban công);
   - "Từ trên" ở tầng có lỗ thang: lỗ phải **trống** (nhìn thấy bậc thang tầng dưới), không bị sàn gỗ/gạch phủ. Engine tự cắt lớp hoàn thiện theo `stairHole` — nếu vẫn thấy phủ thì kiểm tra lại `stairHole`;
   - khung "Bóc mái" (chọn khung "Bóc mái" + "Ẩn bảng" để xem to).
3. Đối chiếu ảnh 3D với ảnh mặt bằng từng tầng: vị trí phòng, cửa, thang, WC, ban công; không có vách chắn lối đi; không có khối lạ; nhãn diện tích hợp lý (không có 0,0 m²).
4. Không có lỗi console (bỏ qua favicon 404 và cảnh báo `PCFSoftShadowMap` của viewer cũ).
5. Lưu 2–3 ảnh xem trước vào `docs/drawings/<id>/3d-*.png`.

## 6. Khi bản vẽ có thứ engine chưa hỗ trợ

Ví dụ: thang chữ L/thẳng/xoắn, thang máy, giếng trời, mái dốc toàn phần, sân hông căn góc, gara. Khi đó:
1. Mở rộng `types.ts` bằng trường **tuỳ chọn** (không phá dữ liệu cũ) + hàm dựng trong `build.ts`, chú thích tiếng Việt.
2. Dựng lại căn VN-LKB-M1 để chắc không hỏng (chụp "Toàn nhà" so với `docs/drawings/vn-lkb-m1/3d-toan-nha.png`).
3. Ghi thêm quy tắc vào mục 4 của skill này nếu người dùng phản hồi điều mới.

## 7. Báo cáo cho người dùng

Ngắn gọn bằng tiếng Việt: kích thước suy ra + bảng đối chiếu DTXD, các giả định (cao tầng ước lượng, chỗ bản vẽ không rõ), link `/3d#<id>`, file đã tạo, ảnh xem trước. Chưa commit trừ khi được yêu cầu.
