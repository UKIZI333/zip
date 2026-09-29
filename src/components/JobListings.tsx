"use client";

import { useState, useMemo } from "react";
import type { Job } from "@/lib/types";
import JobRow from "./JobRow";
import { Search, X, SlidersHorizontal, Briefcase, Filter } from "lucide-react";

interface JobListingsProps {
  jobs: Job[];
  initialSearch?: string;
  initialLocation?: string;
}

export default function JobListings({
  jobs,
  initialSearch = "",
  initialLocation = "",
}: JobListingsProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return ["All", ...Array.from(set).sort()];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        job.title.toLowerCase().includes(q) ||
        job.short_description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q);
      const matchesDept = selectedDept === "All" || job.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [jobs, searchQuery, selectedDept]);

  const isFiltered = searchQuery !== "" || selectedDept !== "All";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Sidebar Filters */}
      <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-28">
        
        {/* Search Filter Card */}
        <div className="bg-white border border-[#DEE1E3] rounded-xl p-5 shadow-xs space-y-3">
          <label className="text-xs font-bold text-[#002325] uppercase tracking-wider flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#277f6a]" />
            Search Roles
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#5D6770] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Title, skill or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F2F4F4] border border-[#DEE1E3] rounded-lg pl-10 pr-9 py-2.5 text-sm text-[#002325] placeholder:text-[#5D6770] outline-none focus:border-[#277f6a] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6770] hover:text-[#002325]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Card */}
        <div className="bg-white border border-[#DEE1E3] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#002325] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#277f6a]" />
              Departments
            </span>
            {selectedDept !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedDept("All")}
                className="text-xs text-[#277f6a] font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1 pt-1">
            {departments.map((dept) => {
              const count =
                dept === "All"
                  ? jobs.length
                  : jobs.filter((j) => j.department === dept).length;
              const selected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
                    selected
                      ? "bg-[#002325] text-white font-semibold"
                      : "text-[#5D6770] hover:text-[#002325] hover:bg-[#F2F4F4]"
                  }`}
                >
                  <span className="truncate pr-2">{dept}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-bold ${
                      selected
                        ? "bg-[#45DB61] text-[#002325]"
                        : "bg-[#F2F4F4] text-[#5D6770]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear all filters button */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedDept("All");
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#DEE1E3] bg-white text-[#005745] hover:bg-[#e6f9ed] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </aside>

      {/* Main Job Results */}
      <main className="lg:col-span-9">
        
        {/* Results Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#DEE1E3]">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-[#002325] text-xl">
              {selectedDept === "All" ? "Current Open Positions" : selectedDept}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e6f9ed] text-[#005745] text-xs font-bold border border-[#b2ecc5]">
              {filteredJobs.length} {filteredJobs.length === 1 ? "Role" : "Roles"}
            </span>
          </div>

          {searchQuery && (
            <p className="text-xs text-[#5D6770]">
              Showing results for &ldquo;
              <span className="font-semibold text-[#002325]">{searchQuery}</span>
              &rdquo;
            </p>
          )}
        </div>

        {/* Job Listings List */}
        {filteredJobs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-[#DEE1E3] p-8 space-y-4">
            <div className="w-14 h-14 bg-[#F2F4F4] rounded-2xl flex items-center justify-center mx-auto text-[#5D6770]">
              <Briefcase className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-[#002325] text-xl">No roles match your search</h4>
            <p className="text-[#5D6770] text-sm max-w-sm mx-auto">
              We couldn&apos;t find any open positions matching &ldquo;{searchQuery}&rdquo;. Try broadening your search or resetting filters.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept("All");
                }}
                className="inline-flex items-center gap-2 bg-[#002325] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#013437] transition-colors"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredJobs.map((job, index) => (
              <JobRow key={job.id} job={job} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
