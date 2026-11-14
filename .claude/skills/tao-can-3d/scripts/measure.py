"""Đo đường tường trên ảnh mặt bằng (pixel) để suy ra toạ độ mét.

Cách dùng (chạy với: python -I -X utf8 measure.py ...):

  peaks <ảnh> <x0> <y0> <x1> <y1> [--thr 100] [--frac 0.5]
      Trong vùng chữ nhật, đếm điểm tối (< thr) theo từng cột / từng hàng và in
      các dải liên tiếp có số điểm tối >= frac × cực đại. Dùng để tìm tường ngoài
      (dải dày) và các vách trong (dải mảnh) theo cả hai trục.

  runs <ảnh> --rows 416,479 [--thr 110] [--min 3]
  runs <ảnh> --cols 90,198 [--thr 110] [--min 3]
      In các đoạn tối liên tục trên từng hàng (hoặc cột) — biết một vách chạy
      từ pixel nào tới pixel nào (VD vách trước lõi thang chỉ dài 0,8 m).

  scale <px_a> <px_b> <met>
      In px/m từ hai mép (pixel) và khoảng cách thật (m).

Mẹo:
  - Ảnh nhiều tầng chung một file: chạy peaks riêng cho từng khung tầng.
  - Đổi pixel → mét: x = (px - px_tường_trái) / px_per_m ;
    d = (py_mặt_tiền - py) / px_per_m (ảnh vẽ mặt tiền ở dưới).
"""

import sys

from PIL import Image


def load_gray(path):
    return Image.open(path).convert("L")


def bands(values, frac, offset):
    """Các dải liên tiếp có giá trị >= frac × max, trả về [(start, end)] theo pixel ảnh."""
    m = max(values) if values else 0
    if m == 0:
        return []
    out, run = [], None
    for i, v in enumerate(values):
        if v >= m * frac:
            run = [i, i] if run is None else [run[0], i]
        elif run is not None:
            out.append((run[0] + offset, run[1] + offset))
            run = None
    if run is not None:
        out.append((run[0] + offset, run[1] + offset))
    return out


def opt(args, name, default, cast=float):
    if name in args:
        i = args.index(name)
        return cast(args[i + 1])
    return default


def cmd_peaks(args):
    path = args[0]
    x0, y0, x1, y1 = map(int, args[1:5])
    thr = opt(args, "--thr", 100, int)
    frac = opt(args, "--frac", 0.5)
    im = load_gray(path).crop((x0, y0, x1, y1))
    w, h = im.size
    px = im.load()
    cols = [sum(1 for y in range(h) if px[x, y] < thr) for x in range(w)]
    rows = [sum(1 for x in range(w) if px[x, y] < thr) for y in range(h)]
    print(f"ảnh {path} · vùng {x0},{y0} → {x1},{y1} ({w}×{h}) · thr={thr} frac={frac}")
    print("dải cột (x):", bands(cols, frac, x0))
    print("dải hàng (y):", bands(rows, frac, y0))


def runs_on_line(px, length, fixed, along_x, thr, min_len):
    pts = []
    for i in range(length):
        v = px[i, fixed] if along_x else px[fixed, i]
        if v < thr:
            pts.append(i)
    out, s, p = [], None, None
    for i in pts:
        if s is None:
            s = p = i
        elif i == p + 1:
            p = i
        else:
            out.append((s, p))
            s = p = i
    if s is not None:
        out.append((s, p))
    return [r for r in out if r[1] - r[0] + 1 >= min_len]


def cmd_runs(args):
    path = args[0]
    thr = opt(args, "--thr", 110, int)
    min_len = opt(args, "--min", 3, int)
    im = load_gray(path)
    w, h = im.size
    px = im.load()
    if "--rows" in args:
        for y in [int(v) for v in args[args.index("--rows") + 1].split(",")]:
            print(f"hàng y={y}:", runs_on_line(px, w, y, True, thr, min_len))
    if "--cols" in args:
        for x in [int(v) for v in args[args.index("--cols") + 1].split(",")]:
            print(f"cột x={x}:", runs_on_line(px, h, x, False, thr, min_len))


def cmd_scale(args):
    a, b, met = float(args[0]), float(args[1]), float(args[2])
    print(f"{abs(b - a):.1f} px / {met} m = {abs(b - a) / met:.3f} px/m")


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("peaks", "runs", "scale"):
        print(__doc__)
        sys.exit(1)
    {"peaks": cmd_peaks, "runs": cmd_runs, "scale": cmd_scale}[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    main()
