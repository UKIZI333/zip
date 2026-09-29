"use client";

import { useState } from "react";
import { Send, ShieldCheck, Clock, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import ApplyModal from "./ApplyModal";

interface JobApplyActionProps {
  job: {
    id?: string;
    title: string;
    slug?: string;
    department?: string;
    location?: string;
    compensation?: string;
  };
}

export default function JobApplyAction({ job }: JobApplyActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sticky top-24 p-6 rounded-2xl border rule-hairline bg-paperdim/40 space-y-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brass/15 text-brass font-bold mb-2">
            Executive Search
          </div>
          <h3 className="font-display text-xl text-ink font-semibold">
            Apply for Position
          </h3>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Submit your resume and background. Shortlisted candidates receive an exclusive calendar invitation for a private screening.
          </p>
        </div>

        <div className="space-y-2.5 pt-2 border-t rule-hairline text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brass shrink-0" />
            <span>Curated 48-hour talent review</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brass shrink-0" />
            <span>Strictly confidential candidacy</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brass shrink-0" />
            <span>Direct partner interview if selected</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-[#45DB61] hover:bg-[#26c744] text-[#002325] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#002325]" />
          <span>Apply with CV (1-Click)</span>
        </button>

        <div className="text-center">
          <a
            href="/contact"
            className="text-[11px] font-mono text-muted hover:text-ink transition-colors"
          >
            Have specific questions? Contact our team
          </a>
        </div>
      </div>

      <ApplyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        job={job}
      />
    </>
  );
}
