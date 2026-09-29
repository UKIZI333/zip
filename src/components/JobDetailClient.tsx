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
  Clock,
  Rss,
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
  const [searchLocation, setSearchLocation] = useState("Dublin, Ireland");
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
    : "16 September, 2026";

  const companyName = "Northfield";
  const referenceId = job.id || "195_389961_12855";

  return (
    <div className="min-h-screen bg-[#F2F4F4] text-[#002325]">
      
      {/* =========================================================================
          1. TOP NAVBAR (Thin Dark Spruce Bar with Northfield Logo)
         ========================================================================= */}
      <header className="w-full bg-[#002325] text-white h-14 sm:h-16 flex items-center px-4 sm:px-8 border-b border-[#013437] sticky top-0 z-40">
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          <Logo size="sm" theme="dark" showTagline={false} />
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
      <div className="w-full bg-white border-b border-[#DEE1E3] py-2.5 px-4 shadow-2xs">
        <div className="max-w-[1240px] mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 max-w-[880px] mx-auto"
          >
            {/* Keywords input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5D6770] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Keywords"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-md outline-none focus:border-[#45DB61]"
              />
            </div>

            {/* Location input with clear button */}
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-[#5D6770] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-10 pl-9 pr-8 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-md outline-none focus:border-[#45DB61]"
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
                className="w-full sm:w-auto h-10 px-3 bg-white border border-[#DEE1E3] rounded-md text-sm text-[#002325] flex items-center justify-between gap-2.5 outline-none hover:border-[#5D6770]"
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
              className="h-10 px-6 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-md transition-colors shrink-0 shadow-2xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN BODY (Exact 2-Column Layout from Picture)
         ========================================================================= */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* =====================================================================
              LEFT COLUMN: MAIN JOB DETAILS CARD (White Box)
             ===================================================================== */}
          <div className="lg:col-span-8 bg-white border border-[#DEE1E3] rounded-lg p-6 sm:p-10 shadow-xs">
            
            {/* Posted Date */}
            <p className="text-xs text-[#5D6770] mb-2 font-normal">
              Posted {postedDate}
            </p>

            {/* Job Title */}
            <h1 className="text-2xl sm:text-[28px] md:text-3xl font-extrabold text-[#002325] tracking-tight leading-tight mb-3">
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

            {/* OVERVIEW SECTION */}
            <div className="space-y-3 mb-6">
              <h2 className="text-base font-bold text-[#002325]">
                Overview
              </h2>
              <p className="text-[14px] leading-relaxed text-[#2F3639]">
                {job.short_description ||
                  `Are you an experienced ${job.title} looking for a new challenge? We have an exciting opportunity for someone to deliver BMS system design, for complex projects in the pharmaceutical, food, mission critical, medtech, advanced manufacturing and energy sectors.`}
              </p>
            </div>

            {/* WHO WE ARE SECTION */}
            <div className="space-y-3 mb-6">
              <h2 className="text-base font-bold text-[#002325]">
                Who we are
              </h2>
              <p className="text-[14px] leading-relaxed text-[#2F3639]">
                Northfield is an employee owned, international project delivery firm with a team of 4,000+ people. We are world leaders in the pharma, food, medtech and mission critical sectors. From our network of offices in Europe, Asia and the US, we work with the world&apos;s leading organisations. We are focused on growing a sustainable business centred around our people, our clients and trade partners.
              </p>
            </div>

            {/* RESPONSIBILITIES SECTION */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-base font-bold text-[#002325]">
                  Responsibilities
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-[14px] leading-relaxed text-[#2F3639]">
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
                  Qualifications
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-[14px] leading-relaxed text-[#2F3639]">
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
              <p className="text-[14px] leading-relaxed text-[#2F3639]">
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
              RIGHT COLUMN: SIDEBAR CARDS
             ===================================================================== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD 1: APPLY TO THIS JOB */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-5 shadow-xs">
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                className="w-full bg-[#45DB61] hover:bg-[#26c744] active:bg-[#1a862e] text-[#002325] font-bold text-[15px] py-3.5 px-6 rounded-lg transition-colors text-center shadow-xs cursor-pointer"
              >
                Apply to this Job
              </button>
            </div>

            {/* CARD 2: SHARE THIS JOB (Exact 4 Black Square Icons from Picture) */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-5 shadow-xs">
              <h3 className="text-base font-bold text-[#002325] mb-3.5">
                Share this Job
              </h3>
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleShare("facebook")}
                  className="w-10 h-10 bg-[#1C1C1C] hover:bg-[#333] text-white rounded flex items-center justify-center transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.504 2 12.06c0 5.023 3.656 9.185 8.437 9.94v-7.03H7.9v-2.91h2.538V9.844c0-2.521 1.493-3.915 3.778-3.915 1.093 0 2.238.197 2.238.197v2.476h-1.262c-1.242 0-1.628.776-1.628 1.572v1.887h2.773l-.443 2.908h-2.33V22C18.344 21.245 22 17.083 22 12.06Z" />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleShare("linkedin")}
                  className="w-10 h-10 bg-[#1C1C1C] hover:bg-[#333] text-white rounded flex items-center justify-center transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </button>

                {/* X (Twitter) */}
                <button
                  type="button"
                  onClick={() => handleShare("twitter")}
                  className="w-10 h-10 bg-[#1C1C1C] hover:bg-[#333] text-white rounded flex items-center justify-center transition-colors"
                  aria-label="Share on X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* RSS / Copy Link */}
                <button
                  type="button"
                  onClick={() => handleShare("rss")}
                  className="w-10 h-10 bg-[#1C1C1C] hover:bg-[#333] text-white rounded flex items-center justify-center transition-colors relative"
                  aria-label="Copy link / RSS"
                >
                  {copiedLink ? (
                    <Check className="w-5 h-5 text-[#45DB61]" />
                  ) : (
                    <Rss className="w-5 h-5" />
                  )}
                </button>
              </div>
              {copiedLink && (
                <p className="text-xs text-[#005745] font-semibold mt-2 animate-fade-up">
                  Job link copied to clipboard!
                </p>
              )}
            </div>

            {/* CARD 3: MORE FROM NORTHFIELD */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-5 shadow-xs">
              <h3 className="text-base font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                More from Northfield
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {moreJobs.map((mJob) => (
                  <div key={mJob.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <Link
                      href={`/jobs/${mJob.slug}`}
                      className="text-sm font-bold text-[#002325] hover:text-[#005745] underline leading-snug block"
                    >
                      {mJob.title}
                    </Link>
                    <p className="text-xs text-[#5D6770] font-medium">
                      Northfield
                    </p>
                    <p className="text-xs text-[#5D6770] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5D6770] shrink-0" />
                      <span className="truncate">{mJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: SIMILAR JOBS */}
            <div className="bg-white border border-[#DEE1E3] rounded-lg p-5 shadow-xs">
              <h3 className="text-base font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                Similar Jobs
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {similarJobs.map((sJob) => (
                  <div key={sJob.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <Link
                      href={`/jobs/${sJob.slug}`}
                      className="text-sm font-bold text-[#002325] hover:text-[#005745] underline leading-snug block"
                    >
                      {sJob.title}
                    </Link>
                    <p className="text-xs text-[#5D6770] font-medium">
                      {sJob.department || "Northfield Partner"}
                    </p>
                    <p className="text-xs text-[#5D6770] flex items-center gap-1">
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
