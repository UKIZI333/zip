"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Globe, ChevronDown, Search, Check } from "lucide-react";
import { currentTimeInZone } from "@/lib/scheduling";

export interface TimezoneOption {
  zone: string;
  label: string;
  region: string;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  { zone: "Europe/Belgrade", label: "Central European Time (Belgrade, Prishtina)", region: "Europe" },
  { zone: "Europe/Tirane", label: "Central European Time (Tirana)", region: "Europe" },
  { zone: "Europe/Berlin", label: "Central European Time (Berlin, Frankfurt)", region: "Europe" },
  { zone: "Europe/Paris", label: "Central European Time (Paris)", region: "Europe" },
  { zone: "Europe/Rome", label: "Central European Time (Rome)", region: "Europe" },
  { zone: "Europe/Vienna", label: "Central European Time (Vienna)", region: "Europe" },
  { zone: "Europe/Zurich", label: "Central European Time (Zurich)", region: "Europe" },
  { zone: "Europe/London", label: "Greenwich Mean Time (London)", region: "Europe" },
  { zone: "Europe/Athens", label: "Eastern European Time (Athens)", region: "Europe" },
  { zone: "Europe/Helsinki", label: "Eastern European Time (Helsinki)", region: "Europe" },
  { zone: "Europe/Istanbul", label: "Turkey Time (Istanbul)", region: "Europe" },
  { zone: "America/New_York", label: "Eastern Time (New York)", region: "Americas" },
  { zone: "America/Chicago", label: "Central Time (Chicago)", region: "Americas" },
  { zone: "America/Denver", label: "Mountain Time (Denver)", region: "Americas" },
  { zone: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", region: "Americas" },
  { zone: "America/Toronto", label: "Eastern Time (Toronto)", region: "Americas" },
  { zone: "America/Sao_Paulo", label: "Brasilia Time (São Paulo)", region: "Americas" },
  { zone: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", region: "Asia & Pacific" },
  { zone: "Asia/Singapore", label: "Singapore Standard Time", region: "Asia & Pacific" },
  { zone: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", region: "Asia & Pacific" },
  { zone: "Australia/Sydney", label: "Australian Eastern Time (Sydney)", region: "Asia & Pacific" },
  { zone: "UTC", label: "Coordinated Universal Time (UTC)", region: "Global" },
];

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
}

export default function TimezoneSelector({ value, onChange }: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allTimezones = useMemo(() => {
    let zones: string[] = [];
    try {
      if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
        zones = Intl.supportedValuesOf("timeZone");
      }
    } catch {
      zones = POPULAR_TIMEZONES.map((p) => p.zone);
    }

    const popularMap = new Map(POPULAR_TIMEZONES.map((p) => [p.zone, p]));

    const fullList: TimezoneOption[] = zones.map((z) => {
      if (popularMap.has(z)) return popularMap.get(z)!;
      const parts = z.split("/");
      const city = parts[parts.length - 1].replace(/_/g, " ");
      const region = parts[0];
      return {
        zone: z,
        label: `${city} (${z})`,
        region,
      };
    });

    // Ensure currently selected value is present
    if (!fullList.some((t) => t.zone === value)) {
      fullList.unshift({ zone: value, label: value, region: "Custom" });
    }

    return fullList;
  }, [value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return POPULAR_TIMEZONES;
    const q = search.toLowerCase();
    return allTimezones
      .filter((t) => t.label.toLowerCase().includes(q) || t.zone.toLowerCase().includes(q))
      .slice(0, 30);
  }, [search, allTimezones]);

  const currentOption = useMemo(() => {
    const found = POPULAR_TIMEZONES.find((p) => p.zone === value);
    if (found) return found.label;
    return value.replace(/_/g, " ");
  }, [value]);

  const timeString = currentTimeInZone(value);

  return (
    <div className="relative font-sans mt-8 pt-6 border-t border-gray-100" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        Time zone
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 text-xs font-medium text-gray-800 hover:text-[#0069ff] py-1 text-left transition-colors focus:outline-none group"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#0069ff] shrink-0" />
          <span className="truncate">{currentOption} ({timeString})</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-up">
          {/* Search Box */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search city or timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* List of Timezones */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 text-xs">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No timezone found</div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.zone === value;
                const itemTime = currentTimeInZone(item.zone);
                return (
                  <button
                    key={item.zone}
                    type="button"
                    onClick={() => {
                      onChange(item.zone);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 hover:bg-blue-50/80 transition-colors ${
                      isSelected ? "bg-blue-50 text-[#0069ff] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate">{item.label}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-gray-400">
                      <span className="font-mono text-[11px]">{itemTime}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0069ff]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
