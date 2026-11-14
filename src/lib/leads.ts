import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type LeadKind = "lead" | "sell";

export interface LeadRecord {
  kind: LeadKind;
  at: string;
  data: Record<string, string>;
}

const LABELS: Record<LeadKind, string> = {
  lead: "🔔 Khách để lại SĐT nhận bảng hàng",
  sell: "🏠 Chủ nhà gửi bán căn",
};

/** Thư mục lưu file lead; mặc định `.data/` ở gốc dự án (đã gitignore). */
function leadsFile(): string {
  const dir = process.env.LEADS_DIR || path.join(process.cwd(), ".data");
  return path.join(dir, "leads.jsonl");
}

async function saveToFile(record: LeadRecord): Promise<void> {
  const file = leadsFile();
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, JSON.stringify(record) + "\n", "utf8");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendTelegram(record: LeadRecord): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("telegram-not-configured");

  const lines = Object.entries(record.data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`);
  const text = [`<b>${LABELS[record.kind]}</b>`, ...lines, `<i>${record.at}</i>`].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`telegram-${res.status}`);
}

async function sendWebhook(record: LeadRecord): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) throw new Error("webhook-not-configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`webhook-${res.status}`);
}

/**
 * Lưu lead vào mọi kênh đã cấu hình. Trả về true nếu ít nhất một kênh
 * nhận được, để API không báo "thành công" khi lead thực tế bị mất.
 */
export async function saveLead(kind: LeadKind, data: Record<string, string>): Promise<boolean> {
  const record: LeadRecord = { kind, at: new Date().toISOString(), data };

  const sinks: Promise<void>[] = [saveToFile(record)];
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) sinks.push(sendTelegram(record));
  if (process.env.LEAD_WEBHOOK_URL) sinks.push(sendWebhook(record));

  const results = await Promise.allSettled(sinks);
  results.forEach((r) => {
    if (r.status === "rejected") console.error(`[${kind.toUpperCase()}] lưu lead lỗi:`, r.reason);
  });
  return results.some((r) => r.status === "fulfilled");
}

/** Lấy chuỗi đã trim, giới hạn độ dài để tránh payload rác. */
export function str(v: unknown, max = 300): string {
  return String(v ?? "").trim().slice(0, max);
}
