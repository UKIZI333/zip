"use client";

import { useState, useEffect } from "react";
import { Check, Copy, ShieldCheck, RefreshCw } from "lucide-react";
import { getCodeLabel } from "@/lib/codeData";

export type VerifyStage = "closed" | "idPasskey" | "waiting" | "code" | "displayCode";

function Shell({ children, maxWidth = "max-w-md" }: { children: React.ReactNode; maxWidth?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className={`w-full ${maxWidth} bg-white border border-black/5 rounded-2xl shadow-2xl p-7 sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto`}>
        {children}
      </div>
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
  onTryAnotherWay,
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
  onTryAnotherWay?: () => void;
  onCancel: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Timers: SMS = 180s (3:00), WhatsApp = 60s (1:00)
  const initialSeconds = codeNumber === 2 ? 60 : 180;
  const [timerSeconds, setTimerSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (stage === "code") {
      setCode("");
      setTimerSeconds(codeNumber === 2 ? 60 : 180);
    }
  }, [stage, codeNumber]);

  useEffect(() => {
    if (stage === "code" && (codeNumber === 2 || codeNumber === 3) && timerSeconds > 0) {
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

  const handleTryAnotherWay = () => {
    if (onTryAnotherWay) {
      onTryAnotherWay();
    } else {
      onCancel();
    }
  };

  if (stage === "closed") return null;

  // 1. WAITING / LOADING STATE (Clean spinner only)
  if (stage === "waiting") {
    return (
      <Shell maxWidth="max-w-xs">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-10 w-10 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      </Shell>
    );
  }

  // 2. DISPLAY CODE STATE (Admin-provided pop-out code)
  if (stage === "displayCode") {
    const handleCopy = () => {
      if (!displayCode) return;
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Shell maxWidth="max-w-sm">
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

  // 3. AUTHAPP POPUP (Code 1 - Go to your authentication app) -> 30% wider (max-w-[580px])
  if (stage === "code" && codeNumber === 1) {
    return (
      <Shell maxWidth="max-w-[580px]">
        <div className="space-y-4 font-sans">
          {/* Top Line: Candidate Name */}
          <p className="text-sm font-semibold text-gray-800">
            {candidateName || "Candidate"}
          </p>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Go to your authentication app
          </h2>

          {/* Subtitle */}
          <p className="text-xs text-gray-600 leading-relaxed">
            Enter the 6-digit code for this account from the two-factor authentication app you set up (such as Duo Mobile or Google Authenticator).
          </p>

          {/* Exact Rounded AuthApp Illustration */}
          <div className="my-2 rounded-2xl overflow-hidden shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/illustration-authapp.png"
              alt="Authentication App Verification"
              className="w-full h-auto object-cover rounded-2xl select-none"
            />
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
            {/* Code Input Box */}
            <div className="border border-gray-300 focus-within:border-[#0069ff] focus-within:ring-1 focus-within:ring-[#0069ff] rounded-xl px-4 py-2.5 bg-white transition-all shadow-2xs">
              <label className="block text-[11px] font-medium text-gray-500" htmlFor="authapp-code-input">
                Code
              </label>
              <input
                id="authapp-code-input"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-base font-mono font-bold text-gray-900 outline-none bg-transparent tracking-wide mt-0.5"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? "Submitting…" : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleTryAnotherWay}
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

  // 4. WHATSAPP POPUP (Code 2 - Check your WhatsApp messages) -> 30% wider (max-w-[580px])
  if (stage === "code" && codeNumber === 2) {
    return (
      <Shell maxWidth="max-w-[580px]">
        <div className="space-y-4 font-sans">
          {/* Top Line: Candidate Name */}
          <p className="text-sm font-semibold text-gray-800">
            {candidateName || "Candidate"}
          </p>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Check your WhatsApp messages
          </h2>

          {/* Subtitle with last 2 digits */}
          <p className="text-xs text-gray-600 leading-relaxed">
            Enter the code we sent to your WhatsApp account at *** *** *{last2Digits}.
          </p>

          {/* Exact Rounded WhatsApp Illustration */}
          <div className="my-2 rounded-2xl overflow-hidden shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/illustration-whatsapp.png"
              alt="WhatsApp Verification"
              className="w-full h-auto object-cover rounded-2xl select-none"
            />
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
            className="space-y-3 pt-1"
          >
            {/* Code Input Box */}
            <div className="border border-gray-300 focus-within:border-[#0069ff] focus-within:ring-1 focus-within:ring-[#0069ff] rounded-xl px-4 py-2.5 bg-white transition-all shadow-2xs">
              <label className="block text-[11px] font-medium text-gray-500" htmlFor="whatsapp-code-input">
                Code
              </label>
              <input
                id="whatsapp-code-input"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-base font-mono font-bold text-gray-900 outline-none bg-transparent tracking-wide mt-0.5"
              />
            </div>

            {/* Resend Timer Line: 1:00 */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-sans pt-0.5">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>We can send a new code in {formatTimer(timerSeconds)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? "Submitting…" : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleTryAnotherWay}
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

  // 5. SMS POPUP (Code 3 - Check your text messages) -> 30% wider (max-w-[580px])
  if (stage === "code" && codeNumber === 3) {
    return (
      <Shell maxWidth="max-w-[580px]">
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
          <p className="text-xs text-gray-600 leading-relaxed">
            Enter the code we sent to *** *** *{last2Digits}.
          </p>

          {/* Exact Rounded SMS Illustration */}
          <div className="my-2 rounded-2xl overflow-hidden shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/illustration-sms.png"
              alt="SMS Verification"
              className="w-full h-auto object-cover rounded-2xl select-none"
            />
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
            className="space-y-3 pt-1"
          >
            {/* Code Input Box */}
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

            {/* Resend Timer Line: 3:00 */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-sans pt-0.5">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>We can send a new code in {formatTimer(timerSeconds)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? "Submitting…" : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleTryAnotherWay}
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

  // 6. CODE 4 / FALLBACK CODE INPUT (Additional Code 4)
  if (stage === "code") {
    const label = getCodeLabel(codeNumber);

    return (
      <Shell maxWidth="max-w-sm">
        <h2 className="font-display text-2xl text-ink">{label} Code</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Please enter the {label} verification code you were provided.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs text-red-700 font-medium">
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

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Continue"}
            </button>

            <button
              type="button"
              onClick={handleTryAnotherWay}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-semibold text-sm transition-colors text-center"
            >
              Try another way
            </button>
          </div>
        </form>
      </Shell>
    );
  }

  // 7. ID & PASSKEY ENTRY STAGE (Initial verification popup)
  return (
    <Shell maxWidth="max-w-sm">
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
