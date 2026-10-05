import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    title: `${title} | ZipRecruiter`,
    description: `Apply for ${title} at ZipRecruiter. View job responsibilities, qualifications, and submit your application with 1 click.`,
  };
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: dbJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const dbList = (dbJobs || []) as Job[];
  const combinedMap = new Map<string, Job>();
  USA_JOBS_LIST.forEach((j) => combinedMap.set(j.slug, j));
  dbList.forEach((j) => combinedMap.set(j.slug, j));

  const allJobs = Array.from(combinedMap.values());
  const resolvedJob = combinedMap.get(params.slug);

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
    <JobDetailClient
      job={resolvedJob}
      moreJobs={moreJobs}
      similarJobs={similarJobs}
    />
  );
}
