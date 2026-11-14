export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  phone: string;
  phoneDisplay: string;
  zaloUrl: string;
  avatarInitials: string;
  bio: string;
}

export const SITE_CONFIG = {
  brandName: "nhadepvinhome",
  brandDisplayName: "Nhà Đẹp Vinhome",
  brandSub: "OCEAN PARK 2 · 3",
  domain: "nhadepvinhome.vn",
  title: "Nhà Đẹp Vinhome — Quỹ Căn Chuyển Nhượng Ocean Park 2 & 3",
  description:
    "Xem từng căn thấp tầng & chung cư chuyển nhượng Vinhomes Ocean Park 2 - 3 ngay trên bản đồ tương tác: vị trí, diện tích, hướng, giá thu về / bao phí.",
  updatedDate: "13/11/2026",
  hotPricePerM2Threshold: 125, // triệu/m² -> nhãn HOT
  disclaimer:
    "Website của đơn vị môi giới độc lập Nhà Đẹp Vinhome, chuyên tư vấn chuyển nhượng & ký gửi BĐS Vinhomes Ocean Park 2 & 3. Không phải website chính thức của chủ đầu tư Vingroup / Vinhomes.",
  priceWarning:
    "Giá bán, tình trạng căn và chính sách chuyển nhượng có thể thay đổi theo thị trường tại thời điểm giao dịch. Vui lòng liên hệ trực tiếp để nhận bảng hàng cập nhật mới nhất.",
  agents: [
    {
      id: "agent-1",
      name: "Minh Quân",
      role: "Chuyên viên Thấp tầng & Chung cư OCP2-3",
      phone: "0988123456",
      phoneDisplay: "0988 123 456",
      zaloUrl: "https://zalo.me/0988123456",
      avatarInitials: "MQ",
      bio: "Hơn 5 năm tư vấn trực tiếp tại đại đô thị Vinhomes Ocean Park 1-2-3. Dẫn xem nhà thực tế, kiểm tra pháp lý sổ đỏ/HĐMB và hỗ trợ thủ tục chuyển nhượng trọn gói.",
    },
    {
      id: "agent-2",
      name: "Thu Hà",
      role: "Quản lý Quỹ hàng & Ký gửi",
      phone: "0977654321",
      phoneDisplay: "0977 654 321",
      zaloUrl: "https://zalo.me/0977654321",
      avatarInitials: "TH",
      bio: "Điều phối quỹ căn độc quyền và tiếp nhận ký gửi bán nhanh từ chủ nhà tại Ocean Park 2 & 3.",
    },
  ] satisfies AgentProfile[],
};
