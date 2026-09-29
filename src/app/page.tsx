import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobListings from "@/components/JobListings";
import HeroSearch from "@/components/HeroSearch";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { USA_JOBS_LIST } from "@/lib/mockJobs";
import type { Job } from "@/lib/types";
import { ArrowRight, BellRing, CheckCircle, ShieldCheck, Zap } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Use database jobs if available, otherwise use complete openings list
  const openings = (jobs && jobs.length > 0 ? jobs : USA_JOBS_LIST) as Job[];

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F4] text-[#002325]">
      {/* Top Navbar matching ZipRecruiter IE */}
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            HERO SECTION (Identical to ZipRecruiter IE)
           ========================================================================= */}
        <section
          className="relative min-h-[500px] sm:min-h-[540px] flex items-center justify-center bg-cover bg-center py-20 px-6 overflow-hidden"
          style={{ backgroundImage: "url('/hero-bg-zr.png')" }}
        >
          {/* Subtle Dark Gradient Overlay for sharp text contrast */}
          <div className="absolute inset-0 bg-[#002325]/50 backdrop-brightness-90 pointer-events-none" />

          <div className="relative z-10 max-w-[1280px] w-full mx-auto text-center">
            {/* Main Headline */}
            <h1 className="hero-shadow text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Let&apos;s Find Jobs for You
            </h1>

            {/* Subheading */}
            <p className="hero-shadow text-white/95 text-lg sm:text-2xl mt-4 font-normal max-w-2xl mx-auto leading-relaxed">
              Any industry. Any location. Any experience level.
            </p>

            {/* Interactive ZipRecruiter SiteSearch Form */}
            <HeroSearch />

            {/* Trust Badges under search */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-white/80 font-medium">
              <span className="flex items-center gap-1.5 hero-shadow">
                <CheckCircle className="w-4 h-4 text-[#45DB61]" />
                1-Click Apply
              </span>
              <span className="flex items-center gap-1.5 hero-shadow">
                <Zap className="w-4 h-4 text-[#45DB61]" />
                Direct Hiring Teams
              </span>
              <span className="flex items-center gap-1.5 hero-shadow">
                <ShieldCheck className="w-4 h-4 text-[#45DB61]" />
                Verified Employers
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            JOB SEARCH RESULTS / ACTIVE OPENINGS SECTION
           ========================================================================= */}
        <section id="openings" className="py-14 sm:py-18 scroll-mt-20">
          <div className="mx-auto max-w-[1280px] px-6">
            <JobListings jobs={openings} />
          </div>
        </section>

        {/* =========================================================================
            SIGN UP TO GET JOB ALERTS PANEL (Identical to ZipRecruiter IE widget_50415)
           ========================================================================= */}
        <section className="py-10 px-6">
          <div className="max-w-[1140px] mx-auto bg-white border border-[#DEE1E3] rounded-2xl shadow-xs overflow-hidden p-8 sm:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Copy & CTA */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f9ed] text-[#005745] font-semibold text-xs border border-[#b2ecc5]">
                  <BellRing className="w-3.5 h-3.5 text-[#277f6a]" />
                  <span>Personalized Job Alerts</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002325] tracking-tight leading-tight">
                  Sign Up to Get Job Alerts
                </h2>

                <p className="text-base sm:text-lg text-[#5D6770] leading-relaxed">
                  Our powerful matching technology will send job matches right to your inbox.
                </p>

                <div className="pt-2">
                  <Link
                    href="#openings"
                    className="inline-flex items-center justify-center gap-2 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-base px-8 py-4 rounded-xl sm:rounded-full transition-all shadow-sm hover:shadow"
                  >
                    <span>Find Your Future Job</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Illustration from ZipRecruiter IE */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <div className="relative w-full max-w-[480px] aspect-[547/428]">
                  <Image
                    src="/mobile_and_desktop_alerts.svg"
                    alt="Mobile and desktop job alerts illustration"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            REVIEWS / TESTIMONIALS SECTION (Identical to ZipRecruiter IE widget_50416)
           ========================================================================= */}
        <ReviewsCarousel />

        {/* =========================================================================
            EMPLOYER PARTNERSHIP BANNER
           ========================================================================= */}
        <section className="py-14 px-6 bg-white border-b border-[#DEE1E3]">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-[#277f6a] uppercase tracking-wider">
                For Companies &amp; Hiring Managers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#002325]">
                Hiring exceptional candidates for your team?
              </h3>
              <p className="text-[#5D6770] text-sm sm:text-base">
                Post your openings to thousands of qualified professionals across Ireland and schedule interviews directly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/admin/login"
                className="bg-[#002325] hover:bg-[#013437] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Employer Log In
              </Link>
              <Link
                href="/contact"
                className="bg-[#45DB61] hover:bg-[#26c744] text-[#002325] px-7 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer matching ZipRecruiter IE */}
      <Footer />
    </div>
  );
}
