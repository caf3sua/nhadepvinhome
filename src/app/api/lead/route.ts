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

  // Honeypot anti-spam: bot điền ô ẩn → giả vờ thành công, không lưu
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

  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Vui lòng xác nhận đồng ý để chuyên viên liên hệ tư vấn." },
      { status: 400 }
    );
  }

  const saved = await saveLead("lead", {
    "Họ tên": str(body.name, 100) || "Khách hàng",
    "SĐT/Zalo": phone,
    "Quan tâm": str(body.interest, 100),
    "Ghi chú": str(body.note, 500),
    "Trang": str(body.page, 200),
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Hệ thống đang bận, Quý khách vui lòng gọi trực tiếp hotline." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
