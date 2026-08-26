"use client";

import { useState } from "react";

export type VerifyStage = "closed" | "idPasskey" | "waiting" | "code";

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
  errorMessage,
  onSubmitIdPasskey,
  onSubmitCode,
  onCancel,
}: {
  stage: VerifyStage;
  submitting: boolean;
  codeNumber?: number;
  errorMessage: string | null;
  onSubmitIdPasskey: (candidateId: string, passkey: string) => void;
  onSubmitCode: (code: string) => void;
  onCancel: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");

  if (stage === "closed") return null;

  if (stage === "waiting") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-6">
          <div className="h-10 w-10 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      </Shell>
    );
  }

  if (stage === "code") {
    return (
      <Shell>
        <h2 className="font-display text-2xl text-ink">Additional Code {codeNumber}</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Please enter the Additional Code {codeNumber} you were provided.
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
              Additional Code {codeNumber}
            </label>
            <input
              id="additional-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Enter Additional Code ${codeNumber}`}
              className="mt-2 w-full border-b-2 rule-hairline bg-transparent py-2 text-ink outline-none focus:border-brass transition-colors"
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
