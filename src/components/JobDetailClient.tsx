"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import ApplyModal from "./ApplyModal";
import type { Job } from "@/lib/types";
import {
  Search,
  MapPin,
  Navigation,
  ChevronDown,
  X,
  Hourglass,
  Check,
} from "lucide-react";

interface JobDetailClientProps {
  job: Job;
  moreJobs: Job[];
  similarJobs: Job[];
}

export default function JobDetailClient({
  job,
  moreJobs,
  similarJobs,
}: JobDetailClientProps) {
  const router = useRouter();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("Pristina");
  const [distanceOpen, setDistanceOpen] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState("Distance");
  const [copiedLink, setCopiedLink] = useState(false);

  const distanceOptions = [
    "5 Kilometres",
    "10 Kilometres",
    "20 Kilometres",
    "50 Kilometres",
    "100 Kilometres",
    "Any",
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/#openings`);
  };

  const handleShare = (network: string) => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = `${job.title} at Northfield`;

    if (network === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (network === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (network === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Format posted date
  const postedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "28 September, 2026";

  const companyName = job.department?.includes("Social") ? "Liquid Personnel" : "Northfield";
  const referenceId = job.id || "102_768010_7978319003";

  return (
    <div className="min-h-screen bg-[#F2F4F4] text-[#002325]">
      
      {/* =========================================================================
          1. TOP NAVBAR (Taller / Widther Dark Spruce Header Bar matching ZipRecruiter)
         ========================================================================= */}
      <header className="w-full bg-[#002325] text-white h-24 flex items-center px-6 sm:px-12 border-b border-[#013437] sticky top-0 z-40">
        <div className="max-w-[1140px] w-full mx-auto flex items-center justify-between">
          <Logo size="md" theme="dark" showTagline={false} />
          <Link
            href="/#openings"
            className="text-xs sm:text-sm text-white/80 hover:text-[#45DB61] font-medium transition-colors"
          >
            ← Back to Job Search
          </Link>
        </div>
      </header>

      {/* =========================================================================
          2. SEARCH BAR SUBHEADER (White Background Strip Matching Picture)
         ========================================================================= */}
      <div className="w-full bg-white border-b border-[#DEE1E3] py-3.5 px-4 shadow-2xs">
        <div className="max-w-[1140px] mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 max-w-[860px] mx-auto"
          >
            {/* Keywords input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5D6770] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Keywords"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="w-full h-10.5 pl-10 pr-3 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#5D6770]/40 rounded-md outline-none focus:border-[#45DB61]"
              />
            </div>

            {/* Location input with clear button */}
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-[#5D6770] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-10.5 pl-10 pr-8 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#5D6770]/40 rounded-md outline-none focus:border-[#45DB61]"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => setSearchLocation("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5D6770] hover:text-[#002325]"
                  aria-label="Clear location"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Distance Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDistanceOpen(!distanceOpen)}
                className="w-full sm:w-auto h-10.5 px-3.5 bg-white border border-[#5D6770]/40 rounded-md text-sm text-[#002325] flex items-center justify-between gap-2.5 outline-none hover:border-[#5D6770]"
              >
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#5D6770]" />
                  <span>{selectedDistance}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#5D6770]" />
              </button>

              {distanceOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#DEE1E3] rounded-md shadow-lg py-1.5 z-50">
                  {distanceOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedDistance(opt);
                        setDistanceOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs ${
                        selectedDistance === opt
                          ? "bg-[#F2F4F4] text-[#005745] font-bold"
                          : "text-[#002325] hover:bg-[#F2F4F4]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="h-10.5 px-6.5 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-md transition-colors shrink-0 shadow-2xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN BODY (Exact 2-Column Layout matching Picture: Narrower Side Panel)
         ========================================================================= */}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* =====================================================================
              LEFT COLUMN: MAIN JOB DETAILS CARD (Wider ~76% width)
             ===================================================================== */}
          <div className="flex-1 min-w-0 bg-white border border-[#DEE1E3] rounded-lg p-6 sm:p-10 shadow-xs">
            
            {/* Posted Date */}
            <p className="text-xs text-[#5D6770] mb-2.5 font-normal">
              Posted {postedDate}
            </p>

            {/* Job Title */}
            <h1 className="text-2xl sm:text-[28px] md:text-[30px] font-extrabold text-[#002325] tracking-tight leading-[1.2] mb-3">
              {job.title}
            </h1>

            {/* Company Name (Dark Green / Teal) */}
            <div className="mb-2">
              <span className="text-[#005745] font-bold text-base hover:underline cursor-pointer">
                {companyName}
              </span>
            </div>

            {/* Meta Information Line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#002325] font-medium mb-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#002325]" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-[#002325]" />
                {job.employment_type || "Full Time"}
              </span>
              <span className="text-[#5D6770]">
                Reference: {referenceId}
              </span>
            </div>

            {/* Horizontal Line */}
            <hr className="border-t border-[#DEE1E3] my-6" />

            {/* OVERVIEW / DESCRIPTION */}
            <div className="space-y-3 mb-6">
              <p className="text-[15px] leading-[1.65] text-[#2F3639]">
                {job.short_description || job.description}
              </p>
            </div>

            {/* RESPONSIBILITIES SECTION */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-base font-bold text-[#002325]">
                  Key Responsibilities
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-[14px] sm:text-[15px] leading-[1.6] text-[#2F3639]">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* QUALIFICATIONS / REQUIREMENTS SECTION */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-base font-bold text-[#002325]">
                  Qualifications and Requirements
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-[14px] sm:text-[15px] leading-[1.6] text-[#2F3639]">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* WHY NORTHFIELD? SECTION */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-bold text-[#002325]">
                Why Northfield?
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#2F3639]">
                As an employee-owned company, we are inclusive, committed and driven. Corporate Responsibility and Sustainability are at the heart of our strategy. Candidates enjoy direct communication, rapid 48-hour feedback, and top-tier career advancement opportunities.
              </p>
            </div>

            {/* BOTTOM APPLY BUTTON */}
            <div className="mt-8 pt-6 border-t border-[#DEE1E3]">
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-base py-3.5 px-8 rounded-lg transition-all shadow-xs"
              >
                Apply to this Job
              </button>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: NARROWER SIDEBAR CARDS (~250px Width Matching Picture)
             ===================================================================== */}
          <div className="w-full lg:w-[250px] shrink-0 space-y-4">
            
            {/* BUTTON 1: APPLY TO THIS JOB (Standalone green button directly on background, exactly matching picture) */}
            <button
              type="button"
              onClick={() => setApplyModalOpen(true)}
              className="w-full h-11 bg-[#45DB61] hover:bg-[#26c744] active:bg-[#1a862e] text-[#002325] font-bold text-sm rounded-lg transition-colors flex items-center justify-center text-center shadow-xs cursor-pointer"
            >
              Apply to this Job
            </button>

            {/* CARD 2: SHARE THIS JOB (Bigger, Exact 4 Square Icons from Picture) */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-3.5 sm:p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3">
                Share this Job
              </h3>
              <div className="flex items-center justify-between gap-2">
                
                {/* Facebook (Large Square Button with Classic 'f') */}
                <button
                  type="button"
                  onClick={() => handleShare("facebook")}
                  className="w-12 h-12 bg-[#002325] hover:bg-[#013437] text-white rounded-md flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M14.5 8H17V4h-3.5C10.5 4 9 5.5 9 8.5V11H6v4h3v8h5v-8h3.5l.5-4H14V8.5c0-.6.4-1 .5-1z" />
                  </svg>
                </button>

                {/* LinkedIn (Large Square Button with Classic 'in') */}
                <button
                  type="button"
                  onClick={() => handleShare("linkedin")}
                  className="w-12 h-12 bg-[#002325] hover:bg-[#013437] text-white rounded-md flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M6.5 9.5H3V21h3.5V9.5zM4.75 4a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM21 14.5c0-3.5-1.9-5-4.5-5-2.1 0-3 1.2-3.5 2V9.5H9.5V21H13v-6c0-1.6.8-2.5 2-2.5 1.3 0 2 .9 2 2.5v6H21v-6.5z" />
                  </svg>
                </button>

                {/* X / Twitter (Large Square Button with '𝕏') */}
                <button
                  type="button"
                  onClick={() => handleShare("twitter")}
                  className="w-12 h-12 bg-[#002325] hover:bg-[#013437] text-white rounded-md flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on X"
                  title="Share on X"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* RSS Feed (Large Square Button with Broadcast Waves) */}
                <button
                  type="button"
                  onClick={() => handleShare("rss")}
                  className="w-12 h-12 bg-[#002325] hover:bg-[#013437] text-white rounded-md flex items-center justify-center transition-colors shadow-2xs relative"
                  aria-label="RSS Feed"
                  title="Copy link / RSS"
                >
                  {copiedLink ? (
                    <Check className="w-6 h-6 text-[#45DB61]" />
                  ) : (
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <circle cx="5" cy="19" r="2.5" />
                      <path d="M4 10.5v3.5c4.7 0 8.5 3.8 8.5 8.5h3.5C16 15.9 10.6 10.5 4 10.5z" />
                      <path d="M4 4v3.5c8.3 0 15 6.7 15 15H22.5C22.5 12.3 14.2 4 4 4z" />
                    </svg>
                  )}
                </button>
              </div>
              {copiedLink && (
                <p className="text-[11px] text-[#005745] font-semibold mt-2 text-center animate-fade-up">
                  Job link copied!
                </p>
              )}
            </div>

            {/* CARD 3: MORE FROM COMPANY */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-3.5 sm:p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                More from {companyName}
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {moreJobs.slice(0, 4).map((mJob) => (
                  <div key={mJob.id} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                    <Link
                      href={`/jobs/${mJob.slug}`}
                      className="text-xs font-bold text-[#002325] hover:text-[#005745] underline leading-tight block"
                    >
                      {mJob.title}
                    </Link>
                    <p className="text-[11px] text-[#5D6770] font-medium">
                      {companyName}
                    </p>
                    <p className="text-[11px] text-[#5D6770] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5D6770] shrink-0" />
                      <span className="truncate">{mJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: SIMILAR JOBS */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-3.5 sm:p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                Similar Jobs
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {similarJobs.slice(0, 4).map((sJob) => (
                  <div key={sJob.id} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                    <Link
                      href={`/jobs/${sJob.slug}`}
                      className="text-xs font-bold text-[#002325] hover:text-[#005745] underline leading-tight block"
                    >
                      {sJob.title}
                    </Link>
                    <p className="text-[11px] text-[#5D6770] font-medium">
                      {sJob.department || "Northfield Partner"}
                    </p>
                    <p className="text-[11px] text-[#5D6770] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5D6770] shrink-0" />
                      <span className="truncate">{sJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Interactive Application Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={{
          id: job.id,
          title: job.title,
          slug: job.slug,
          department: job.department,
          location: job.location,
          compensation: job.benefits?.[0] || "Competitive",
        }}
      />
    </div>
  );
}
