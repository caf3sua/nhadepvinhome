# Phân tích website ocean23.vn — Brief để dựng website tương tự

> Nguồn: quét trực tiếp https://ocean23.vn/ (HTML + CSS + DOM render bằng trình duyệt) ngày 13/11/2026.
> Ảnh tham chiếu: `docs/reference/` (home-hero.png, home-full.png, olympic.png, 3d.png, am-thuc.png, ve-tinh.png).
> Lưu ý: nội dung/thương hiệu/số điện thoại/ảnh của ocean23.vn thuộc về chủ site gốc. Bản clone chỉ nên lấy **cấu trúc + phong cách**, phải thay bằng thương hiệu, nội dung, dữ liệu và hình ảnh của riêng mình (nhadepvinhome).

---

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Loại site | Web môi giới độc lập BĐS Vinhomes Ocean Park 2 & 3 (Văn Giang, Hưng Yên) — "web quỹ căn chuyển nhượng" |
| Mục tiêu | Xem từng căn trên **bản đồ tương tác**, lọc theo loại hình/giá; thu lead qua Gọi/Zalo |
| Kiến trúc | **Single-page app thuần JS** (không framework nhìn thấy), render trong `<main id="app">`; điều hướng bằng anchor `#...` |
| Số trang thật (sitemap) | 2 URL: `/`, `/olympic/`. Thực tế có thêm `/3d/`, `/am-thuc/`, `/ve-tinh/` |
| Thư viện | Leaflet 1.9.4 (bản đồ 2D trang chủ), MapLibre GL (bản đồ 3D/vệ tinh các trang con), Three.js-like canvas (trang `/3d/`), Google Tag Manager/gtag |
| Font | **Montserrat** (display, 500–800) + **Be Vietnam Pro** (body, 400–700) — Google Fonts |
| Ngôn ngữ | Tiếng Việt |
| Tile bản đồ | Tự host `/tiles/{z}/{x}/{y}.jpg` (ảnh mặt bằng quỹ căn đã vẽ) |
| Chế độ nội bộ | Thanh `nbbar` "Bản nội bộ" (đăng nhập bằng mã để hiện mã căn + vị trí lô thật) — có thể bỏ qua |

### Sơ đồ trang

```
/                 Trang chủ (SPA, 1 trang dài ~12.000px, nhiều section)
├─ /olympic/      Mặt bằng 3D Khu đô thị thể thao Olympic (full-screen map + panel)
├─ /3d/           Nhà phố Ocean Park 3D (viewer 3D từng loại nhà, hash #pho-bien-119 …)
├─ /am-thuc/      Bản đồ ẩm thực / tiện ích quanh Ocean Park (full-screen map + panel)
└─ /ve-tinh/      Quỹ căn trên bản đồ vệ tinh (full-screen map 3D + giá từng căn)
```

Menu chính dùng **hash-router** (SPA đổi nội dung `<main id="app">` theo `location.hash`, không tải lại trang). **Cập nhật sau khi quét bổ sung:** 6 mục này không phải cùng một trang cuộn, mà gồm 5 "view" riêng + 1 anchor cuộn:

| Hash | Loại | Mô tả ngắn | Chi tiết |
|---|---|---|---|
| `#home` | View | Trang chủ dài (mục 3) | Mục 3 |
| `#quy-can` | View riêng | Danh sách + bộ lọc toàn bộ ~178 căn | Mục 6.1 |
| `#ocp2` | View riêng | Trang dự án Vinhomes Ocean Park 2 | Mục 6.2 |
| `#ocp3` | View riêng | Trang dự án Vinhomes Ocean Park 3 | Mục 6.2 |
| `#du-an` | **Anchor cuộn** về trang chủ | Cuộn tới `section#du-an` (2.044px), menu "Dự án" sáng | Mục 6.3 |
| `#mau-thiet-ke` | View riêng (đổi `<title>`) | Mẫu thiết kế nội thất nhà liền kề | Mục 6.4 |
| `#lien-he` | View riêng + popup/form | Liên hệ + form nhận bảng hàng + form gửi bán | Mục 6.5 |

---

## 2. Phong cách thiết kế (Design System)

### 2.1 Cảm quan chung
Phong cách **"resort/biển + vàng kim sang trọng"**: nền ảnh hero toàn cảnh khu đô thị, chữ tiêu đề **gradient vàng kim** (metallic gold), nút CTA vàng bóng, phần còn lại nền xanh-xám nhạt sạch sẽ, thẻ trắng bo góc. Tone chữ tự tin, thực dụng (giá, m², hướng, "thu về / bao phí").

### 2.2 Màu sắc (CSS variables trang chủ & /am-thuc, /ve-tinh)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--ink` | `#0D2A33` | Chữ chính, nút tối |
| `--lagoon` | `#0E7686` | Màu thương hiệu (xanh ngọc), nút "Liên hệ", viền avatar, link |
| `--hot` | `#D7263D` | Nhãn **HOT**, giá giảm, lỗi |
| `--bg` | `#F2F6F7` | Nền trang |
| `--surface` | `#FFFFFF` | Thẻ, header |
| `--muted` | `#557079` | Chữ phụ |
| `--line` | `#D6E2E5` | Viền/đường kẻ |
| `--gold` (nhãn) | `#E3A400` | Điểm nhấn vàng |
| Cam accent (section intro) | `#FF7A2F` | Kicker, tick ✓, nút trong khối giới thiệu |
| Nền thanh trên cùng | `#1d2b30` (nội bộ) / kem `#FCE9D5`-ish (dải thông báo) | Banner |

**Gradient vàng (đặc trưng):**
```css
--gold-hi: linear-gradient(180deg,#FFF6D8 0%,#F3D58A 38%,#D4A64A 62%,#F6DE9A 82%,#B8862F 100%); /* chữ H1 trên nền ảnh, nút CTA */
--gold-lo: linear-gradient(180deg,#C99A3E 0%,#A9782A 48%,#7E5717 100%);                          /* h2 tiêu đề trên nền sáng */
```
Cách dùng: `background: var(--gold-hi); -webkit-background-clip:text; color:transparent;` cho H1/H2; nút CTA dùng chính gradient `#F6DE9A → #C99A3E` làm nền, chữ `--ink`.

Các trang bản đồ con dùng bảng màu riêng:
- `/olympic/`: `--ground:#eeebe5; --panel:rgba(255,255,255,.95); --line:#e3ded5; --fg:#1f1d1a; --mute:#6f6a62; --accent:#ff5500; --zone:#3563e9; --iq:#d9a400; --chip:#f6f3ee`
- `/3d/` (dark mode mặc định): `--bg:#15171a; --panel:#1c1f23; --ink:#ecebe7; --muted:#9ba1a8; --line:#2e3237; --accent:#f0b512; --est:#86b9e0; --chip:#25292e` (có cả light theme qua `data-theme`)

### 2.3 Typography
| Vai trò | Font | Cỡ / trọng lượng |
|---|---|---|
| H1 hero | Montserrat 800, UPPERCASE, letter-spacing ~.02em | 54px desktop (`clamp`), line-height 1.08 |
| H2 section | Montserrat 800, UPPERCASE, gradient vàng đậm | ~40px; `letter-spacing:-.01em` |
| Intro h2 | Montserrat 800 `clamp(30px,4.4vw,52px)`, dòng nhấn `em` màu cam block | |
| Body | Be Vietnam Pro 400/500 | 15–16px, line-height ~1.6 |
| Nút | Be Vietnam Pro 600–700 | 14–18px |
| Kicker/eyebrow | 12px, 700, uppercase, letter-spacing `.22em`, đi kèm gạch cam 48×2px |
| Logo | "ocean" (Montserrat 800) + "**23**" (màu lagoon) + `small` "OCEAN PARK 2 · 3" |

### 2.4 Layout & hình khối
- Container `.wrap`: **max-width 1180px**, padding ngang 16px, canh giữa.
- Bo góc: thẻ 12–14px, khối intro 18px, nút 14px, chip 7px, avatar tròn.
- Bóng: thẻ `0 2px 8px rgba(0,0,0,.28)` (nhãn bản đồ), ID card `0 18px 40px rgba(0,0,0,.35)`.
- Breakpoint chính: `520px` (mobile nhỏ), `820px` (tablet: intro 1 cột), `1000px` (kstrip → grid 4 cột). Mobile-first, có `env(safe-area-inset-*)`.
- Hiệu ứng hero: lớp `.bg` ảnh, các `orb` (vòng sáng tròn lơ lửng), `pins` (chấm đỏ/tím nhấp nháy), mascot hoạt hình vẫy tay góc phải dưới.
- Các thanh cố định: thanh **dải thông báo** trên cùng, **agentbar** (2 sale), **nav** sticky, **gbar** (thanh nút "Gửi bán" cố định đáy màn hình).

### 2.5 Component tái sử dụng
| Component | Mô tả |
|---|---|
| `.btn` | Nút lagoon (nền `#0E7686`, chữ trắng, bo 14px); `.btn.ghost` viền trắng/trong suốt; `.btn` vàng (CTA chính) |
| `.bigbtn` | Nút lớn 2 dòng: emoji + tiêu đề + mô tả (vệ tinh / ẩm thực) |
| Chip phân khu `.zchips` | Hàng nút nhỏ cuộn ngang "Đi tới phân khu: …" |
| Segmented `.seg` | Công tắc "Cả hai / Ocean Park 2 / Ocean Park 3" |
| Select lọc | Loại hình, mức giá |
| Thẻ căn `.grid > card` | Ảnh/nhãn HOT, mã căn, loại hình · phân khu · dự án, DT đất/sàn/tầng/hướng, pháp lý (HĐMB/Có sổ), tình trạng (Nhà thô), **giá tỷ**, "Bao phí / Thu về · xx tr/m²" |
| Thẻ dự án `.dagrid` | Badge (ĐANG MỞ BÁN / CHUYỂN NHƯỢNG / MỚI), tên, 📍 địa chỉ, 🏠 thống kê, link "Xem quỹ căn →" |
| Bảng `.ctab` / `.twrap` | Bảng căn chung cư: Căn · Loại · DT · Hướng · View · Giá gốc · Giảm giá · Giá |
| Nhãn bản đồ `.ctag` | Pill màu theo nhóm, hiện **giá** (đỏ = HOT dưới 125tr/m²), trắng viền |
| `.idcard` | Thẻ nhân vật "dây đeo" kiểu thẻ nhân viên (logo, ảnh 4:5, tên, chức danh, SĐT) |
| `.kstrip` | Dải ảnh cuộn ngang snap (mobile) → lưới 4 cột (desktop), caption gradient đen |
| Drawer `aside#can` | Bảng chi tiết căn trượt ra khi bấm nhãn/thẻ (ảnh, thông số, mặt bằng tầng) |
| Toast `aside#hp` | Popup nhỏ góc "🔔 Xem căn này" (gợi ý căn nổi bật) |
| `.panel` (trang con) | Sidebar kính mờ trắng chứa điều khiển lớp bản đồ |

---

## 3. Trang chủ `/` — danh sách section theo thứ tự từ trên xuống

| # | Section / block | Class / id | Nội dung & hành vi |
|---|---|---|---|
| 0 | Thanh nội bộ (tuỳ chọn) | `#nbbar` | "Bản nội bộ · hiện đủ mã căn…" + nút Thoát. **Có thể bỏ** |
| 1 | Dải thông báo | `#topflag.demo-flag` | "Thấp tầng & chung cư chuyển nhượng giá tốt… Cập nhật dd/mm/yyyy. Gọi/Zalo SĐT" — nền kem |
| 2 | Agent bar | `.agentbar` | Avatar tròn viền lagoon + tên + chức danh + SĐT (×2 người) + nút **Liên hệ** |
| 3 | Header/Nav | `header.nav` sticky | Logo `ocean23` · menu: Trang chủ, Quỹ căn, Ocean Park 2, Ocean Park 3, Dự án, Mẫu thiết kế, Liên hệ (mục active = pill xanh nhạt) |
| 4 | **Hero** | `section.vhero` | Ảnh nền toàn cảnh + orb + pin; wordmark `ocean23.vn`; H1 vàng 2 dòng ("WEB QUỸ CĂN CHUYỂN NHƯỢNG / OCEAN PARK 2-3"); tagline nghiêng "Dễ hình dung nhất!"; đoạn mô tả; 2 pill ("CHECK CĂN THUẬN TIỆN", "GỬI BÁN DỄ DÀNG"); 2 CTA: vàng "Xem bản đồ quỹ căn →" + ghost "Thiết kế 3D cho từng loại diện tích"; mascot vẫy tay |
| 5 | **Bản đồ quỹ căn** | `#ban-do.maphead` + `.mapbar` + `.mapwrap` | H2 + mô tả; thanh lọc (seg OCP2/OCP3, select loại hình, select giá, bộ đếm "170 căn · 45 HOT · 31 chung cư · cập nhật…"); **Leaflet map** (tile ảnh) với nhãn giá, ga metro, legend (HOT / Đang bán / BP / chung cư / ga metro), nút toàn màn hình, zoom +/−/⤢, nút Liên hệ nổi |
| 6 | Chip phân khu | `#zchips` | "Đi tới phân khu:" + 22 chip (OCP2: Sao Biển, Cọ Xanh, Chà Là, Hải Âu, Đảo Dừa, San Hô, Kinh Đô, Ngọc Trai; OCP3: Thời Đại, Vịnh Tây, Đại lộ Hừng Đông, Ánh Dương, Vịnh Thiên Đường, Phố Biển, Vịnh Xanh, Đảo Ngọc, Hải Đăng; + 5 toà chung cư) → bay tới vị trí trên map |
| 7 | Ghi chú map | `.maptools` | Lưu ý "ghim minh hoạ…" |
| 8 | 2 nút lớn | `.bigbtns` | 🛰 "Quỹ căn trên bản đồ vệ tinh" → `/ve-tinh/` ; 🍜 "Bản đồ ẩm thực" → `/am-thuc/` |
| 9 | **Dự án đang phân phối** | `#du-an.block.duan` | Tiêu đề + lưới 8 thẻ dự án (`.dagrid`): Thấp tầng OCP2&3, Olympic (MỚI → `/olympic/`), The Parkland, The Cityon, Masteri Grand Coast, Masteri Trinity Square, Lumière Springbay, Masteri Era Landmark |
| 10 | **Giới thiệu người bán** | `section.intro` | Nền ảnh đêm + gradient tối; trái: kicker, H2 "Xin chào, tôi là …" (tên màu cam), trích dẫn trong khung kính, 4 gạch ✓, 2 nút (Liên hệ cam, Gọi ghost); phải: **idcard** (logo, ảnh, tên, chức danh, SĐT) |
| 11 | **Sống ở Ocean Park** | `section.kdt` + `.kstrip` | 4 ảnh tiện ích có caption (Grand World, show thực cảnh, biển hồ nước mặn, bãi biển cát trắng) |
| 12 | **Căn HOT dưới 125tr/m²** | `.block` + `.grid` | Link "Xem dạng danh sách →"; lưới thẻ căn (ảnh/số ảnh, nhãn HOT, thông số, giá) ~12 thẻ |
| 13 | **Chung cư chuyển nhượng** | `#chung-cu.block.trin` | Bảng gom nhóm theo dự án (Masteri Trinity Square, Lumière Springbay, Masteri Grand Coast, The Parkland, Masteri Era Landmark), số căn mỗi nhóm; ghi chú; nút "Liên hệ nhận thông tin căn"; bấm 1 dòng → mở drawer chi tiết + mặt bằng toà |
| 14 | **Video giới thiệu & review phân khu** | `#video-gioi-thieu.block.vpk` | 1 video YouTube lớn (`.vyt`) + lưới video review từng phân khu (`.pkgrid`, link YouTube/TikTok, thumbnail + ▶) |
| 15 | **Video hạ tầng kết nối** | `#video-ha-tang.block.vht` | 1 video lớn (metro Hà Nội) + lưới video metro tuyến 8, 14… (`.vgrid`) |
| 16 | **Hai dự án chuyên** | `.block > .projects` | 2 thẻ lớn: **The Empire** (Vinhomes Ocean Park 2) & **The Crown** (Vinhomes Ocean Park 3): danh sách phân khu dạng chip + 3 chỉ số (Quy mô / Khởi công / Đang bán) |
| 17 | Footer | `footer` | Tuyên bố "Môi giới độc lập… Không phải website của chủ đầu tư", cảnh báo giá có thể thay đổi, hotline/Zalo ×3, link Nội bộ |
| 18 | Thanh cố định đáy | `nav#gbar` | 2 nút: "🏢 Gửi bán chung cư" · "🏡 Gửi bán thấp tầng" (Zalo) |
| 19 | Toast gợi ý | `aside#hp` | Popup "🔔 Xem căn này" ngẫu nhiên, nút × |
| 20 | Drawer chi tiết | `aside#can` (hidden) | Mở khi chọn căn |

Dữ liệu động (JS): ~170 căn thấp tầng + ~31 căn chung cư, mỗi căn có: mã, loại hình, phân khu, DT đất, DT sàn, số tầng, hướng, pháp lý, tình trạng (thô/hoàn thiện), giá, kiểu giá (bao phí / thu về), ảnh, toạ độ ghim, flag HOT.

---

## 4. Các trang con

### 4.1 `/olympic/` — Mặt bằng Olympic Hà Nội
Trang **full-screen map 3D** (MapLibre), không có header/footer.
- Canvas bản đồ 3D (`#map`) + canvas nhãn `#lbl` + loader "Đang tải bản đồ 3D…"
- **Panel trái** (`aside.panel`, thu gọn bằng nút ▾):
  1. Header: H1 "Khu đô thị thể thao Olympic" + dòng phụ "4 phân khu · 10.418 ha · …"
  2. Section "Phân khu · bấm để tập trung": 4 nút A/B/C/D kèm diện tích + ghi chú
  3. Section "Lớp bản đồ": checkbox (Khối nhà/cây xanh 3D, Kích thước đường/ô đất, Ảnh vệ tinh, Ranh phân khu G-hub, Ranh iquyhoach, Ranh & tên xã phường)
  4. Section "Sử dụng đất · bấm để ẩn/hiện": legend 15 loại đất (liền kề, biệt thự, cây xanh, mặt nước, giáo dục, thương mại, chung cư, hạ tầng, y tế…) dạng nút màu
  5. Footer: nguồn dữ liệu + "← ocean23.vn" + SĐT
- Điều khiển: nút 3D, 🛰, +, −, ⤢; hint "Phóng to để xem từng căn nhà…"; tooltip hover `#tip`.
- Màu: nền kem `#eeebe5`, accent cam `#ff5500`.

### 4.2 `/3d/` — Nhà phố Ocean Park 3D
Trang **viewer 3D công trình**, dark theme.
- Khung trái: `#stage` canvas 3D + nhãn phòng (tên + m²), thanh trạng thái ("Cả toà · Cắt ngang ở +3,9 m"), tab tầng (Tầng 1–5, Toàn nhà, Khung thô, Từ trên), toolbar (Bỏ tường bên trái, Nội thất, Nhà bên cạnh, Cắt ngang); khung phụ `#view2` "Từng tầng · bóc mái".
- **Panel phải** (`aside.panel`):
  1. `units-head` "Chọn căn để xem 3D" + danh sách loại nhà (Phố Biển 119/98/85/68 m², Đảo Dừa 63 m²…)
  2. Header căn: eyebrow (phân khu · dự án), H1 tên + DT, specs (kích thước lô, loại căn, số tầng, thang máy)
  3. `.card` mô tả tầng đang chọn (tiêu đề, đoạn mô tả, danh sách số liệu)
  4. `.areas` "Diện tích các phòng" theo từng tầng
  5. `.more` "Xem thêm" (bài 14 bước thi công…)
  6. `.note` chú thích "Theo bản vẽ / Ước lượng / Hướng dẫn thao tác chuột"
- Điều hướng bằng hash (`#pho-bien-119`).

### 4.3 `/am-thuc/` — Bản đồ ẩm thực
Full-screen map vệ tinh (MapLibre) + marker emoji.
- Panel trái: link "← Về ocean23.vn", tiêu đề "🍜 Bản đồ ẩm thực", toggle Vệ tinh / Vệ tinh + mặt bằng, slider độ đậm mặt bằng, ghi chú thao tác + bộ đếm điểm
- Thanh nhóm lọc `.nhom` (chip emoji + đếm): Tất cả, Ăn sáng, Bán cả ngày, Cơm hộp, Nhậu, Lẩu–nướng, Cà phê–trà sữa, Ăn vặt, Nhà hàng–đặt tiệc, Ăn đêm, Giao tận nhà, Ban quản lý–dịch vụ
- Dải `.dsq` nút nhanh dịch vụ (BQL OCP2/OCP3, An ninh, Nước sạch, Điện lực)
- Drawer `aside#can`: thông tin quán, chỉ đường
- Lớp 3D toà The Cityon A2 (nhãn tầng `#a2nhan`, gợi ý `.a2goiy`)

### 4.4 `/ve-tinh/` — Quỹ căn trên bản đồ vệ tinh
Cùng khung với `/am-thuc/` nhưng dữ liệu là quỹ căn:
- Panel: "Quỹ căn trên vệ tinh", toggle lớp, slider, ghi chú "169 căn"
- Marker **giá** trên từng căn (bấm → drawer `aside#can`); marker "🏠 Căn mẫu"
- Khối **Giao thông** (`.gt`): legend Vành đai 4, 3.5, Đại lộ Đông Tây, đường sắt Lào Cai–HN–HP, metro tuyến 1/2/5/8+8B/10/14; nút "Xem toàn tuyến" / "Về dự án"
- Cùng lớp 3D toà The Cityon A2.

---

## 5. Kế hoạch dựng website tương tự (đề xuất)

### 5.1 Tech stack gợi ý
| Hạng mục | Đề xuất |
|---|---|
| Framework | Next.js (App Router) + TypeScript + Tailwind CSS *(hoặc Vite + React; site gốc là vanilla JS)* |
| Bản đồ trang chủ | Leaflet + `react-leaflet` với tile ảnh mặt bằng tự vẽ (`CRS.Simple`) hoặc ảnh quy hoạch đã cắt tile |
| Bản đồ vệ tinh/3D | MapLibre GL JS (tile vệ tinh + extrusion 3D) |
| Viewer 3D nhà | Three.js / react-three-fiber (làm sau, giai đoạn 2) |
| Routing | **Route thật** của Next.js App Router (không dùng hash như bản gốc), xem bảng 5.2 |
| Form | Route handler `app/api/lead` & `app/api/sell` → Google Sheets / Telegram / email; có honeypot chống spam |
| Dữ liệu | `data/units.json` (thấp tầng), `data/apartments.json`, `data/zones.json`, `data/designs.json` (6 mẫu thiết kế), cây dự án → phân khu → dãy → căn (cho form gửi bán); về sau chuyển CMS/DB |
| Ảnh | `next/image`, WebP, ảnh hero ≥ 2000px |
| SEO/Analytics | metadata + OG, sitemap, GA4/GTM |
| Lead | Link `tel:` + `https://zalo.me/<sđt>`, nút cố định đáy (mobile) |

### 5.2 Route thật & cấu trúc thư mục đề xuất

Ánh xạ từ hash-route của site gốc sang route thật:

| Site gốc | Route thật | Ghi chú |
|---|---|---|
| `/` (`#home`) | `/` | Trang chủ dài (mục 3) |
| `#quy-can` | `/quy-can` | Danh sách + bộ lọc; **đồng bộ bộ lọc lên query string** (`?du-an=ocp2&phan-khu=cha-la&gia=10-20`) để chia sẻ/SEO được |
| `#ocp2` | `/ocean-park-2` | Template dự án (mục 6.2) |
| `#ocp3` | `/ocean-park-3` | Cùng template, dùng `/[project]` hoặc 2 route tĩnh |
| `#du-an` | `/#du-an` | Vẫn là anchor trên trang chủ (smooth-scroll), không có trang riêng |
| `#mau-thiet-ke` | `/mau-thiet-ke` | Có `metadata.title` riêng |
| `#lien-he` | `/lien-he` | Các form/sheet mở dạng modal ở mọi trang |
| `/olympic/` `/3d/` `/am-thuc/` `/ve-tinh/` | giữ nguyên | Trang bản đồ toàn màn hình, không dùng shell chung |
| (drawer chi tiết căn) | `/quy-can/[ma-can]` *(tuỳ chọn)* | Trang chi tiết căn riêng để SEO/chia sẻ link; bản gốc chỉ có drawer |

Menu header dùng `next/link` + `usePathname()` để tô pill active; mục "Dự án" trỏ tới `/#du-an`. Trang bản đồ nằm trong route group riêng để không kế thừa header/footer.

```
app/
  (site)/                  # nhóm có shell chung: TopNotice + AgentBar + Header + Footer + StickyCta
    layout.tsx
    page.tsx               # /  Trang chủ (ghép các section mục 3)
    quy-can/page.tsx       # /quy-can
    [project]/page.tsx     # /ocean-park-2, /ocean-park-3 (generateStaticParams)
    mau-thiet-ke/page.tsx  # /mau-thiet-ke
    lien-he/page.tsx       # /lien-he
  (map)/                   # nhóm toàn màn hình, không shell
    olympic/page.tsx
    3d/page.tsx
    am-thuc/page.tsx
    ve-tinh/page.tsx
  api/
    lead/route.ts          # form "Nhận bảng hàng"
    sell/route.ts          # form "Gửi bán căn"
  sitemap.ts               # liệt kê đủ route (bản gốc chỉ có 2 URL, nên cải thiện)
components/
  layout/  TopNotice, AgentBar, Header, Footer, StickyCta, Breadcrumb
  home/    Hero, MapSection, ZoneChips, BigButtons, ProjectsGrid, IntroCard,
           LifeStrip, HotUnits, ApartmentTable, VideoSection, TwoProjects
  project/ ProjectHero, FactCard, ZoneCard
  listing/ FilterPanel, SortSelect, UnitGrid
  design/  DesignCard
  contact/ ContactSheet, LeadForm, SellForm, QRCode
  ui/      Button, Chip, Segmented, UnitCard (ảnh / SVG mặt bằng lô), Drawer, Toast, Badge
  map/     FundMap (Leaflet), SatMap (MapLibre), PriceMarker, Legend
data/      units.json, apartments.json, zones.json, projects.json, designs.json
public/    img/, tiles/
styles/    tokens.css (biến màu/font ở mục 2)
```

### 5.3 Thứ tự triển khai
1. **Design tokens + layout shell** (font, màu, gradient vàng, header sticky, agent bar, footer, thanh CTA đáy).
2. **Hero** (ảnh nền, H1 gradient vàng, 2 CTA, hiệu ứng orb/pin).
3. **Section tĩnh**: Dự án đang phân phối, Giới thiệu + idcard, Sống ở Ocean Park, Hai dự án chuyên, Video.
4. **Dữ liệu + UnitCard + lưới Căn HOT + bảng chung cư**, drawer chi tiết.
5. **Trang `/quy-can`**: FilterPanel (7 điều khiển, đồng bộ query string) + SortSelect + UnitGrid.
6. **Trang `/ocean-park-2`, `/ocean-park-3`**: ProjectHero + ZoneCard + lưới căn (tái dùng UnitCard), link "Lọc chi tiết →" sang `/quy-can?du-an=...`.
7. **Bản đồ quỹ căn Leaflet** trên trang chủ (nhãn giá, lọc loại hình/giá, chip phân khu, legend, fullscreen).
8. **Trang `/mau-thiet-ke`** (DesignCard + CTA tư vấn).
9. **Trang `/lien-he`** + ContactSheet, LeadForm, SellForm (select phụ thuộc) + API route `lead`/`sell`.
10. **Trang `/ve-tinh` và `/am-thuc`** (MapLibre + panel + drawer).
11. **Trang `/olympic`** (lớp bản đồ + legend sử dụng đất).
12. **Trang `/3d`** (giai đoạn 2, nặng nhất).
13. Responsive QA (520 / 820 / 1000 / 1180), SEO (metadata từng route, `sitemap.ts`), analytics, tối ưu ảnh.

### 5.4 Những thứ cần chuẩn bị từ phía bạn (không sao chép từ site gốc)
- Tên thương hiệu/logo/domain mới, thông tin người liên hệ (tên, SĐT, Zalo, ảnh đại diện).
- Ảnh hero, ảnh tiện ích, ảnh/mặt bằng quỹ căn tự có hoặc có giấy phép.
- Dữ liệu quỹ căn thật (mã, loại hình, DT, hướng, giá, pháp lý, vị trí).
- Link video YouTube/TikTok của riêng bạn.
- Câu chữ footer/miễn trừ trách nhiệm tương tự ("môi giới độc lập, không phải website chủ đầu tư").

### 5.5 Câu hỏi cần chốt trước khi code
1. Phạm vi: MVP gồm `/`, `/quy-can`, `/ocean-park-2`, `/ocean-park-3`, `/mau-thiet-ke`, `/lien-he`; có làm thêm 4 trang bản đồ (`/olympic`, `/3d`, `/am-thuc`, `/ve-tinh`) không?
2. Stack: Next.js hay HTML/JS thuần giống bản gốc?
3. Dự án tập trung: vẫn Ocean Park 2 & 3 hay dự án khác?
4. Có cần chế độ "nội bộ" (ẩn/hiện mã căn) và trang quản trị nhập liệu không?
5. Nguồn dữ liệu quỹ căn & ảnh mặt bằng/tile bản đồ.

---

## 6. Bổ sung: các route hash của menu chính

Ảnh tham chiếu: `docs/reference/quy-can.png`, `ocp2.png`, `mau-thiet-ke.png`, `lien-he.png`.
Cả 5 view dùng chung shell (agent bar + header + footer + thanh CTA đáy) và chỉ thay nội dung `#app`. View con có **breadcrumb** `Trang chủ / <tên trang>` (`div.crumb`) ở đầu. Menu item đang xem có class `.on` (pill xanh nhạt).

### 6.1 `#quy-can` — Quỹ căn Ocean Park 2 · 3
Trang danh sách đầy đủ, cao ~24.500px (178 thẻ, lưới 3 cột × ~278px ở desktop).

| # | Block | Class / id | Nội dung |
|---|---|---|---|
| 1 | Tiêu đề | `section.block > .head > h2` | "QUỸ CĂN OCEAN PARK 2 · 3" (gradient vàng) |
| 2 | **Bộ lọc** | `details#fbox.filters` (thu gọn được, tiêu đề "Bộ lọc căn") | Lưới 7 điều khiển + nút Đặt lại `#f-reset` (chi tiết bên dưới) |
| 3 | Toolbar kết quả | `div.toolbar` | "Tìm thấy **178** căn" + select **Sắp xếp**: Căn HOT trước · Giá thấp→cao · Giá cao→thấp · Đơn giá/m² thấp nhất |
| 4 | Lưới thẻ căn | `div.grid > a.card` | Cấu trúc thẻ bên dưới |

Các điều khiển bộ lọc:
- `#f-q` ô text **Mã căn / từ khoá**
- `#f-p` **Dự án**: Cả hai / Ocean Park 2 / Ocean Park 3
- `#f-zone` **Phân khu**: Tất cả + 17 phân khu (Sao Biển … Hải Đăng)
- `#f-type` **Loại hình**: Liền kề, Liền kề góc, Shophouse, Song lập, Tứ lập, Xẻ khe, Đơn lập
- `#f-dir` **Hướng**: Đông, Tây, Nam, Bắc, Đông Bắc, Đông Nam, Tây Bắc, Tây Nam
- `#f-price` **Khoảng giá**: Dưới 10 tỷ / 10–20 / 20–30 / Trên 30 tỷ
- `#f-area` **Diện tích**: Dưới 90 / 90–130 / 130–200 / Trên 200 m²

**Cấu trúc thẻ căn `a.card` (dùng chung toàn site):**
```
.thumb            ← ảnh thật (badge "📷 N ảnh") HOẶC bản vẽ SVG mặt bằng lô (mũi tên hướng, kích thước mặt tiền × chiều sâu, "Hướng Đông Nam")
  span.badge      ← HOT (đỏ) | ĐÃ BÁN | "Mặt đường · <phân khu>"
.body
  .code           ← mã căn (che số: CL14-xx)
  .zone           ← Loại hình · Phân khu · Dự án
  .specs          ← DT đất · Sàn m² · số tầng · Hướng · Pháp lý (Có sổ/HĐMB) · Tình trạng (Nhà thô / Hoàn thiện N tầng, có/không thang máy)
  .price          ← <strong>9,50 tỷ</strong> + <span.fee-bp>Thu về · 120 tr/m²  hoặc  Bao phí · 138 tr/m²</span>
```
Mã căn bị che 2 ký tự cuối (`-xx`) ở chế độ công khai; chế độ nội bộ mới hiện đủ. Bấm thẻ → mở drawer chi tiết căn.

### 6.2 `#ocp2` và `#ocp3` — Trang dự án (cùng 1 template)
Dữ liệu khác nhau, bố cục giống hệt. OCP2 cao ~13.300px, OCP3 cao ~6.250px (55 thẻ).

| # | Block | Class | Nội dung |
|---|---|---|---|
| 1 | Breadcrumb | `div.crumb` | Trang chủ / Vinhomes Ocean Park 2 |
| 2 | **Hero thông tin dự án** | `section.block` + `h1` + `div.facts` | H1 "VINHOMES OCEAN PARK 2" + tag nhỏ **THE EMPIRE** (OCP3: **THE CROWN**). 4 ô `.fact`: **Vị trí** (Nghĩa Trụ, Văn Giang, Hưng Yên) · **Quy mô** (458 ha / 294 ha) · **Khởi công** (08/2021 / Q3/2022) · **Loại hình** (OCP2: liền kề, song lập, đơn lập, shophouse; OCP3: đơn lập, song lập, liền kề, tứ lập, nhà phố, căn hộ) |
| 3 | **Danh sách phân khu** | `.head > h2 "PHÂN KHU"` + `div.zonelist > button.zonecard` | Mỗi phân khu 1 card nhỏ: tên · "Ký hiệu SB · 19 căn đang bán". OCP2: Sao Biển, Cọ Xanh, Chà Là, Hải Âu, Đảo Dừa, San Hô, Kinh Đô, Ngọc Trai (0 căn). OCP3: Thời Đại, Vịnh Tây, Đại lộ Hừng Đông, Ánh Dương, Vịnh Thiên Đường, Phố Biển, Vịnh Xanh, Đảo Ngọc, Hải Đăng. Bấm → lọc lưới bên dưới |
| 4 | **Căn đang bán** | `section.block > .head(h2 + a#all "Lọc chi tiết →") + div.grid` | Lưới `a.card` (cùng thẻ 6.1) sắp theo phân khu; "Lọc chi tiết →" dẫn sang `#quy-can` |

### 6.3 `#du-an` — Dự án đang phân phối (anchor)
Không phải view riêng: hash này **cuộn về trang chủ** tới `section#du-an` (offset ≈ 2.044px, dưới bản đồ) và đánh dấu menu "Dự án". Nội dung = block số 9 ở phần 3 (8 thẻ dự án: Thấp tầng OCP2&3, Olympic, The Parkland, The Cityon, Masteri Grand Coast, Masteri Trinity Square, Lumière Springbay, Masteri Era Landmark). Khi clone: smooth-scroll tới id, không cần trang riêng.

### 6.4 `#mau-thiet-ke` — Mẫu thiết kế nội thất nhà liền kề
`<title>` đổi riêng: "Mẫu thiết kế nội thất nhà liền kề Ocean Park 2, 3 – Ocean23". Cao ~1.930px.

| # | Block | Class | Nội dung |
|---|---|---|---|
| 1 | Breadcrumb | `div.crumb` | Trang chủ / Mẫu thiết kế |
| 2 | Tiêu đề + mô tả | `h1` + `p` | "MẪU THIẾT KẾ NỘI THẤT NHÀ LIỀN KỀ" + đoạn giải thích (mặt bằng nội thất từng tầng, tham khảo công năng khi mua nhà thô hoặc cải tạo) |
| 3 | **Lưới mẫu** | `div.mau-grid > article.mau` (6 mẫu) | Mỗi thẻ: ảnh mặt bằng, tiêu đề (vd. **Liền kề Cọ Xanh** – Ocean Park 2), thông số "80 m² đất · 5 tầng · sàn 319,7 m²", mô tả công năng, link **"🧊 Xem mô hình 3D"** → `/3d/#<slug>`. Mẫu: Cọ Xanh 80 m², San Hô 72 m², Vịnh Tây mẫu A 75 m², Vịnh Tây mẫu B 75 m², Phố Biển 104 m², Ánh Dương 100 m² |
| 4 | **CTA tư vấn** | `div.pricebox` | "Cần tư vấn căn có mặt bằng tương tự?" + 2 nút: **Liên hệ Tiến Hiệp** (mở sheet liên hệ) · **Xem quỹ căn** (→ `#quy-can`) |

### 6.5 `#lien-he` — Liên hệ
View ngắn (~1.320px) + các "bottom-sheet/modal" dùng chung toàn site (class `.csheet`, mở bằng nút Liên hệ / Gửi bán ở bất kỳ trang nào).

**View trang:**
| # | Block | Nội dung |
|---|---|---|
| 1 | Hero liên hệ `section.block` | `img.portrait` 160×200 bo 14px (ảnh người bán) · H1 "LIÊN HỆ TIẾN HIỆP" · mô tả "Chuyên thấp tầng và chung cư… Dẫn xem nhà, tư vấn pháp lý, vay ngân hàng." |
| 2 | Hộp liên hệ `div.pricebox` | Hotline/Zalo (số lớn) + nút **Liên hệ**; Zalo 2 (số khác) + **mã QR Zalo** ("Quét mã bằng Zalo hoặc camera điện thoại…") + nút "Nhắn Zalo 2" |
| 3 | Người thứ hai | Quản lý quỹ hàng (SĐT + nút Zalo/Gọi) |

**Các sheet/popup dùng chung:**
1. **`#ld-f` Form "Nhận bảng hàng & giá mới nhất"** — Trường: `ten` Họ tên · `sdt` SĐT/Zalo (bắt buộc, `type=tel`) · `quantam` select (Thấp tầng OCP2-3 / Chung cư chuyển nhượng / Căn hộ mới Parkland·Cityon / Ký gửi bán căn / Khác) · `ghichu` Ghi chú · `web` (ô **honeypot** chống spam) · checkbox đồng ý liên hệ · nút "Gửi số điện thoại" + "Để sau". Hoạt động như lead-popup.
2. **`#gb-f` Form "Gửi bán căn"** (từ thanh đáy "Gửi bán chung cư / Gửi bán thấp tầng") — Dự án* → Phân khu* → Dãy* → Tầng* (chung cư) → Căn số* (select phụ thuộc nhau) → Mã căn đầy đủ* (hoặc tick "tự ghi mã căn") → Diện tích (m²) → radio **Tình trạng** (Thô / Hoàn thiện) → radio **Pháp lý** (Sổ đỏ / HĐMB) → Giá bán (tỷ) → radio **Kiểu giá** (Thu về / Bao phí) → Họ tên chủ nhà → SĐT/Zalo* → honeypot `web` → checkbox đồng ý → "Gửi thông tin căn" / "Đóng".
3. **Sheet "Chọn cách liên hệ"** — mỗi người: SĐT, nút **Nhắn Zalo** / **Gọi điện**, QR Zalo.
4. Màn hình cảm ơn (`#ld-done`, `#gb-done`): "Cảm ơn Quý khách! … Cần gấp, Quý khách gọi / Zalo … [Nhắn Zalo ngay] [Đóng]".

Endpoint nhận form không xác định được từ HTML; khi clone cần tự làm API (vd. Next.js route handler → Google Sheets / Telegram / email) và giữ honeypot chống spam.

> Kế hoạch dựng cho các view này (route thật, component, dữ liệu, thứ tự làm) đã được gộp vào **mục 5** (5.1–5.3, 5.5).

---

## 7. Bổ sung kỹ thuật để triển khai thực tế (`nhadepvinhome`)

Khi đối chiếu bản phân tích (mục 1–6) với ảnh tham chiếu (`docs/reference/*.png`) để code hoàn chỉnh, cần bổ sung 6 điểm kỹ thuật sau:

### 7.1 Tập trung cấu hình thương hiệu (`site.config`)
Thay vì hardcode tên người bán/SĐT/Zalo rải rác ở `AgentBar`, `IntroCard`, `Footer`, `ContactSheet`, cần tách 1 file cấu hình trung tâm (`src/config/site.ts`):
- Tên thương hiệu (`nhadepvinhome`), domain (`nhadepvinhome.vn`), tagline, disclaimer môi giới độc lập.
- Danh sách chuyên viên tư vấn (tên, chức danh, SĐT, link Zalo, ảnh đại diện).
- Kênh nhận lead (Webhook/Telegram/Google Sheets URL qua biến môi trường).

### 7.2 Schema dữ liệu chuẩn (TypeScript / JSON)
Cần định nghĩa rõ cấu trúc để dùng chung cho danh sách, bộ lọc, drawer và bản đồ:
- **`Unit` (Thấp tầng)**: `id`, `code` (vd `CL8-12`, tự che 2 ký tự cuối ở chế độ công khai), `project` (`ocp2` | `ocp3`), `zoneId`, `zoneName`, `type` (Liền kề, Liền kề góc, Shophouse, Song lập, Tứ lập, Xẻ khe, Đơn lập), `landArea`, `floorArea`, `floors`, `frontage`, `depth`, `direction`, `legal` (`Có sổ` | `HĐMB`), `status` (`Nhà thô` | `Hoàn thiện`), `statusNote`, `price` (tỷ), `priceType` (`Bao phí` | `Thu về`), `isHot`, `isSold`, `roadLabel`, `images[]`, `lat`, `lng`, `updatedAt`.
- **`Apartment` (Chung cư)**: `id`, `code`, `projectName`, `building`, `type` (`Studio` | `1PN+` | `2PN` | `2PN+` | `3PN`), `area`, `direction`, `view`, `originalPrice`, `discount`, `price`, `floorPlanNote`.
- **`Zone` (Phân khu)**: `id`, `code` (`SB`, `CX`, `CL`...), `name`, `project` (`ocp2` | `ocp3`), `center: [lat, lng]`, `zoom`, `color`.
- **`DesignTemplate` (Mẫu thiết kế)**: `slug`, `title`, `project`, `zone`, `landArea`, `floors`, `floorArea`, `summary`, `rooms[]` (tên phòng + m² từng tầng).

### 7.3 Bản vẽ SVG mặt bằng lô (`LotBlueprint`) cho căn chưa có ảnh
Quan sát `quy-can.png` và `ocp2.png`: các căn chưa có ảnh chụp thật không để trống mà render **SVG blueprint nền lưới xanh nhạt**:
- Khung lô đất bo góc, hiển thị kích thước mặt tiền (vd `4,5 m`, `5 m`) và chiều sâu (`16 m`).
- Đường nhựa nét đứt ở cạnh dưới kèm mũi tên chỉ hướng (`↑ Hướng Đông Nam`).
- Giữa lô hiện mã căn (`CL-xx`), `98 m² đất`, `5 tầng · 282,8 m² sàn`.

### 7.4 Đặc tả Drawer chi tiết căn (`aside#can`)
Mục 2.5 và 6.1 mới nhắc đến drawer trượt ra khi bấm thẻ/marker. Cần quy định đủ:
- Header: Mã căn + badge HOT/Mặt đường + nút đóng `×`.
- Media: Gallery ảnh (hoặc `LotBlueprint` SVG nếu chưa có ảnh).
- Bảng thông số 2 cột: Dự án, Phân khu, Loại hình, DT đất, DT sàn, Kích thước lô, Số tầng, Hướng, Pháp lý, Hiện trạng.
- Khối giá nổi bật: Giá tổng (tỷ), đơn giá (tr/m²), kiểu giá (`Bao phí` / `Thu về`).
- Hành động: Nút **Nhận bảng tính / Đặt lịch xem** (mở `LeadForm` điền sẵn mã căn vào ghi chú), nút **Gọi ngay**, nút **Nhắn Zalo**.

### 7.5 Giải pháp bản đồ khi chưa có bộ tile tự cắt (`/tiles/{z}/{x}/{y}.jpg`)
Site gốc dùng tile ảnh mặt bằng tự host. Để website mới chạy ngay 100% mà không vỡ ảnh tile:
- Trang chủ (`/`) và `/ve-tinh`, `/am-thuc` dùng **Leaflet** với lớp nền chuyển đổi được giữa **Bản đồ đường phố (OpenStreetMap)** và **Ảnh vệ tinh (Esri World Imagery)** căn đúng tọa độ thật của Vinhomes Ocean Park 2 & 3 (Văn Giang, Hưng Yên: `20.945°N, 105.975°E`), vẽ ranh giới/nhãn phân khu và marker giá `.ctag` tương tác trực tiếp.
- Trang `/3d` và `/olympic` có thể làm ở giai đoạn 2 hoặc dựng trang giới thiệu + viewer tương tác nhẹ trước.

### 7.6 Bổ sung SEO & Anti-spam
- Thêm `robots.ts`, `sitemap.ts`, OpenGraph metadata động cho từng trang dự án và trang quỹ căn.
- API `/api/lead` và `/api/sell`: kiểm tra honeypot (`web`), validate SĐT Việt Nam (`03/05/07/08/09...`), trả về JSON chuẩn để UI hiển thị màn hình cảm ơn.
