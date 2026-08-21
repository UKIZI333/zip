import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobListings from "@/components/JobListings";
import type { Job } from "@/lib/types";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  Award,
  Clock,
  CheckCircle2,
  Quote,
} from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const openings = (jobs ?? []) as Job[];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-brass selection:text-paper">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28 border-b rule-hairline bg-gradient-to-b from-paperdim/40 via-paper to-paper">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              {/* Hiring Badge */}
              <div
                className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paperdim border rule-hairline text-brass font-mono text-xs uppercase tracking-widest2 mb-8 shadow-sm"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brass"></span>
                </span>
                <span>Active Hiring &middot; {openings.length} Available Role{openings.length === 1 ? "" : "s"}</span>
              </div>

              {/* Main Headline */}
              <h1
                className="animate-fade-up font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.08] text-ink font-normal tracking-tight"
                style={{ animationDelay: "80ms" }}
              >
                Where exceptional talent meets{" "}
                <span className="italic font-medium text-brass">unlimited opportunity.</span>
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-up mt-8 text-lg sm:text-xl leading-relaxed text-muted max-w-2xl"
                style={{ animationDelay: "160ms" }}
              >
                Skip the opaque resume queues. Discover our open positions in engineering, product, and leadership — and schedule a direct conversation with our hiring team in seconds.
              </p>

              {/* Action Buttons */}
              <div
                className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="#openings"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-4 rounded-lg font-mono text-xs uppercase tracking-widest2 hover:bg-brassdim transition-all shadow-sm hover:shadow group"
                >
                  <span>Explore Open Positions</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 border border-ink/20 bg-paper/80 backdrop-blur-sm px-7 py-4 rounded-lg font-mono text-xs uppercase tracking-widest2 text-ink hover:border-ink hover:bg-paperdim transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-brass" />
                  <span>Direct Scheduling</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                className="animate-fade-up mt-12 pt-8 border-t rule-hairline flex flex-wrap items-center gap-y-3 gap-x-8 font-mono text-xs text-muted"
                style={{ animationDelay: "320ms" }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brass" />
                  <span>30-Min Fast-Track Screening</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-brass" />
                  <span>Prishtina Hub &amp; Global Remote</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brass" />
                  <span>Passkey Verified Privacy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers & Impact Strip */}
        <section className="border-b rule-hairline bg-paperdim/30 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
              <div className="space-y-1">
                <p className="font-display text-3xl sm:text-4xl text-ink font-semibold">24 Hours</p>
                <p className="font-mono text-xs uppercase tracking-widest2 text-muted">Average Response Time</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl sm:text-4xl text-brass font-semibold">98.4%</p>
                <p className="font-mono text-xs uppercase tracking-widest2 text-muted">Candidate Satisfaction</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl sm:text-4xl text-ink font-semibold">350+</p>
                <p className="font-mono text-xs uppercase tracking-widest2 text-muted">Talents Placed</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl sm:text-4xl text-brass font-semibold">100%</p>
                <p className="font-mono text-xs uppercase tracking-widest2 text-muted">Direct Recruiter Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Northfield Section (Spirit & Culture) */}
        <section className="py-24 border-b rule-hairline">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest2 text-brass mb-3">
                  Why Join Northfield
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-medium">
                  A recruitment process designed with respect, clarity, and speed.
                </h2>
              </div>
              <p className="text-sm text-muted max-w-sm">
                We believe top talent deserves a transparent, modern hiring experience without unnecessary hurdles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper hover:bg-paperdim/40 transition-all hover:shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brass/10 flex items-center justify-center text-brass">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl text-ink font-medium">Direct Scheduling</h3>
                <p className="text-sm leading-relaxed text-muted">
                  No waiting weeks for back-and-forth emails. Pick a time that suits you on our live calendar.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper hover:bg-paperdim/40 transition-all hover:shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-ink/5 flex items-center justify-center text-ink">
                  <Award className="w-6 h-6 text-brass" />
                </div>
                <h3 className="font-display text-xl text-ink font-medium">Merit &amp; Transparency</h3>
                <p className="text-sm leading-relaxed text-muted">
                  Clear role expectations, honest compensation benchmarks, and structured evaluation.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper hover:bg-paperdim/40 transition-all hover:shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brass/10 flex items-center justify-center text-brass">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl text-ink font-medium">Global Impact</h3>
                <p className="text-sm leading-relaxed text-muted">
                  Work on international scale projects with collaborative teams from Prishtina and across the globe.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper hover:bg-paperdim/40 transition-all hover:shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-ink/5 flex items-center justify-center text-ink">
                  <Sparkles className="w-6 h-6 text-brass" />
                </div>
                <h3 className="font-display text-xl text-ink font-medium">Growth &amp; Wellness</h3>
                <p className="text-sm leading-relaxed text-muted">
                  Comprehensive health coverage, annual learning budgets, and flexible hybrid scheduling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 border-b rule-hairline bg-paperdim/20 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-mono text-xs uppercase tracking-widest2 text-brass mb-3">
                Seamless Candidate Journey
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-ink font-medium">
                How Our Hiring Flow Works
              </h2>
              <p className="mt-4 text-sm text-muted">
                From discovery to your introductory call in four simple, transparent steps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative p-6 rounded-xl border rule-hairline bg-paper space-y-3">
                <span className="font-mono text-xs font-semibold text-brass">STEP 01</span>
                <h3 className="font-display text-lg text-ink font-medium">Discover Roles</h3>
                <p className="text-xs leading-relaxed text-muted">
                  Explore open positions tailored to your skill set and career aspirations.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-xl border rule-hairline bg-paper space-y-3">
                <span className="font-mono text-xs font-semibold text-brass">STEP 02</span>
                <h3 className="font-display text-lg text-ink font-medium">Choose a Slot</h3>
                <p className="text-xs leading-relaxed text-muted">
                  Select an available 30-minute meeting time on our synchronized interviewer calendar.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-xl border rule-hairline bg-paper space-y-3">
                <span className="font-mono text-xs font-semibold text-brass">STEP 03</span>
                <h3 className="font-display text-lg text-ink font-medium">Passkey Verify</h3>
                <p className="text-xs leading-relaxed text-muted">
                  Provide your candidate ID &amp; passkey for instant, secure authentication and booking lock.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 rounded-xl border rule-hairline bg-paper space-y-3">
                <span className="font-mono text-xs font-semibold text-brass">STEP 04</span>
                <h3 className="font-display text-lg text-ink font-medium">1-on-1 Intro</h3>
                <p className="text-xs leading-relaxed text-muted">
                  Meet our lead interviewer for a structured conversation about goals, culture, and alignment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section id="openings" className="py-24 border-b rule-hairline scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest2 text-brass mb-2">
                  Join Our Team
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-medium">
                  Current Open Positions
                </h2>
              </div>
              <p className="font-mono text-xs text-muted">
                Showing {openings.length} published opening{openings.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Interactive Job Listing Component with Search & Department Filters */}
            <JobListings jobs={openings} />
          </div>
        </section>

        {/* Candidate Testimonials Section */}
        <section className="py-24 border-b rule-hairline bg-paperdim/30">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-mono text-xs uppercase tracking-widest2 text-brass mb-3">
                Candidate Stories
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-ink font-medium">
                Hear from candidates who experienced our flow
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper flex flex-col justify-between space-y-6">
                <div>
                  <Quote className="w-8 h-8 text-brass/40 mb-4" />
                  <p className="text-sm leading-relaxed text-ink italic">
                    &ldquo;The ability to immediately book a slot rather than waiting 2 weeks for an HR email was a breath of fresh air. The whole recruitment experience was exceptionally smooth.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t rule-hairline flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display font-medium text-xs">
                    EA
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">Erion A.</p>
                    <p className="font-mono text-[11px] text-muted">Senior Frontend Engineer</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper flex flex-col justify-between space-y-6">
                <div>
                  <Quote className="w-8 h-8 text-brass/40 mb-4" />
                  <p className="text-sm leading-relaxed text-ink italic">
                    &ldquo;Northfield values your time as much as their own. The verification process was straightforward, and the conversation was truly focused on engineering craft.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t rule-hairline flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brass text-paper flex items-center justify-center font-display font-medium text-xs">
                    LK
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">Laura K.</p>
                    <p className="font-mono text-[11px] text-muted">Product Design Lead</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-8 rounded-2xl border rule-hairline bg-paper flex flex-col justify-between space-y-6">
                <div>
                  <Quote className="w-8 h-8 text-brass/40 mb-4" />
                  <p className="text-sm leading-relaxed text-ink italic">
                    &ldquo;Real-time confirmation and transparent communication gave me immense confidence in Northfield&rsquo;s culture from day one.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t rule-hairline flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display font-medium text-xs">
                    DB
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">Driton B.</p>
                    <p className="font-mono text-[11px] text-muted">Fullstack Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer High-Impact CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative rounded-3xl bg-ink text-paper p-10 sm:p-16 overflow-hidden shadow-xl">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-brass/15 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl space-y-6">
                <span className="font-mono text-xs uppercase tracking-widest2 text-brass">
                  Ready To Begin?
                </span>
                <h2 className="font-display text-3xl sm:text-5xl leading-tight font-medium text-paper">
                  Your next career breakthrough is one conversation away.
                </h2>
                <p className="text-paper/70 text-base sm:text-lg leading-relaxed">
                  Browse our open positions or pick a time directly on our recruitment calendar to meet with our hiring leads.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 bg-brass hover:bg-brassdim text-paper px-8 py-4 rounded-lg font-mono text-xs uppercase tracking-widest2 transition-all shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Your Interview Slot</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 border border-paper/30 hover:border-paper px-7 py-4 rounded-lg font-mono text-xs uppercase tracking-widest2 text-paper transition-all"
                  >
                    <span>Contact Recruiting Team</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
