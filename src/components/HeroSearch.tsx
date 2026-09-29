"use client";

import { useState } from "react";
import { Search, MapPin, Navigation, ChevronDown } from "lucide-react";

interface HeroSearchProps {
  onSearch?: (keywords: string, location: string, distance: string) => void;
}

export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("Dublin, Ireland");
  const [distance, setDistance] = useState("Distance");
  const [distanceOpen, setDistanceOpen] = useState(false);

  const distanceOptions = [
    "5 Kilometres",
    "10 Kilometres",
    "20 Kilometres",
    "50 Kilometres",
    "100 Kilometres",
    "Any",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keywords, location, distance);
    }
    const openingsEl = document.getElementById("openings");
    if (openingsEl) {
      openingsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto mt-8 relative z-20">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-stretch gap-2.5 bg-black/20 p-2 sm:p-3 rounded-2xl backdrop-blur-xs border border-white/20 shadow-2xl"
      >
        {/* Keywords Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#5D6770] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            name="q"
            id="q"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Keywords"
            aria-label="Keywords"
            className="w-full h-13 pl-12 pr-4 bg-white text-[#002325] text-base placeholder:text-[#5D6770] rounded-xl border border-[#5D6770]/40 focus:border-[#45DB61] focus:ring-2 focus:ring-[#45DB61]/20 outline-none transition-all shadow-xs"
          />
        </div>

        {/* Location Input */}
        <div className="relative flex-1">
          <MapPin className="w-5 h-5 text-[#5D6770] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            name="l"
            id="l"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            aria-label="Location"
            className="w-full h-13 pl-12 pr-4 bg-white text-[#002325] text-base placeholder:text-[#5D6770] rounded-xl border border-[#5D6770]/40 focus:border-[#45DB61] focus:ring-2 focus:ring-[#45DB61]/20 outline-none transition-all shadow-xs"
          />
        </div>

        {/* Distance Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDistanceOpen(!distanceOpen)}
            className="w-full md:w-auto h-13 px-4 bg-white text-[#002325] text-base font-normal rounded-xl border border-[#5D6770]/40 hover:border-[#5D6770] flex items-center justify-between gap-3 shadow-xs transition-all"
            aria-expanded={distanceOpen}
            aria-label="Filter by distance"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#5D6770]" />
              <span className="truncate">{distance}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#5D6770]" />
          </button>

          {distanceOpen && (
            <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-48 bg-white border border-[#DEE1E3] rounded-xl shadow-panel py-2 z-50 animate-fade-up">
              {distanceOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setDistance(opt);
                    setDistanceOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    distance === opt
                      ? "bg-[#F2F4F4] text-[#005745] font-bold"
                      : "text-[#002325] hover:bg-[#F2F4F4]"
                  }`}
                >
                  <span>{opt}</span>
                  {distance === opt && (
                    <span className="w-2 h-2 rounded-full bg-[#45DB61]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="h-13 px-8 bg-[#45DB61] hover:bg-[#26c744] active:bg-[#1a862e] text-[#002325] text-base font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
