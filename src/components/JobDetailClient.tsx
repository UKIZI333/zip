"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import ApplyModal from "./ApplyModal";
import Footer from "./Footer";
import type { Job } from "@/lib/types";
import {
  Check,
  Mail,
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

  // Job alert state
  const [alertEmail, setAlertEmail] = useState("");
  const [alertKeywords, setAlertKeywords] = useState("");
  const [alertLocation, setAlertLocation] = useState("Pristina");
  const [alertCreated, setAlertCreated] = useState(false);

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

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) return;
    setAlertCreated(true);
    setTimeout(() => {
      setAlertCreated(false);
      setAlertEmail("");
    }, 4000);
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
        `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const postedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "28 September, 2026";

  const companyName = job.department?.includes("Social")
    ? "Liquid Personnel"
    : "Northfield";
  const referenceId = job.id || "102_768010_7978319003";

  // Real "More from Company" list from inspect code
  const companyJobsList = [
    { title: "Social Care Worker", location: "Laois", slug: "social-care-worker-laois" },
    { title: "Social Care Worker", location: "Wexford", slug: "social-care-worker-wexford" },
    { title: "Social Care Worker", location: "Athlone", slug: "social-care-worker-athlone" },
    { title: "Social Care Leader", location: "Cavan", slug: "social-care-leader-cavan" },
    { title: "Deputy Manager - Children's Residential", location: "Cavan", slug: "deputy-manager-childrens-residential-cavan" },
  ];

  // Real "Similar Jobs" list from inspect code
  const similarJobsList = [
    { title: "Social Care Worker - Children's Residential", company: "Liquid Personnel", location: "Limerick" },
    { title: "Social Care Worker - Children's Residential Services", company: "TTM Healthcare Solutions", location: "Monaghan, Monaghan" },
    { title: "Social Care Worker - Children's Residential - Mainstream - Limerick", company: "TTM Healthcare Solutions", location: "Limerick, Limerick" },
    { title: "Social Care Worker - Children's Residential Services - Mainstream", company: "TTM Healthcare Solutions", location: "Donegal, Donegal" },
    { title: "Children's Residential Social Care Worker", company: "Liquid Personnel", location: "Cork" },
  ];

  // Real "Latest Jobs" list from inspect code
  const latestJobsList = [
    { title: "Senior Civil Engineer", company: "Uniting Holding", location: "Dublin, L, IE" },
    { title: "Clinical Nurse Specialist - Oncology", company: "Hollybank Trustees Ltd", location: "Lucan, L, IE" },
    { title: "VP of Delivery", company: "Teleperformance", location: "Swords, L, IE" },
    { title: "Quality Expert Reviewer - French Speaker", company: "Teleperformance", location: "D03, L, IE" },
    { title: "Principal Engineer - Water", company: "Fehily Timoney & Company Ltd.", location: "Carlow, L, IE" },
  ];

  return (
    <div className="has-stickyNav jobs-show min-h-screen bg-[#F2F4F4] text-[#002325]">
      
      {/* =========================================================================
          1. TOP NAVBAR (<nav class="navbar navbar-default"> Exactly Aligned with Card)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#002325] text-white border-b border-[#013437]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-6 h-[84px] flex items-center">
          
          {/* Navbar Header (Logo aligned exactly with left edge of Main Card) */}
          <div className="flex items-center">
            <Logo size="md" theme="dark" showTagline={false} />
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. SEARCH BAR SUBHEADER (<section class="results-hero"> CENTERED IN MIDDLE)
         ========================================================================= */}
      <section className="results-hero w-full bg-white border-b border-[#DEE1E3] py-3.5 px-4 shadow-2xs">
        <div className="max-w-[1170px] mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 max-w-[760px] mx-auto"
          >
            {/* Keywords input (Clean magnifying glass icon) */}
            <div className="relative w-full sm:w-[240px]">
              <svg className="w-4 h-4 text-[#5D6770] fill-current absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 32 32">
                <path d="M30.976 28.608l-9.984-9.984a11.16 11.16 0 0 0 2.24-6.72c0-6.272-5.056-11.328-11.328-11.328S.512 5.632.512 11.904 5.568 23.232 11.84 23.232c2.496 0 4.8-.832 6.72-2.24l9.984 9.984c.256.256.704.448 1.152.448s.768-.192 1.088-.32l.128-.128c.704-.64.704-1.728.064-2.368zM11.84 19.776c-4.352 0-7.872-3.52-7.872-7.872s3.52-7.872 7.872-7.872c4.416 0 7.872 3.456 7.872 7.872 0 4.288-3.52 7.872-7.872 7.872z" />
              </svg>
              <input
                type="text"
                placeholder="Keywords"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="w-full h-[46px] pl-10 pr-8 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-[4px] outline-none focus:border-[#45DB61]"
              />
              {searchKeywords && (
                <button
                  type="button"
                  onClick={() => setSearchKeywords("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5D6770] hover:text-[#002325]"
                  aria-label="Clear Keywords"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 15.6 15.6">
                    <path d="M6.4 7.8L0 14.1l1.4 1.4 6.4-6.4 6.4 6.4 1.4-1.4-6.4-6.3 6.4-6.4L14.1 0 7.8 6.4 1.4 0 0 1.4l6.4 6.4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Location input with pin icon and clear button */}
            <div className="relative w-full sm:w-[240px]">
              <svg className="w-3.5 h-4.5 text-[#5D6770] fill-current absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 14 20">
                <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C5.6 9.5 4.5 8.4 4.5 7S5.6 4.5 7 4.5 9.5 5.6 9.5 7 8.4 9.5 7 9.5z" />
              </svg>
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-[46px] pl-9 pr-8 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-[4px] outline-none focus:border-[#45DB61]"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => setSearchLocation("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5D6770] hover:text-[#002325]"
                  aria-label="Clear Location"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 15.6 15.6">
                    <path d="M6.4 7.8L0 14.1l1.4 1.4 6.4-6.4 6.4 6.4 1.4-1.4-6.4-6.3 6.4-6.4L14.1 0 7.8 6.4 1.4 0 0 1.4l6.4 6.4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Distance Dropdown (Exact properly sized 16px GPS Crosshair Target icon) */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDistanceOpen(!distanceOpen)}
                className="w-full sm:w-[130px] h-[46px] px-3 bg-white border border-[#DEE1E3] rounded-[4px] text-sm text-[#002325] flex items-center justify-between gap-2 outline-none hover:border-[#5D6770]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Fixed 16px size for GPS crosshair icon */}
                  <svg className="w-4 h-4 text-[#5D6770] fill-current shrink-0" viewBox="0 0 20 20">
                    <path d="M10 16c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm0 2c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
                    <path d="M9 0h2v6H9V0zm5 11V9h6v2h-6zm-5 3h2v6H9v-6zm-9-3V9h6v2H0z" />
                  </svg>
                  <span className="truncate" style={{ textTransform: "none" }}>{selectedDistance}</span>
                </div>
                <svg className="w-2.5 h-2 text-[#5D6770] fill-current shrink-0" viewBox="0 0 9.9 6.4">
                  <path d="M4.9 3.5L1.4 0 0 1.4l4.2 4.2.7.7 4.9-4.9L8.5 0 4.9 3.5z" />
                </svg>
              </button>

              {distanceOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#DEE1E3] rounded-[4px] shadow-lg py-1.5 z-50">
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

            {/* Search Button (btn-success btn-lg 46px tall) */}
            <button
              type="submit"
              className="h-[46px] px-6 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-[4px] transition-colors shrink-0 shadow-2xs"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================================
          3. MAIN CONTENT: 2-COLUMN GRID (Left Card starts in line with logo & is wider)
         ========================================================================= */}
      <main id="main" className="page-content max-w-[1170px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* =====================================================================
              LEFT COLUMN (col-md-9 ~75% width, WIDER: Title stays on single line)
             ===================================================================== */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* PANEL: JOB DETAIL MAIN CARD */}
            <div className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-6 sm:p-8 shadow-2xs">
              
              {/* Posted Date */}
              <div className="text-xs text-[#5D6770] mb-2 font-normal">
                <span>Posted {postedDate}</span>
              </div>

              {/* Job Title & Header Intro (Title stays on single line) */}
              <div className="jobDetail-header mb-4">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#002325] tracking-tight leading-[1.25] mb-2.5">
                  {job.title}
                </h1>

                <div className="space-y-1.5">
                  <div className="text-[#005745] font-bold text-base hover:underline cursor-pointer">
                    {companyName}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#002325] font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 fill-current text-[#002325]" viewBox="0 0 14 20">
                        <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C5.6 9.5 4.5 8.4 4.5 7S5.6 4.5 7 4.5 9.5 5.6 9.5 7 8.4 9.5 7 9.5z" />
                      </svg>
                      {job.location}
                    </span>

                    <span className="flex items-center gap-1.5 text-[#5D6770]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5L8 7.5V4h8v3.5l-4 4z" />
                      </svg>
                      {job.employment_type || "Full Time"}
                    </span>
                  </div>

                  <div className="text-xs text-[#5D6770] pt-1">
                    <span className="font-semibold">Reference:</span> {referenceId}
                  </div>
                </div>
              </div>

              {/* Hairline Divider */}
              <hr className="border-t border-[#DEE1E3] my-5" />

              {/* Job Body (Tighter line-height 1.45, richer bolder text font-[450]) */}
              <div className="job-body text-[15px] sm:text-[16px] leading-[1.45] text-[#002325] font-[450] space-y-3">
                <div style={{ textAlign: "justify" }}>
                  {job.short_description || job.description}
                </div>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <p style={{ textAlign: "justify" }} className="font-bold text-[#002325] mt-3 mb-1.5">
                      Key Responsibilities
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5" style={{ textAlign: "justify" }}>
                      {job.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <p style={{ textAlign: "justify" }} className="font-bold text-[#002325] mt-3 mb-1.5">
                      Qualifications and Requirements
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5" style={{ textAlign: "justify" }}>
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p style={{ textAlign: "justify" }} className="font-bold text-[#002325] mt-3 mb-1.5">
                    What the Role Offers
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ textAlign: "justify" }}>
                    <li>Opportunity to contribute to a new residential service and help shape its culture from the outset.</li>
                    <li>Supportive team environment with access to training and professional development.</li>
                    <li>Meaningful work that makes a positive difference in the lives of young people.</li>
                  </ul>
                </div>

                <div>
                  <p style={{ textAlign: "justify" }} className="font-bold text-[#002325] mt-3 mb-1.5">
                    Reasonable Adjustments:
                  </p>
                  <p style={{ textAlign: "justify" }}>
                    If you consider yourself to have a disability or require any reasonable adjustment during the recruitment process or within the workplace, please highlight this at the earliest opportunity by contacting our team.
                  </p>
                  <p className="mt-2 text-xs text-[#5D6770]" style={{ textAlign: "justify" }}>
                    We are unable to support or accept applications from candidates who are residents within the Red or Amber list of the World Health Organisation (WHO) Workforce Support and Safeguard List.
                  </p>
                  <p className="mt-2 text-xs text-[#5D6770]">
                    BH - 202116<br />GH - 36050
                  </p>
                </div>
              </div>

              {/* Panel Footer (Apply Button) */}
              <div className="panel-footer mt-6 pt-5 border-t border-[#DEE1E3]">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="apply-button btn btn-success btn-lg h-[46px] px-8 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-base rounded-[4px] transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
                >
                  Apply to this Job
                </button>
              </div>

            </div>

            {/* PANEL: JOB ALERTS COMPONENT */}
            <div id="job-alert-component" className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-6 shadow-2xs">
              <h3 className="text-lg font-bold text-[#002325] mb-4">
                Sign up for Job Alerts
              </h3>
              
              {alertCreated ? (
                <div className="bg-[#45DB61]/20 border border-[#45DB61] text-[#005745] font-bold p-4 rounded-[4px] text-sm animate-fade-up">
                  ✓ Success! Job alerts configured for {alertEmail}. You will receive instant notifications for new matching roles.
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="w-full h-10 px-3.5 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-[4px] outline-none focus:border-[#45DB61]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Keywords"
                      value={alertKeywords}
                      onChange={(e) => setAlertKeywords(e.target.value)}
                      className="w-full h-10 px-3.5 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-[4px] outline-none focus:border-[#45DB61]"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={alertLocation}
                      onChange={(e) => setAlertLocation(e.target.value)}
                      className="w-full h-10 px-3.5 text-sm text-[#002325] placeholder:text-[#5D6770] bg-white border border-[#DEE1E3] rounded-[4px] outline-none focus:border-[#45DB61]"
                    />
                  </div>

                  <p className="text-[11px] text-[#5D6770] leading-relaxed">
                    By clicking Create Alert, you agree to the <Link href="/terms" className="text-[#005745] hover:underline">Global Terms of Use Agreement</Link> and acknowledge that you have read and understand the <Link href="/privacy" className="text-[#005745] hover:underline">Global Privacy Policy</Link>.
                  </p>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-4 h-4" />
                    Create Alert
                  </button>
                </form>
              )}
            </div>

            {/* PANEL: LATEST JOBS */}
            <div className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-6 shadow-2xs">
              <h3 className="text-lg font-bold text-[#002325] mb-4">
                Latest Jobs
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {latestJobsList.map((lJob, index) => (
                  <div key={index} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <Link
                      href="/#openings"
                      className="text-sm font-bold text-[#002325] hover:text-[#005745] underline leading-snug block"
                    >
                      {lJob.title}
                    </Link>
                    <p className="text-xs text-[#5D6770] font-medium">
                      {lJob.company}
                    </p>
                    <p className="text-xs text-[#5D6770] flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#5D6770] fill-current" viewBox="0 0 14 20">
                        <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C5.6 9.5 4.5 8.4 4.5 7S5.6 4.5 7 4.5 9.5 5.6 9.5 7 8.4 9.5 7 9.5z" />
                      </svg>
                      <span>{lJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* =====================================================================
              RIGHT COLUMN: COMPACT SIDEBAR (~260px Width matching ZipRecruiter col-md-3)
             ===================================================================== */}
          <div className="w-full lg:w-[260px] shrink-0 space-y-4">
            
            {/* PANEL 1: APPLY TO THIS JOB SIDEBAR */}
            <div className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-3.5 sm:p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                className="w-full h-11 bg-[#45DB61] hover:bg-[#26c744] active:bg-[#1a862e] text-[#002325] font-bold text-sm rounded-[4px] transition-colors flex items-center justify-center text-center shadow-xs cursor-pointer"
              >
                Apply to this Job
              </button>
            </div>

            {/* PANEL 2: SHARE THIS JOB (Exact 46px Square Icons from original) */}
            <div className="panel panel-default panel-expand share-social bg-white border border-[#DEE1E3] rounded-[4px] p-3.5 sm:p-4 shadow-2xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3">
                Share this Job
              </h3>
              
              <div className="flex items-center justify-between gap-2">
                
                {/* Facebook Square Icon (fa-facebook-square 46px square) */}
                <button
                  type="button"
                  onClick={() => handleShare("facebook")}
                  className="w-[46px] h-[46px] bg-[#002325] hover:bg-[#013437] text-white rounded-[4px] flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                    <path d="M9.5 3H12V0H9.5C7.57 0 6 1.57 6 3.5V5H4v3h2v8h3V8h2.5l.5-3H9V3.5c0-.271.229-.5.5-.5z" />
                  </svg>
                </button>

                {/* LinkedIn Square Icon (fa-linkedin-square 46px square) */}
                <button
                  type="button"
                  onClick={() => handleShare("linkedin")}
                  className="w-[46px] h-[46px] bg-[#002325] hover:bg-[#013437] text-white rounded-[4px] flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                    <path d="M6 6h2.767v1.418h.04C9.192 6.727 10.134 6 11.539 6 14.46 6 15 7.818 15 10.183V15h-2.885v-4.27c0-1.018-.021-2.329-1.5-2.329-1.502 0-1.732 1.109-1.732 2.255V15H6V6zM1 6h3v9H1V6zM4 3.5a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 4 3.5z" />
                  </svg>
                </button>

                {/* Twitter/X Square Icon (twitter-square 46px square) */}
                <button
                  type="button"
                  onClick={() => handleShare("twitter")}
                  className="w-[46px] h-[46px] bg-[#002325] hover:bg-[#013437] text-white rounded-[4px] flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Share on X"
                  title="Share on X"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* RSS Square Icon (fa-rss-square 46px square) */}
                <button
                  type="button"
                  onClick={() => handleShare("rss")}
                  className="w-[46px] h-[46px] bg-[#002325] hover:bg-[#013437] text-white rounded-[4px] flex items-center justify-center transition-colors shadow-2xs relative"
                  aria-label="RSS Feed"
                  title="Copy link / RSS"
                >
                  {copiedLink ? (
                    <Check className="w-5 h-5 text-[#45DB61]" />
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 100 100">
                      <circle cx="24.512" cy="75.486" r="8.997" />
                      <path d="M15.519 39.506v11.992c18.186 0 32.983 14.797 32.983 32.984h11.994c0-24.8-20.182-44.976-44.977-44.976z" />
                      <path d="M15.519 15.518v11.994c31.413 0 56.968 25.556 56.968 56.971h11.995c-.001-38.027-30.936-68.965-68.963-68.965z" />
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

            {/* PANEL 3: MORE FROM COMPANY (<div id="other_employer_jobs">) */}
            <div id="other_employer_jobs" className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-3.5 sm:p-4 shadow-2xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                More from {companyName}
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {companyJobsList.map((mJob, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-xs font-bold text-[#002325] hover:text-[#005745] underline leading-tight block"
                    >
                      {mJob.title}
                    </Link>
                    <p className="text-[11px] text-[#5D6770] font-medium">
                      {companyName}
                    </p>
                    <p className="text-[11px] text-[#5D6770] flex items-center gap-1">
                      <svg className="w-2.5 h-3 text-[#5D6770] fill-current" viewBox="0 0 14 20">
                        <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C5.6 9.5 4.5 8.4 4.5 7S5.6 4.5 7 4.5 9.5 5.6 9.5 7 8.4 9.5 7 9.5z" />
                      </svg>
                      <span className="truncate">{mJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL 4: SIMILAR JOBS (<div id="similar_jobs">) */}
            <div id="similar_jobs" className="panel panel-default panel-expand bg-white border border-[#DEE1E3] rounded-[4px] p-3.5 sm:p-4 shadow-2xs">
              <h3 className="text-sm font-bold text-[#002325] mb-3 pb-2 border-b border-[#DEE1E3]">
                Similar Jobs
              </h3>
              <div className="divide-y divide-[#DEE1E3]">
                {similarJobsList.map((sJob, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-xs font-bold text-[#002325] hover:text-[#005745] underline leading-tight block"
                    >
                      {sJob.title}
                    </Link>
                    <p className="text-[11px] text-[#5D6770] font-medium">
                      {sJob.company}
                    </p>
                    <p className="text-[11px] text-[#5D6770] flex items-center gap-1">
                      <svg className="w-2.5 h-3 text-[#5D6770] fill-current" viewBox="0 0 14 20">
                        <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C5.6 9.5 4.5 8.4 4.5 7S5.6 4.5 7 4.5 9.5 5.6 9.5 7 8.4 9.5 7 9.5z" />
                      </svg>
                      <span className="truncate">{sJob.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* =========================================================================
          4. UNIVERSAL FOOTER
         ========================================================================= */}
      <Footer />

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
