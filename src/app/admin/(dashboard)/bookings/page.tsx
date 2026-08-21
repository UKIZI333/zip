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
        <td className="py-4 pr-4 font-mono text-xs text-ink whitespace-nowrap">{b.additional_code || "—"}</td>
        <td className="py-4 pr-4 text-muted font-mono text-xs whitespace-nowrap">
          {new Date(b.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="py-4 pr-4">
          {b.status === "pending" ? (
            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest2 whitespace-nowrap">
              <div className="flex gap-3">
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "confirmed")}
                  className="text-confirmed hover:text-confirmed/70 disabled:opacity-40"
                >
                  Confirm
                </button>
                <button
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b.id, "rejected")}
                  className="text-rejected hover:text-rejected/70 disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
              <button
                disabled={busyId === b.id}
                onClick={() => setStatus(b.id, "awaiting_code")}
                className="text-pending hover:text-pending/70 disabled:opacity-40 text-left"
              >
                Require Additional Code
              </button>
            </div>
          ) : b.status === "awaiting_code" ? (
            <span className="text-muted text-xs normal-case">Waiting on candidate…</span>
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
        {pending.length} awaiting verification, {awaitingCode.length} waiting on an additional code. Confirming or
        rejecting updates the candidate&rsquo;s page in real time.
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
