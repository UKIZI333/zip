"use client";

import { useState, useMemo } from "react";
import type { Job } from "@/lib/types";
import JobRow from "./JobRow";
import { Search, Filter, Briefcase } from "lucide-react";

interface JobListingsProps {
  jobs: Job[];
}

export default function JobListings({ jobs }: JobListingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return ["All", ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "All" || job.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [jobs, searchQuery, selectedDept]);

  return (
    <div className="space-y-8">
      {/* Controls: Search & Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b rule-hairline pb-6">
        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="font-mono text-xs text-muted uppercase tracking-widest2 mr-2 hidden sm:inline-flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {departments.map((dept) => {
            const count =
              dept === "All" ? jobs.length : jobs.filter((j) => j.department === dept).length;
            const isSelected = selectedDept === dept;

            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-ink text-paper font-semibold shadow-sm"
                    : "bg-paperdim/70 text-muted hover:text-ink hover:bg-paperdim"
                }`}
              >
                <span>{dept}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-brass text-paper" : "bg-rule/60 text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles, locations, skills…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-paperdim/50 border rule-hairline rounded-lg pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted/70 outline-none focus:border-brass focus:bg-paper transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed rule-hairline bg-paperdim/30">
          <div className="w-12 h-12 rounded-full bg-paperdim flex items-center justify-center mx-auto mb-4 text-muted">
            <Briefcase className="w-6 h-6 text-brass" />
          </div>
          <h3 className="font-display text-xl text-ink">No matching roles found</h3>
          <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
            Try adjusting your search keywords or switching department filter to view all active openings.
          </p>
          {(searchQuery || selectedDept !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("All");
              }}
              className="mt-6 font-mono text-xs uppercase tracking-widest2 text-brass hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-rule/60">
          {filteredJobs.map((job, index) => (
            <JobRow key={job.id} job={job} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
