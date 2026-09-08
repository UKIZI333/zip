import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate Secret if configured
    const secret = req.headers.get("x-webhook-secret");
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret && secret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram Bot Token or Chat ID not configured in environment variables.");
      return NextResponse.json(
        { error: "Telegram credentials not configured on server" },
        { status: 500 }
      );
    }

    // 2. Determine event type
    // Supabase Webhooks pass: { type: 'INSERT', table: 'schedule_visits', record: { ... }, schema: 'public' }
    const table = body.table || body.event || (body.record?.session_id ? "schedule_visits" : "custom");
    const record = body.record || body;

    let messageText = "";

    if (table === "schedule_visits" || body.type === "schedule_visit") {
      const interviewer = record.interviewer_name || "Default";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const timezone = record.timezone || "Unknown";
      const userAgent = record.user_agent ? (record.user_agent.length > 80 ? record.user_agent.substring(0, 80) + "..." : record.user_agent) : "Unknown";
      const time = new Date(record.created_at || Date.now()).toLocaleTimeString("en-GB", {
        timeZone: "Europe/Belgrade",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      messageText = `⚡ *Candidate Opened Scheduling Link!*\n\n` +
        `👤 *Interviewer Link:* ${interviewer}${adminEmail}\n` +
        `🕒 *Time:* ${time} (Belgrade / CEST)\n` +
        `🌍 *Timezone:* \`${timezone}\`\n` +
        `📱 *Device / Browser:* \`${userAgent}\``;
    } else if (table === "bookings" || body.type === "booking_created") {
      const candidateName = `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Candidate";
      const email = record.email || "N/A";
      const phone = record.phone || "N/A";
      const date = record.scheduled_date || "N/A";
      const time = record.scheduled_time || "N/A";
      const interviewer = record.interviewer_name || "Default";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";

      messageText = `🎉 *New Interview Booked!*\n\n` +
        `👤 *Candidate:* ${candidateName}\n` +
        `📧 *Email:* \`${email}\`\n` +
        `📞 *Phone:* \`${phone}\`\n` +
        `📅 *Date & Time:* ${date} at ${time}\n` +
        `👔 *Interviewer:* ${interviewer}${adminEmail}`;
    } else {
      messageText = `🔔 *Recruitment Notification:*\n\`\`\`json\n${JSON.stringify(record, null, 2)}\n\`\`\``;
    }

    // 3. Send message via Telegram Bot API
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown",
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
