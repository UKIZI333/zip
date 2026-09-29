import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#002325] text-white border-t border-[#013437] pt-16 pb-12">
      <div className="mx-auto max-w-[1280px] px-6">
        
        {/* Top Header / Branding in Footer */}
        <div className="pb-10 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo size="md" theme="dark" showTagline />
          <p className="text-sm text-white/70 max-w-md">
            The smart recruitment platform connecting top talent with exceptional companies in Ireland and internationally.
          </p>
        </div>

        {/* Primary Footer Navigation Columns matching ZipRecruiter IE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-12 border-b border-white/10">
          
          {/* For Job Seekers */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-tight">
              For Job Seekers
            </h3>
            <ul className="space-y-3.5 text-sm text-white/75">
              <li>
                <Link href="/#openings" className="hover:text-[#45DB61] transition-colors">
                  Search Jobs
                </Link>
              </li>
              <li>
                <Link href="/#openings" className="hover:text-[#45DB61] transition-colors">
                  Browse Active Openings
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-[#45DB61] transition-colors">
                  Schedule Candidate Interview
                </Link>
              </li>
              <li>
                <a href="mailto:support@northfield.ie" className="hover:text-[#45DB61] transition-colors">
                  Candidate Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-tight">
              Company
            </h3>
            <ul className="space-y-3.5 text-sm text-white/75">
              <li>
                <Link href="/about" className="hover:text-[#45DB61] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#culture" className="hover:text-[#45DB61] transition-colors">
                  Corporate Responsibility
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#45DB61] transition-colors">
                  Employer Partnerships
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#45DB61] transition-colors">
                  Employer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-base font-bold text-white mb-5 tracking-tight">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-sm text-white/75">
              <li>
                <a
                  href="mailto:support@northfield.ie"
                  className="hover:text-[#45DB61] transition-colors flex items-center gap-2"
                >
                  <span className="text-[#45DB61] font-bold">Email:</span> support@northfield.ie
                </a>
              </li>
              <li>
                <a
                  href="tel:+3531800849006"
                  className="hover:text-[#45DB61] transition-colors flex items-center gap-2"
                >
                  <span className="text-[#45DB61] font-bold">Phone:</span> +353 18 0084 9006
                </a>
              </li>
              <li className="text-xs text-white/60 pt-1 leading-relaxed">
                Operating Hours: Monday – Friday, 08:30 – 17:30 GMT
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links Row matching ZipRecruiter IE */}
        <div className="py-8 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="font-semibold text-white">Connect with Northfield:</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#45DB61] hover:text-[#002325] text-white flex items-center justify-center transition-all"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.504 2 12.06c0 5.023 3.656 9.185 8.437 9.94v-7.03H7.9v-2.91h2.538V9.844c0-2.521 1.493-3.915 3.778-3.915 1.093 0 2.238.197 2.238.197v2.476h-1.262c-1.242 0-1.628.776-1.628 1.572v1.887h2.773l-.443 2.908h-2.33V22C18.344 21.245 22 17.083 22 12.06Z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#45DB61] hover:text-[#002325] text-white flex items-center justify-center transition-all"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#45DB61] hover:text-[#002325] text-white flex items-center justify-center transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#45DB61] hover:text-[#002325] text-white flex items-center justify-center transition-all"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Secondary Policy Navigation & Legal notice */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-white/60">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Job Posting Rules
            </Link>
          </nav>

          <div className="space-y-1 text-left md:text-right">
            <p>Northfield, Inc. c/o, MCF Legal Technology Solutions Limited, Riverside one, Sir John Rogerson&apos;s Quay, Dublin 2, D02 X576, Ireland</p>
            <p className="text-white/40">Northfield, Inc. © {currentYear} All Rights Reserved Worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
