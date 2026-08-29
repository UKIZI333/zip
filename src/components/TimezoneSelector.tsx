"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Globe, ChevronDown, Search, Check } from "lucide-react";
import { currentTimeInZone } from "@/lib/scheduling";

export interface TimezoneItem {
  zone: string;
  label: string;
}

export interface TimezoneGroup {
  group: string;
  items: TimezoneItem[];
}

export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    group: "US/Canada",
    items: [
      { zone: "America/Los_Angeles", label: "Pacific Time - US & Canada" },
      { zone: "America/Vancouver", label: "Vancouver Time" },
      { zone: "America/Denver", label: "Mountain Time - US & Canada" },
      { zone: "America/Chicago", label: "Central Time - US & Canada" },
      { zone: "America/New_York", label: "Eastern Time - US & Canada" },
      { zone: "America/Anchorage", label: "Alaska Time" },
      { zone: "America/Phoenix", label: "Arizona, Yukon Time" },
      { zone: "America/St_Johns", label: "Newfoundland Time" },
      { zone: "Pacific/Honolulu", label: "Hawaii Time" },
    ],
  },
  {
    group: "America",
    items: [
      { zone: "America/Adak", label: "America/Adak" },
      { zone: "America/Argentina/Buenos_Aires", label: "Buenos Aires Time" },
      { zone: "America/Asuncion", label: "Asuncion Time" },
      { zone: "America/Bogota", label: "Bogota, Jamaica, Lima Time" },
      { zone: "America/Campo_Grande", label: "America/Campo Grande" },
      { zone: "America/Caracas", label: "Caracas Time" },
      { zone: "America/Godthab", label: "America/Godthab" },
      { zone: "America/Halifax", label: "Atlantic Time" },
      { zone: "America/Costa_Rica", label: "Saskatchewan, Guatemala, Costa Rica Time" },
      { zone: "America/Havana", label: "America/Havana" },
      { zone: "America/Mazatlan", label: "America/Mazatlan" },
      { zone: "America/Mexico_City", label: "Mexico City Time" },
      { zone: "America/Montevideo", label: "Montevideo Time" },
      { zone: "America/Miquelon", label: "America/Miquelon" },
      { zone: "America/Noronha", label: "America/Noronha" },
      { zone: "America/Santiago", label: "Santiago Time" },
      { zone: "America/Santa_Isabel", label: "America/Santa Isabel" },
      { zone: "America/Santo_Domingo", label: "Atlantic Standard Time" },
      { zone: "America/Sao_Paulo", label: "Brasilia Time" },
    ],
  },
  {
    group: "Africa",
    items: [
      { zone: "Africa/Cairo", label: "Africa/Cairo" },
      { zone: "Africa/Maputo", label: "Central Africa Time" },
      { zone: "Africa/Lagos", label: "West Africa Time" },
      { zone: "Africa/Windhoek", label: "Africa/Windhoek" },
    ],
  },
  {
    group: "Asia",
    items: [
      { zone: "Asia/Amman", label: "Jordan Time" },
      { zone: "Asia/Baghdad", label: "Baghdad, East Africa Time" },
      { zone: "Asia/Baku", label: "Asia/Baku" },
      { zone: "Asia/Beirut", label: "Lebanon Time" },
      { zone: "Asia/Damascus", label: "Syria Time" },
      { zone: "Asia/Dhaka", label: "Asia/Dhaka" },
      { zone: "Asia/Dubai", label: "Dubai Time" },
      { zone: "Asia/Gaza", label: "Asia/Gaza" },
      { zone: "Asia/Irkutsk", label: "Asia/Irkutsk" },
      { zone: "Asia/Bangkok", label: "Indochina Time" },
      { zone: "Asia/Jerusalem", label: "Israel Time" },
      { zone: "Asia/Kabul", label: "Kabul Time" },
      { zone: "Pacific/Majuro", label: "Pacific/Majuro" },
      { zone: "Asia/Karachi", label: "Pakistan, Maldives Time" },
      { zone: "Asia/Kathmandu", label: "Kathmandu Time" },
      { zone: "Asia/Kolkata", label: "India, Sri Lanka Time" },
      { zone: "Asia/Krasnoyarsk", label: "Krasnoyarsk Time" },
      { zone: "Asia/Omsk", label: "Asia/Omsk" },
      { zone: "Asia/Yangon", label: "Asia/Rangoon" },
      { zone: "Asia/Singapore", label: "China, Singapore, Perth" },
      { zone: "Asia/Tehran", label: "Tehran Time" },
      { zone: "Asia/Tokyo", label: "Japan, Korea Time" },
      { zone: "Asia/Vladivostok", label: "Asia/Vladivostok" },
      { zone: "Asia/Yakutsk", label: "Asia/Yakutsk" },
      { zone: "Asia/Yekaterinburg", label: "Yekaterinburg Time" },
      { zone: "Asia/Yerevan", label: "Asia/Yerevan" },
    ],
  },
  {
    group: "Atlantic",
    items: [
      { zone: "Atlantic/Azores", label: "Azores Time" },
      { zone: "Atlantic/Cape_Verde", label: "Cape Verde Time" },
    ],
  },
  {
    group: "Australia",
    items: [
      { zone: "Australia/Adelaide", label: "Adelaide Time" },
      { zone: "Australia/Brisbane", label: "Brisbane Time" },
      { zone: "Australia/Darwin", label: "Australia/Darwin" },
      { zone: "Australia/Eucla", label: "Australia/Eucla" },
      { zone: "Australia/Lord_Howe", label: "Australia/Lord Howe" },
      { zone: "Australia/Perth", label: "Australia/Perth" },
      { zone: "Australia/Sydney", label: "Sydney, Melbourne Time" },
    ],
  },
  {
    group: "UTC",
    items: [{ zone: "UTC", label: "UTC Time" }],
  },
  {
    group: "Europe",
    items: [
      { zone: "Europe/Belgrade", label: "Central European Time" },
      { zone: "Europe/Bucharest", label: "Eastern European Time" },
      { zone: "Europe/London", label: "UK, Ireland, Lisbon Time" },
      { zone: "Europe/Minsk", label: "Minsk Time" },
      { zone: "Europe/Moscow", label: "Moscow Time" },
      { zone: "Europe/Istanbul", label: "Turkey Time" },
    ],
  },
  {
    group: "Pacific",
    items: [
      { zone: "Pacific/Apia", label: "Pacific/Apia" },
      { zone: "Pacific/Auckland", label: "Auckland Time" },
      { zone: "Pacific/Chatham", label: "Pacific/Chatham" },
      { zone: "Pacific/Easter", label: "Pacific/Easter" },
      { zone: "Pacific/Fiji", label: "Pacific/Fiji" },
      { zone: "Pacific/Gambier", label: "Pacific/Gambier" },
      { zone: "Pacific/Kiritimati", label: "Pacific/Kiritimati" },
      { zone: "Pacific/Majuro", label: "Pacific/Majuro" },
      { zone: "Pacific/Marquesas", label: "Pacific/Marquesas" },
      { zone: "Pacific/Norfolk", label: "Pacific/Norfolk" },
      { zone: "Pacific/Noumea", label: "Pacific/Noumea" },
      { zone: "Pacific/Pago_Pago", label: "Pacific/Pago Pago" },
      { zone: "Pacific/Pitcairn", label: "Pacific/Pitcairn" },
      { zone: "Pacific/Tarawa", label: "Pacific/Tarawa" },
      { zone: "Pacific/Tongatapu", label: "Pacific/Tongatapu" },
    ],
  },
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

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TIMEZONE_GROUPS;

    return TIMEZONE_GROUPS.map((g) => ({
      group: g.group,
      items: g.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.zone.toLowerCase().includes(q) ||
          g.group.toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [search]);

  // Current selected label
  const currentLabel = useMemo(() => {
    for (const g of TIMEZONE_GROUPS) {
      const found = g.items.find((i) => i.zone === value);
      if (found) return found.label;
    }
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
          <span className="truncate">{currentLabel} ({timeString})</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full sm:w-88 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-up">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search city, region or timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* List of Timezones by Category Group */}
          <div className="max-h-64 overflow-y-auto text-xs divide-y divide-gray-50">
            {filteredGroups.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No time zone found</div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.group} role="group" aria-label={group.group}>
                  {/* Category Header */}
                  <div className="px-3.5 py-1.5 bg-gray-50/90 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 border-y border-gray-100">
                    {group.group}
                  </div>

                  {/* Options inside category */}
                  <div className="divide-y divide-gray-50">
                    {group.items.map((item) => {
                      const isSelected = item.zone === value;
                      const itemTime = currentTimeInZone(item.zone);

                      return (
                        <button
                          key={item.zone}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(item.zone);
                            setIsOpen(false);
                            setSearch("");
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 hover:bg-blue-50/80 transition-colors ${
                            isSelected ? "bg-blue-50/90 text-[#0069ff] font-semibold" : "text-gray-700"
                          }`}
                        >
                          <span className="truncate pr-2">{item.label}</span>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[11px] text-gray-500 font-medium">{itemTime}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#0069ff] shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
