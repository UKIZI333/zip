import Link from "next/link";
import type { Job } from "@/lib/types";
import { MapPin, Building2, Clock, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function JobRow({ job, index }: { job: Job; index: number }) {
  const isFeatured = index % 3 === 0;

  return (
    <div
      className={`group relative bg-white border border-[#DEE1E3] rounded-xl p-5 md:p-6 mb-4 transition-all duration-200 hover:shadow-md hover:border-[#277f6a] ${
        isFeatured ? "border-l-4 border-l-[#277f6a]" : ""
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Main Job Information */}
        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/jobs/${job.slug}`}
              className="text-lg md:text-xl font-bold text-[#002325] hover:text-[#277f6a] hover:underline transition-colors"
            >
              {job.title}
            </Link>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f9ed] text-[#005745] border border-[#b2ecc5]">
                <Zap className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F2F4F4] text-[#5D6770]">
              {job.department}
            </span>
          </div>

          {/* Meta Details */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#5D6770]">
            <span className="flex items-center gap-1.5 font-medium text-[#002325]">
              <Building2 className="w-3.5 h-3.5 text-[#002325]" />
              Northfield
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#002325]" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5D6770]" />
              {job.employment_type || "Full-time"}
            </span>
            {job.benefits?.[0] && (
              <span className="font-semibold text-[#005745] bg-[#e6f9ed] px-2 py-0.5 rounded">
                {job.benefits[0]}
              </span>
            )}
          </div>

          {/* Description snippet */}
          <p className="text-sm text-[#5D6770] leading-relaxed line-clamp-2 max-w-3xl pt-1">
            {job.short_description}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-3 pt-2 lg:pt-0">
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-xs group-hover:shadow"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
