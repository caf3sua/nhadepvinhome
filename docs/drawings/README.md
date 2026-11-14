# Bản vẽ mẫu nhà cho trang /3d

Mỗi mẫu nhà 1 thư mục, tên theo dạng `<phan-khu>-<dien-tich>`, ví dụ:

```
docs/drawings/
  pho-bien-119/
    mat-bang-tang-1.pdf
    mat-bang-tang-2.pdf
    ...
    mat-cat.pdf          # hoặc mặt đứng
    thong-tin.md         # điền theo mẫu bên dưới (nếu có)
  co-xanh-80/
    ...
```

## Định dạng nhận được
- Tốt nhất: **PDF vector** hoặc **DWG/DXF** (đọc được kích thước chính xác).
- Được: ảnh chụp / scan rõ nét, thấy được **số kích thước ghi trên bản vẽ**.

## Cần cho mỗi mẫu
| Thông tin | Lấy từ đâu |
|---|---|
| Kích thước lô (rộng × sâu), khoảng lùi trước/sau, sân/vườn hông | Mặt bằng tầng 1 / tổng mặt bằng |
| Số tầng, **cao độ sàn từng tầng**, cao độ mái/tum | Mặt cắt hoặc mặt đứng |
| Mặt bằng **từng tầng** có kích thước trục/tường | Mặt bằng các tầng |
| Vị trí thang bộ, thang máy (nếu có), hướng cửa thang máy | Mặt bằng |
| Tên phòng (và diện tích nếu bản vẽ có ghi) | Mặt bằng |
| Bố trí nội thất chính (giường, sofa, bếp, WC…) | Mặt bằng nội thất (không bắt buộc) |
| Phân khu, dự án, ghi chú nguồn bản vẽ | Điền tay |

Thiếu mặt cắt thì vẫn dựng được, nhưng chiều cao tầng sẽ ghi là **ước lượng** trên trang.

## Mẫu `thong-tin.md` (tuỳ chọn)
```md
- Tên hiển thị: Phố Biển 119 m²
- Phân khu / dự án: Phố Biển · Vinhomes Ocean Park 3
- Lô: 7 × 17 m, căn góc phải, vườn hông 2 m
- Số tầng: 5 · Thang máy: có
- Nguồn bản vẽ: hồ sơ cải tạo … (năm …)
- Ghi chú: …
```

> Bản vẽ có thể chứa thông tin chủ nhà (tên, địa chỉ, mã căn đầy đủ). Hãy che trước khi gửi, hoặc báo để không đưa các thông tin đó lên web.

## Tạo căn 3D tự động

Đã có skill **`/tao-can-3d`** (`.claude/skills/tao-can-3d/`): gõ `/tao-can-3d` trong Claude Code
rồi gửi ảnh mặt bằng (kèm DTXD, tên mẫu, phân khu) — Claude sẽ đo kích thước, viết file
`src/data/houses3d/<id>.ts`, đăng ký vào trang `/3d` và chụp ảnh kiểm tra.
