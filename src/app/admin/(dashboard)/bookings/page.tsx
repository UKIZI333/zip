"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";
import {
  parseBookingCodeData,
  serializeBookingCodeData,
  type BookingCodeData,
} from "@/lib/codeData";
import {
  Send,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CheckCheck,
} from "lucide-react";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Copyable Cell with instant visual feedback
function CopyableCell({
  value,
  label,
}: {
  value: string | null | undefined;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!value || value.trim() === "") {
    return <span className="text-gray-300 font-mono text-xs">—</span>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50/80 border border-gray-200/80 group hover:border-gray-300 transition-colors">
      <span className="font-mono text-xs font-semibold text-gray-900 select-all">
        {value}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? "Copied!" : `Copy ${label || "value"}`}
        className={`p-0.5 rounded transition-all ${
          copied
            ? "text-emerald-600 bg-emerald-50"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/60"
        }`}
      >
        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [supabase] = useState(() => createClient());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  // Live updates: instant sync when candidates submit codes or bookings change
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

  // Global Confirm (Final approval for the meeting)
  async function confirmBooking(id: string) {
    setBusyId(id);
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", id);
    setBusyId(null);
  }

  // Reject Candidate ID & Passkey (re-prompts candidate for ID & Passkey)
  async function rejectIdPasskey(id: string) {
    setBusyId(id);
    await supabase.from("bookings").update({ status: "rejected" }).eq("id", id);
    setBusyId(null);
  }

  // Require Candidate to input Code 1, 2, 3, or 4
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

  // Reject specific Code (1, 2, 3, or 4): candidate stays on that Code popup with wrong code error
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

  // Render comprehensive, real-time candidate phase badge
  function renderCandidatePhase(b: Booking) {
    const codeData = parseBookingCodeData(b.additional_code);
    const req = codeData.active_req || "";

    if (b.status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Confirmed</span>
        </span>
      );
    }

    if (b.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Rejected (Re-entering ID &amp; Passkey)</span>
        </span>
      );
    }

    if (b.status === "awaiting_code") {
      if (req.startsWith("POP_CODE:")) {
        const val = req.replace("POP_CODE:", "");
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Pop-out Code Active: {val}</span>
          </span>
        );
      }

      if (req.includes("_REJECTED")) {
        const match = req.match(/CODE_(\d)_REJECTED/i);
        const num = match ? match[1] : "1";
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-900 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Code {num} Rejected (Candidate Re-entering)</span>
          </span>
        );
      }

      if (req.includes("_REQUESTED")) {
        const match = req.match(/CODE_(\d)_REQUESTED/i);
        const num = match ? match[1] : "1";
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Candidate in Code {num}</span>
          </span>
        );
      }
    }

    // status === "pending"
    const submittedCodes = [
      codeData.code_4 ? "Code 4" : null,
      codeData.code_3 ? "Code 3" : null,
      codeData.code_2 ? "Code 2" : null,
      codeData.code_1 ? "Code 1" : null,
    ].filter(Boolean);

    if (submittedCodes.length > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{submittedCodes[0]} Submitted (Reviewing)</span>
        </span>
      );
    }

    if (b.candidate_id && b.passkey) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>ID &amp; Passkey (Reviewing)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span>In ID/Passkey Modal</span>
      </span>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending" || b.status === "awaiting_code");
  const others = bookings.filter((b) => b.status === "confirmed" || b.status === "rejected");

  function Row({ b }: { b: Booking }) {
    const codeData = parseBookingCodeData(b.additional_code);
    const isPopActive = b.status === "awaiting_code" && codeData.active_req?.startsWith("POP_CODE:");
    const currentPopVal = popInputs[b.id] ?? codeData.pop_code ?? "";

    return (
      <tr className="border-b rule-hairline align-top hover:bg-paperdim/30 transition-colors">
        {/* Real-time Candidate Phase Badge */}
        <td className="py-4 px-3 whitespace-nowrap">{renderCandidatePhase(b)}</td>

        {/* Candidate Information */}
        <td className="py-4 px-3 whitespace-nowrap">
          <div className="font-medium text-ink text-sm">
            {b.first_name} {b.last_name}
          </div>
          <div className="text-xs font-mono text-muted">{b.email}</div>
          <div className="text-xs font-mono text-muted">{b.phone_number || "—"}</div>
        </td>

        {/* Date & Time */}
        <td className="py-4 px-3 whitespace-nowrap text-muted font-mono text-xs">
          <div>{new Date(b.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
          <div className="text-ink font-semibold text-[11px]">{formatTime(b.start_time)}</div>
        </td>

        {/* Candidate ID (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={b.candidate_id} label="Candidate ID" />
        </td>

        {/* Passkey (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={b.passkey} label="Passkey" />
        </td>

        {/* Additional Code 1 (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={codeData.code_1} label="Code 1" />
        </td>

        {/* Additional Code 2 (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={codeData.code_2} label="Code 2" />
        </td>

        {/* Additional Code 3 (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={codeData.code_3} label="Code 3" />
        </td>

        {/* Additional Code 4 (+ Copy) */}
        <td className="py-4 px-3 whitespace-nowrap">
          <CopyableCell value={codeData.code_4} label="Code 4" />
        </td>

        {/* Pop-out Code Display */}
        <td className="py-4 px-3 whitespace-nowrap">
          {codeData.pop_code ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200">
              ⚡ {codeData.pop_code}
            </span>
          ) : (
            <span className="text-gray-300 font-mono text-xs">—</span>
          )}
        </td>

        {/* Action Controls */}
        <td className="py-4 px-3">
          <div className="flex flex-col gap-3 font-sans text-xs min-w-[260px]">
            {/* Top Row: One Confirm Meeting & Reject ID/Passkey */}
            <div className="flex items-center gap-2">
              <button
                disabled={busyId === b.id || b.status === "confirmed"}
                onClick={() => confirmBooking(b.id)}
                className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition-colors disabled:opacity-40 shadow-2xs flex items-center justify-center gap-1"
                title="Confirm and finalize this candidate's interview booking"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Meeting</span>
              </button>

              <button
                disabled={busyId === b.id || b.status === "rejected"}
                onClick={() => rejectIdPasskey(b.id)}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-md font-semibold transition-colors disabled:opacity-40"
                title="Reject candidate ID/Passkey and prompt candidate to re-enter"
              >
                ✕ Reject ID
              </button>
            </div>

            {/* Code 1 to Code 4 Section: Require & Dedicated Rejection per Code */}
            <div className="p-2 bg-gray-50/90 border border-gray-200 rounded-lg space-y-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold block">
                Additional Codes (Require / Reject):
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4].map((num) => {
                  const isCurrentReq =
                    b.status === "awaiting_code" && codeData.active_req === `CODE_${num}_REQUESTED`;
                  const isCurrentRej =
                    b.status === "awaiting_code" && codeData.active_req === `CODE_${num}_REJECTED`;

                  return (
                    <div
                      key={num}
                      className={`flex items-center justify-between p-1 rounded border transition-all ${
                        isCurrentReq
                          ? "bg-amber-100/90 border-amber-400"
                          : isCurrentRej
                          ? "bg-red-100/90 border-red-400"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => requireCode(b, num)}
                        className="text-[11px] font-mono font-bold text-gray-800 hover:text-blue-600 px-1 py-0.5"
                        title={`Require candidate to enter Additional Code ${num}`}
                      >
                        Code {num}
                      </button>

                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => rejectSpecificCode(b, num)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-700 hover:bg-red-50 border border-red-200"
                        title={`Reject Code ${num} (keeps candidate on Code ${num} popup with error)`}
                      >
                        ✕ Rej
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pop-out Code to Candidate */}
            <div className="p-2 bg-purple-50/50 border border-purple-200 rounded-lg space-y-1.5">
              <span className="text-[10px] text-purple-900 uppercase tracking-wider font-mono font-bold block">
                ⚡ Pop-out Code to Candidate:
              </span>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 789456"
                  value={currentPopVal}
                  onChange={(e) => setPopInputs({ ...popInputs, [b.id]: e.target.value })}
                  className="w-24 px-2 py-1 text-xs font-mono font-bold border border-purple-300 rounded bg-white text-purple-950 focus:border-purple-500 outline-none"
                />

                <button
                  type="button"
                  disabled={busyId === b.id || !currentPopVal.trim()}
                  onClick={() => sendPopCode(b)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold font-mono transition-colors disabled:opacity-40 inline-flex items-center gap-1 shadow-2xs"
                  title="Pop out this code directly onto candidate modal in real time"
                >
                  {isPopActive ? <RefreshCw className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  <span>{isPopActive ? "Update" : "Pop Code"}</span>
                </button>

                {isPopActive && (
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => clearPopCode(b)}
                    className="p-1 hover:bg-purple-100 text-purple-700 rounded transition-colors"
                    title="Dismiss pop-out code"
                  >
                    <X className="w-3.5 h-3.5 text-purple-700" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  const headCells = [
    "Candidate Phase",
    "Candidate",
    "Date & Time",
    "Candidate ID",
    "Passkey",
    "Code 1",
    "Code 2",
    "Code 3",
    "Code 4",
    "Pop Code",
    "Actions & Verification",
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Bookings &amp; Verification Dashboard</h1>
          <p className="mt-2 text-muted text-sm">
            Live multi-stage candidate verification with individual field copying, dedicated per-code rejections, and real-time pop-out codes.
          </p>
        </div>

        <button
          onClick={() => load()}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 border rule-hairline rounded-lg font-mono text-xs text-muted hover:text-ink hover:bg-paperdim transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 font-mono text-[11px] uppercase tracking-widest2 text-gray-500">
              {headCells.map((c) => (
                <th key={c} className="py-3.5 px-3 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={headCells.length} className="py-12 text-center text-muted font-mono text-xs">
                  Loading live bookings…
                </td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={headCells.length} className="py-12 text-center text-muted">
                  No bookings registered yet.
                </td>
              </tr>
            )}
            {pending.map((b) => (
              <Row key={b.id} b={b} />
            ))}
            {others.map((b) => (
              <Row key={b.id} b={b} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
