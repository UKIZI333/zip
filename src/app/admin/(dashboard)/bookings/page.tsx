"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function getRequestedCodeNum(additional_code: string | null): number {
  if (!additional_code) return 1;
  const match = additional_code.match(/CODE_(\d)_REQUESTED/i);
  if (match) return parseInt(match[1], 10);
  return 1;
}

function renderAdditionalCode(code: string | null) {
  if (!code) return "—";
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

export default function AdminBookingsPage() {
  const [supabase] = useState(() => createClient());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings((data ?? []) as Booking[]);
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

  const pending = bookings.filter((b) => b.status === "pending");
  const awaitingCode = bookings.filter((b) => b.status === "awaiting_code");
  const others = bookings.filter((b) => b.status !== "pending" && b.status !== "awaiting_code");

  function Row({ b }: { b: Booking }) {
    return (
      <tr className="border-b rule-hairline align-top">
        <td className="py-4 pr-4"><StatusPill status={b.status} /></td>
        <td className="py-4 pr-4 text-ink">{b.first_name}</td>
        <td className="py-4 pr-4 text-ink">{b.last_name}</td>
        <td className="py-4 pr-4 text-muted">{b.email}</td>
        <td className="py-4 pr-4 text-muted whitespace-nowrap">{b.phone_number || "—"}</td>
        <td className="py-4 pr-4 text-muted max-w-[220px] truncate" title={b.notes ?? ""}>{b.notes || "—"}</td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">
          {new Date(b.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">{formatTime(b.start_time)}</td>
        <td className="py-4 pr-4 font-mono text-xs text-ink whitespace-nowrap">{b.candidate_id || "—"}</td>
        <td className="py-4 pr-4 font-mono text-xs text-ink whitespace-nowrap">{b.passkey || "—"}</td>
        <td className="py-4 pr-4 whitespace-nowrap">{renderAdditionalCode(b.additional_code)}</td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">
          {new Date(b.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="py-4 pr-4">
          {b.status === "pending" ? (
            <div className="flex flex-col gap-2.5 font-mono text-xs whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "confirmed")}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-confirmed border border-emerald-200 rounded font-semibold transition-colors disabled:opacity-40"
                >
                  ✓ Confirm
                </button>
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "rejected")}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-rejected border border-red-200 rounded font-semibold transition-colors disabled:opacity-40"
                >
                  ✕ Reject
                </button>
              </div>

              <div className="pt-1.5 border-t rule-hairline">
                <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                  Require Code:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      disabled={busyId === b.id}
                      onClick={() => requireCode(b.id, num)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-mono text-[11px] font-semibold transition-colors disabled:opacity-40"
                      title={`Require Additional Code ${num}`}
                    >
                      Code {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : b.status === "awaiting_code" ? (
            <div className="flex flex-col gap-2 font-mono text-xs whitespace-nowrap">
              <span className="text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded text-[11px] font-semibold">
                ⏳ Waiting for Code {getRequestedCodeNum(b.additional_code)}…
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "confirmed")}
                  className="text-confirmed hover:underline text-[11px]"
                >
                  Confirm
                </button>
                <span className="text-muted">·</span>
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "rejected")}
                  className="text-rejected hover:underline text-[11px]"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <span className="text-muted text-xs">—</span>
          )}
        </td>
      </tr>
    );
  }

  const headCells = [
    "Status",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Notes",
    "Date",
    "Time",
    "Candidate ID",
    "Passkey",
    "Additional Code",
    "Created",
    "Actions",
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Bookings</h1>
      <p className="mt-2 text-muted">
        {pending.length} awaiting verification, {awaitingCode.length} waiting on an additional code. Confirming,
        rejecting, or requesting an additional code (1, 2, 3, or 4) updates the candidate&rsquo;s page in real time.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b rule-hairline font-mono text-[11px] uppercase tracking-widest2 text-muted">
              {headCells.map((c) => (
                <th key={c} className="py-3 pr-4 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={headCells.length} className="py-8 text-center text-muted">Loading…</td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={headCells.length} className="py-8 text-center text-muted">No bookings yet.</td>
              </tr>
            )}
            {pending.map((b) => <Row key={b.id} b={b} />)}
            {awaitingCode.map((b) => <Row key={b.id} b={b} />)}
            {others.map((b) => <Row key={b.id} b={b} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
