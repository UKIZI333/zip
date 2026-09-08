import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { USA_JOBS_LIST } from "@/lib/mockJobs";
import type { Job } from "@/lib/types";
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 0;

function List({ heading, items }: { heading: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-10">
      <h2 className="font-mono text-xs uppercase tracking-widest2 text-brass mb-4 font-semibold">
        {heading}
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3.5 text-[15px] leading-relaxed text-ink">
            <span className="w-5 h-5 rounded-full bg-brass/10 text-brass flex items-center justify-center font-mono text-[11px] font-semibold shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  // Find from DB or fallback list
  const resolvedJob = (job as Job) || USA_JOBS_LIST.find((j) => j.slug === params.slug);

  if (!resolvedJob) notFound();

  const j = resolvedJob;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-brass selection:text-paper">
      <Navbar />

      <main className="flex-1">
        {/* Header / Intro */}
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <Link
            href="/#openings"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest2 text-muted hover:text-ink transition-colors"
          >
            ← Back to All Positions
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-brass/10 text-brass font-semibold">
              {j.department}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Actively Interviewing
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl mt-4 text-ink font-medium tracking-tight">
            {j.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brass" />
              {j.location}
            </span>
            <span aria-hidden className="text-rule">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brass" />
              {j.employment_type}
            </span>
            <span aria-hidden className="text-rule">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brass" />
              30-min Fast-Track Screening
            </span>
          </div>
        </section>

        {/* Content & Scheduling Action */}
        <section className="mx-auto max-w-4xl px-6 py-10 border-t rule-hairline">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Job Details */}
            <div className="lg:col-span-8 space-y-10">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest2 text-brass mb-4 font-semibold">
                  About the Position
                </h2>
                <p className="text-[15px] leading-relaxed text-ink/90 whitespace-pre-line">
                  {j.description}
                </p>
              </div>

              <div className="border-t rule-hairline pt-8">
                <List heading="Key Responsibilities" items={j.responsibilities} />
                <List heading="Requirements &amp; Experience" items={j.requirements} />
                <List heading="What We Offer &amp; Compensation (20-30% Above Market)" items={j.benefits} />
              </div>
            </div>

            {/* Right: Sticky Action Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 p-6 rounded-2xl border rule-hairline bg-paperdim/40 space-y-6 shadow-sm">
                <div>
                  <h3 className="font-display text-xl text-ink font-semibold">
                    Ready to Apply?
                  </h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    Select a time on our live calendar to speak directly with our recruitment lead.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t rule-hairline text-xs font-mono text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brass" />
                    <span>Instant calendar confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brass" />
                    <span>Verified passkey access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brass" />
                    <span>30-minute structured chat</span>
                  </div>
                </div>

                <Link
                  href={`/schedule?job=${j.slug}`}
                  className="w-full bg-ink hover:bg-brassdim text-paper py-3.5 rounded-lg font-mono text-xs uppercase tracking-widest2 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-brass" />
                  <span>Schedule Interview</span>
                </Link>

                <div className="text-center">
                  <Link
                    href="/contact"
                    className="text-[11px] font-mono text-muted hover:text-ink transition-colors"
                  >
                    Have questions first? Contact Us
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
