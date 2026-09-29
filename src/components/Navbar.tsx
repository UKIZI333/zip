"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { Building2, ChevronDown, Menu, X, Briefcase, Search, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employerDropdownOpen, setEmployerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEmployerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Search Jobs", href: "/#openings" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#002325] text-white shadow-sm transition-all border-b border-[#013437]">
      <div className="mx-auto max-w-[1280px] px-6 h-20 md:h-24 flex items-center justify-between">
        
        {/* Left: Northfield Logo */}
        <div className="flex items-center">
          <Logo size="md" theme="dark" showTagline />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors py-2 hover:text-[#45DB61] ${
                pathname === link.href ? "text-[#45DB61] font-semibold" : "text-white/90"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Employer Dropdown matching ZipRecruiter's header */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setEmployerDropdownOpen(!employerDropdownOpen)}
              className="inline-flex items-center gap-2 py-2 px-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-expanded={employerDropdownOpen}
              aria-label="Employers menu"
            >
              <Building2 className="w-4 h-4 text-[#45DB61]" />
              <span>Employers</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  employerDropdownOpen ? "rotate-180 text-[#45DB61]" : "text-white/70"
                }`}
              />
            </button>

            {employerDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-[#002325] shadow-panel border border-[#DEE1E3] py-2 z-50 animate-fade-up">
                <Link
                  href="/admin/login"
                  onClick={() => setEmployerDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-[#F2F4F4] transition-colors"
                >
                  <span>Employer Log In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5D6770]" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setEmployerDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-[#F2F4F4] transition-colors"
                >
                  <span>Post a Job</span>
                  <span className="text-[10px] bg-[#45DB61]/20 text-[#005745] font-bold px-1.5 py-0.5 rounded">
                    HIRING
                  </span>
                </Link>
                <div className="border-t border-[#DEE1E3] my-1" />
                <Link
                  href="/contact"
                  onClick={() => setEmployerDropdownOpen(false)}
                  className="block px-4 py-2 text-xs text-[#5D6770] hover:text-[#002325]"
                >
                  Speak with Recruitment Team
                </Link>
              </div>
            )}
          </div>

          {/* Quick Post / Search CTA button */}
          <Link
            href="/#openings"
            className="inline-flex items-center gap-2 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Find Jobs</span>
          </Link>
        </nav>

        {/* Mobile menu hamburger toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-[#45DB61] transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#002325] border-t border-[#013437] px-6 py-6 space-y-4 animate-fade-up">
          <div className="flex flex-col space-y-3 text-base font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-white/90 hover:text-[#45DB61] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-white/90 hover:text-[#45DB61]"
              >
                <span>Employer Log In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#openings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#45DB61] text-[#002325] py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Open Positions</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
