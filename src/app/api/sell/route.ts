import { NextResponse } from "next/server";
import { isValidVnPhone } from "@/lib/format";
import { saveLead, str } from "@/lib/leads";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  if (body.web) {
    return NextResponse.json({ ok: true });
  }

  const phone = str(body.phone, 20);
  if (!isValidVnPhone(phone)) {
    return NextResponse.json(
      { error: "Số điện thoại chưa đúng định dạng Việt Nam (VD: 0988123456)." },
      { status: 400 }
    );
  }

  const unitCode = str(body.unitCode, 50);
  if (!unitCode) {
    return NextResponse.json({ error: "Vui lòng nhập mã căn muốn ký gửi." }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Vui lòng xác nhận đồng ý để chuyên viên liên hệ lại." },
      { status: 400 }
    );
  }

  const saved = await saveLead("sell", {
    "Loại": str(body.category, 20) === "chung-cu" ? "Chung cư" : "Thấp tầng",
    "Dự án": str(body.project, 20) === "ocp3" ? "Ocean Park 3" : "Ocean Park 2",
    "Phân khu/Tòa": str(body.zone, 100),
    "Mã căn": unitCode,
    "Diện tích (m²)": str(body.area, 20),
    "Tình trạng": str(body.status, 30),
    "Pháp lý": str(body.legal, 30),
    "Giá (tỷ)": str(body.price, 20),
    "Kiểu giá": str(body.priceType, 20),
    "Chủ nhà": str(body.ownerName, 100),
    "SĐT/Zalo": phone,
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Hệ thống đang bận, Quý khách vui lòng gọi trực tiếp hotline." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
