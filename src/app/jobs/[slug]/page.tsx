import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import JobDetailClient from "@/components/JobDetailClient";
import { USA_JOBS_LIST } from "@/lib/mockJobs";
import type { Job } from "@/lib/types";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, location, department")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  const title = job?.title || USA_JOBS_LIST.find((j) => j.slug === params.slug)?.title || "Job Details";

  return {
    title: `${title} | Northfield Ireland`,
    description: `Apply for ${title} at Northfield. View job responsibilities, qualifications, and submit your application with 1 click.`,
  };
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: dbJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const allJobs = (dbJobs && dbJobs.length > 0 ? dbJobs : USA_JOBS_LIST) as Job[];

  const resolvedJob = allJobs.find((j) => j.slug === params.slug);

  if (!resolvedJob) notFound();

  // Pick up to 5 jobs for "More from Northfield" (excluding current)
  const moreJobs = allJobs
    .filter((j) => j.id !== resolvedJob.id)
    .slice(0, 5);

  // Pick up to 5 jobs for "Similar Jobs" (different slice or different dept)
  const similarJobs = allJobs
    .filter((j) => j.id !== resolvedJob.id)
    .slice(2, 7);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F4]">
      <main className="flex-1">
        <JobDetailClient
          job={resolvedJob}
          moreJobs={moreJobs}
          similarJobs={similarJobs}
        />
      </main>
      <Footer />
    </div>
  );
}
