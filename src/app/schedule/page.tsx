"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import PhoneInputWithCountry from "@/components/PhoneInputWithCountry";
import TimezoneSelector from "@/components/TimezoneSelector";
import VerifyModal, { type VerifyStage } from "@/components/VerifyModal";
import MeetingInfoPanel from "@/components/MeetingInfoPanel";
import type { Settings, BookingStatus } from "@/lib/types";
import {
  buildMonthGrid,
  buildDaySlots,
  formatDateLong,
  WEEKDAY_LABELS,
  type MonthDay,
  type TimeSlot,
} from "@/lib/scheduling";
import { parseBookingCodeData, serializeBookingCodeData, getCodeLabel, type BookingCodeData } from "@/lib/codeData";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  working_days: [1, 2, 3, 4, 5],
  day_start_time: "09:00",
  day_end_time: "17:00",
  slot_duration_mins: 30,
  timezone: "Europe/Belgrade",
  interviewer_name: "Alban Jashari",
  interviewer_photo_url: null,
  meeting_type: "Web Conference",
  updated_at: "",
};

type Step = "datetime" | "details";
type Phase = "form" | "confirmed";

const MONTH_LABEL = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

function SchedulePageInner() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const jobSlug = searchParams.get("job");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const monthGrid = useMemo(() => buildMonthGrid(cursor.year, cursor.month, settings), [cursor, settings]);
  const [timezone, setTimezone] = useState<string>("Europe/Belgrade");

  const [step, setStep] = useState<Step>("datetime");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+383 ");
  const [notes, setNotes] = useState("");
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  const [phase, setPhase] = useState<Phase>("form");
  const [verifyStage, setVerifyStage] = useState<VerifyStage>("closed");
  const [codeNumber, setCodeNumber] = useState<number>(1);
  const [displayCodeValue, setDisplayCodeValue] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Initialize client's detected timezone
  useEffect(() => {
    try {
      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (clientTz) setTimezone(clientTz);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
      if (s) {
        setSettings({
          ...s,
          interviewer_name: s.interviewer_name || "Alban Jashari",
        } as Settings);
      }

      if (jobSlug) {
        const { data: job } = await supabase
          .from("jobs")
          .select("id, title")
          .eq("slug", jobSlug)
          .eq("status", "published")
          .maybeSingle();
        if (job) {
          setJobId(job.id);
          setJobTitle(job.title);
        }
      }
    })();
  }, [supabase, jobSlug]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    (async () => {
      const { data } = await supabase.from("public_booking_slots").select("start_time").eq("date", selectedDate);
      const taken = (data ?? []).map((r: { start_time: string }) => r.start_time);
      setSlots(buildDaySlots(settings, taken));
      setLoadingSlots(false);
    })();
  }, [selectedDate, settings, supabase]);

  // Realtime: admin actions on this booking drive the modal's stage and error messaging
  useEffect(() => {
    if (!bookingId) return;
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
        (payload) => {
          const newRow = payload.new as { status: BookingStatus; additional_code?: string | null };
          const status = newRow.status;
          const codeData = parseBookingCodeData(newRow.additional_code);
          const req = codeData.active_req || "";

          if (status === "confirmed") {
            setVerifyStage("closed");
            setPhase("confirmed");
          } else if (status === "rejected") {
            // ID & Passkey rejection
            setVerifyError("That ID or passkey doesn't match our records. Please re-enter and try again.");
            setVerifyStage("idPasskey");
          } else if (status === "awaiting_code") {
            if (req.startsWith("POP_CODE:")) {
              const popVal = req.replace("POP_CODE:", "");
              setDisplayCodeValue(popVal);
              setVerifyStage("displayCode");
            } else if (req.includes("_REJECTED")) {
              // Specific Code Rejection (AuthApp, WhatsApp, SMS, Code 4)
              const match = req.match(/CODE_(\d)_REJECTED/i);
              const num = match ? parseInt(match[1], 10) : 1;
              const label = getCodeLabel(num);
              setCodeNumber(num);
              setVerifyError(`${label} verification code is incorrect. Please re-enter and try again.`);
              setVerifyStage("code");
            } else if (req.includes("_REQUESTED")) {
              // Specific Code Requested (AuthApp, WhatsApp, SMS, Code 4)
              const match = req.match(/CODE_(\d)_REQUESTED/i);
              const num = match ? parseInt(match[1], 10) : 1;
              setCodeNumber(num);
              setVerifyError(null);
              setVerifyStage("code");
            } else {
              setCodeNumber(1);
              setVerifyError(null);
              setVerifyStage("code");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  function pickDay(day: MonthDay) {
    if (!day.selectable) return;
    setSelectedDate(day.date);
    setSelectedSlot(null);
  }

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  async function handleSubmitIdPasskey(candidateId: string, passkey: string) {
    setSubmitting(true);
    setVerifyError(null);

    try {
      if (!bookingId) {
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const lastName = rest.join(" ") || "-";
        const combinedNotes = [notes, guestEmail ? `Guests: ${guestEmail}` : ""].filter(Boolean).join("\n");

        const { data, error } = await supabase
          .from("bookings")
          .insert({
            job_id: jobId,
            first_name: firstName || name,
            last_name: lastName,
            email,
            phone_number: phone || null,
            notes: combinedNotes || null,
            date: selectedDate,
            start_time: selectedSlot!.start_time,
            end_time: selectedSlot!.end_time,
            timezone,
            candidate_id: candidateId,
            passkey: passkey,
            status: "pending",
          })
          .select("id")
          .single();

        if (error) throw error;
        setBookingId(data.id);
      } else {
        const { error } = await supabase
          .from("bookings")
          .update({ candidate_id: candidateId, passkey: passkey, status: "pending" })
          .eq("id", bookingId);

        if (error) throw error;
      }

      setVerifyStage("waiting");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitCode(code: string) {
    setSubmitting(true);
    setVerifyError(null);
    try {
      const { data: currentBooking } = await supabase
        .from("bookings")
        .select("additional_code")
        .eq("id", bookingId!)
        .single();

      const existingData = parseBookingCodeData(currentBooking?.additional_code);
      const updatedData: BookingCodeData = {
        ...existingData,
        [`code_${codeNumber}`]: code.trim(),
        active_req: null,
      };

      const { error } = await supabase
        .from("bookings")
        .update({
          additional_code: serializeBookingCodeData(updatedData),
          status: "pending",
        })
        .eq("id", bookingId!);

      if (error) throw error;
      setVerifyStage("waiting");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selection =
    selectedDate && selectedSlot
      ? { date: selectedDate, startTime: selectedSlot.start_time, endTime: selectedSlot.end_time }
      : null;

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col items-center justify-center py-10 px-4 text-gray-800">
      {/* Top Header Logo */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-start">
        <Logo size="sm" />
      </div>

      {/* Main Scheduling Card (Dynamic Width: Compact when no date, Expanded when date selected) */}
      <div
        className={`w-full bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden flex flex-col sm:flex-row transition-all duration-300 relative ${
          step === "datetime" && !selectedDate ? "max-w-3xl" : "max-w-5xl"
        }`}
      >
        {/* Top-Right Diagonal Corner Ribbon Badge: POWER BY NORTHFIELD */}
        <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-30">
          <div className="absolute top-7 -right-10 w-48 bg-[#475569] text-white py-2 text-center transform rotate-45 shadow-lg border-y border-white/20 select-none flex flex-col items-center justify-center leading-tight">
            <span className="text-[9px] font-bold tracking-widest uppercase text-gray-200">
              POWER BY
            </span>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-white">
              NORTHFIELD
            </span>
          </div>
        </div>

        {/* Left Information Panel */}
        <MeetingInfoPanel
          settings={settings}
          jobTitle={jobTitle}
          selection={selection}
          timezone={timezone}
          onBack={() => setStep("datetime")}
          showBackButton={step === "details"}
        />

        {/* Right Interactive Area */}
        <main className="flex-1 p-8 sm:p-10 font-sans">
          {/* STEP 1: DATE & TIME SELECTION (Picture 1) */}
          {phase === "form" && step === "datetime" && (
            <div className="animate-fade-up">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0a2540] mb-8">
                Select a Date &amp; Time
              </h2>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                {/* Calendar Component */}
                <div className="flex-1 max-w-sm">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => changeMonth(-1)}
                      aria-label="Previous month"
                      className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <p className="text-base font-bold text-[#0a2540]">
                      {MONTH_LABEL(cursor.year, cursor.month)}
                    </p>
                    <button
                      onClick={() => changeMonth(1)}
                      aria-label="Next month"
                      className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Weekdays */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-3">
                    {WEEKDAY_LABELS.map((w) => (
                      <div key={w} className="py-1">
                        {w}
                      </div>
                    ))}
                  </div>

                  {/* Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {monthGrid.map((day) => {
                      const isSelected = selectedDate === day.date;
                      return (
                        <div key={day.date} className="flex items-center justify-center py-1">
                          <button
                            disabled={!day.selectable}
                            onClick={() => pickDay(day)}
                            className={`w-10 h-10 text-sm font-semibold rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#0069ff] text-white font-bold shadow-sm"
                                : day.selectable
                                ? "text-[#0069ff] hover:bg-blue-50/80 cursor-pointer font-bold"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            {day.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Timezone Dropdown Selector */}
                  <TimezoneSelector value={timezone} onChange={setTimezone} />
                </div>

                {/* Right Time Slots Column (Shown once a date is selected, Picture 1) */}
                {selectedDate && (
                  <div className="lg:w-64 lg:border-l border-gray-200/80 lg:pl-8 animate-fade-up">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      {formatDateLong(selectedDate)}
                    </p>

                    {loadingSlots ? (
                      <p className="text-gray-400 text-xs py-4">Loading slots…</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {slots.map((s) => {
                          const isCurrent = selectedSlot?.start_time === s.start_time;

                          if (isCurrent) {
                            return (
                              <div key={s.start_time} className="flex gap-2">
                                <div className="flex-1 bg-[#718096] text-white py-3 text-center font-bold text-sm rounded-lg shadow-sm">
                                  {s.label}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setStep("details")}
                                  className="flex-1 bg-[#0069ff] hover:bg-[#0055d4] text-white py-3 text-center font-bold text-sm rounded-lg transition-colors shadow-sm"
                                >
                                  Next
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={s.start_time}
                              disabled={s.taken}
                              onClick={() => setSelectedSlot(s)}
                              className="w-full border border-[#0069ff] text-[#0069ff] hover:bg-blue-50/50 font-bold py-3 text-center rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ENTER DETAILS FORM (Picture 2) */}
          {phase === "form" && step === "details" && (
            <div className="animate-fade-up max-w-lg font-sans">
              <h2 className="text-2xl font-bold text-[#0a2540] mb-6">Enter Details</h2>

              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setVerifyError(null);
                  setVerifyStage("idPasskey");

                  // Create initial booking draft immediately so admin sees candidate entering ID & Passkey
                  try {
                    if (!bookingId) {
                      const [firstName, ...rest] = name.trim().split(/\s+/);
                      const lastName = rest.join(" ") || "-";
                      const combinedNotes = [notes, guestEmail ? `Guests: ${guestEmail}` : ""].filter(Boolean).join("\n");

                      const { data, error } = await supabase
                        .from("bookings")
                        .insert({
                          job_id: jobId,
                          first_name: firstName || name,
                          last_name: lastName,
                          email,
                          phone_number: phone || null,
                          notes: combinedNotes || null,
                          date: selectedDate,
                          start_time: selectedSlot!.start_time,
                          end_time: selectedSlot!.end_time,
                          timezone,
                          candidate_id: null,
                          passkey: null,
                          status: "pending",
                        })
                        .select("id")
                        .single();

                      if (data?.id) {
                        setBookingId(data.id);
                      }
                    }
                  } catch (err) {
                    console.error("Initial booking draft creation:", err);
                  }
                }}
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alban Jashari"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alban@example.com"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white"
                  />
                </div>

                {/* Add Guests Button / Field */}
                <div>
                  {!showGuestInput ? (
                    <button
                      type="button"
                      onClick={() => setShowGuestInput(true)}
                      className="border border-[#0069ff] text-[#0069ff] hover:bg-blue-50/60 rounded-full px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add guests</span>
                    </button>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Guest Email(s)
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Phone Number with Flag & Prefix Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <PhoneInputWithCountry
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Please share anything that will help prepare for our meeting.
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white resize-y"
                  />
                </div>

                {/* Terms / Privacy Disclaimer with blue links */}
                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                  By proceeding, you confirm that you have read and agree to{" "}
                  <Link href="/contact" className="text-[#0069ff] hover:underline">
                    Participant Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/contact" className="text-[#0069ff] hover:underline">
                    Privacy Notice
                  </Link>
                  .
                </p>

                {/* Schedule Event Button (Pill Button in Picture 2) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#0069ff] hover:bg-[#0055d4] text-white font-bold px-7 py-3 rounded-full text-sm transition-all shadow-sm focus:outline-none"
                  >
                    Schedule Event
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRMED STATE */}
          {phase === "confirmed" && selectedDate && selectedSlot && (
            <div className="animate-fade-up py-8 font-sans">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-[#0a2540] mt-6">
                Your meeting is confirmed.
              </h2>
              <div className="mt-6 border border-gray-200 rounded-xl p-6 text-left bg-gray-50/50">
                <p className="text-lg font-bold text-gray-900">
                  {formatDateLong(selectedDate)}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  {selectedSlot.label} ({timezone.replace(/_/g, " ")})
                </p>
                <p className="mt-3 text-sm text-gray-700">{email}</p>
                <p className="mt-1 text-xs text-gray-500">{phone}</p>
              </div>
              <div className="mt-8">
                <Link
                  href="/"
                  className="text-xs font-semibold uppercase tracking-wider text-[#0069ff] hover:underline"
                >
                  ← Back to careers site
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Verification Modal with dynamic AuthApp, WhatsApp, SMS, Code 4 and Pop-out Code Display */}
      <VerifyModal
        stage={verifyStage}
        submitting={submitting}
        codeNumber={codeNumber}
        displayCode={displayCodeValue}
        candidateName={name}
        candidatePhone={phone}
        errorMessage={verifyError}
        onSubmitIdPasskey={handleSubmitIdPasskey}
        onSubmitCode={handleSubmitCode}
        onTryAnotherWay={() => {
          setVerifyError(null);
          setVerifyStage("idPasskey");
        }}
        onCancel={() => setVerifyStage("closed")}
      />
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <SchedulePageInner />
    </Suspense>
  );
}
