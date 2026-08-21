"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: "Kosovo", code: "XK", dialCode: "+383", flag: "🇽🇰" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "North Macedonia", code: "MK", dialCode: "+389", flag: "🇲🇰" },
  { name: "Montenegro", code: "ME", dialCode: "+382", flag: "🇲🇪" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  required?: boolean;
}

export default function PhoneInputWithCountry({
  value,
  onChange,
  required = true,
}: PhoneInputWithCountryProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [nationalNumber, setNationalNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse incoming value if initialized
  useEffect(() => {
    if (!value) return;
    for (const c of COUNTRIES) {
      if (value.startsWith(c.dialCode)) {
        setSelectedCountry(c);
        setNationalNumber(value.slice(c.dialCode.length).trim());
        return;
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");
    onChange(`${country.dialCode} ${nationalNumber}`.trim());
  };

  const handleNumberChange = (num: string) => {
    setNationalNumber(num);
    onChange(`${selectedCountry.dialCode} ${num}`.trim());
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex rounded-lg border border-gray-300 bg-white focus-within:border-[#0069ff] focus-within:ring-1 focus-within:ring-[#0069ff] transition-all overflow-hidden">
        {/* Country Selector Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 bg-gray-50/70 hover:bg-gray-100/80 border-r border-gray-300 text-gray-700 text-sm font-medium transition-colors shrink-0 outline-none"
          aria-label="Select country dial code"
        >
          <span className="text-lg leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-semibold text-gray-600">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Number Input */}
        <input
          type="tel"
          required={required}
          value={nationalNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="44 123 456"
          className="w-full px-3.5 py-3 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
        />
      </div>

      {/* Country Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-up">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 text-xs">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No country found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountryChange(country)}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50 text-left transition-colors ${
                    selectedCountry.code === country.code ? "bg-blue-50/80 font-semibold text-[#0069ff]" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-[11px]">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
