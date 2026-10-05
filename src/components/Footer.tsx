import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-white border-t border-[#DEE1E3] pt-10 pb-12 text-[#002325]">
      <div className="page-container max-w-[1170px] mx-auto px-4 sm:px-6">
        <h2 className="sr-only">Footer</h2>
        
        <div className="universal_footer expanded_footer footer_accordion">
          {/* Primary Footer Navigation (3 Columns matching original ZipRecruiter IE) */}
          <nav className="primary_footer_nav mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 md:gap-20 max-w-[760px]">
              
              {/* Column 1: For Job Seekers */}
              <div className="nav_group">
                <h3 className="group_header text-sm font-bold text-[#002325] mb-3">
                  For Job Seekers
                </h3>
                <ul className="space-y-2 text-xs text-[#002325]">
                  <li className="item">
                    <Link href="/#openings" className="hover:text-[#005745] hover:underline transition-colors">
                      Search Jobs
                    </Link>
                  </li>
                  <li className="item">
                    <Link href="/contact" className="hover:text-[#005745] hover:underline transition-colors">
                      Create Free Account
                    </Link>
                  </li>
                  <li className="item">
                    <a href="mailto:support@ziprecruiter.ie" className="hover:text-[#005745] hover:underline transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Company */}
              <div className="nav_group company_group">
                <h3 className="group_header text-sm font-bold text-[#002325] mb-3">
                  Company
                </h3>
                <ul className="space-y-2 text-xs text-[#002325]">
                  <li className="item">
                    <Link href="/about" className="hover:text-[#005745] hover:underline transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li className="item">
                    <Link href="/about#culture" className="hover:text-[#005745] hover:underline transition-colors">
                      Corporate Responsibility
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Contact Us */}
              <div className="nav_group contact_group">
                <h3 className="group_header text-sm font-bold text-[#002325] mb-3">
                  Contact Us
                </h3>
                <ul className="space-y-2 text-xs text-[#002325]">
                  <li className="item">
                    <a className="email hover:text-[#005745] hover:underline transition-colors" href="mailto:support@ziprecruiter.ie">
                      Email Us
                    </a>
                  </li>
                  <li className="item">
                    <a className="phone_number hover:text-[#005745] hover:underline transition-colors" href="tel:+3531800849006">
                      Call +353 18 0084 9006
                    </a>
                  </li>
                </ul>
              </div>

            </div>
          </nav>

          {/* Social Links Group (Exact SVGs from ZipRecruiter IE inspect code) */}
          <div className="social_group mb-5">
            <ul className="social_links flex items-center gap-3">
              {/* Facebook */}
              <li>
                <a
                  href="https://www.facebook.com/ZipRecruiter"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-block text-[#2F3639] hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                    <title>Facebook</title>
                    <path
                      d="M22 12.06C22 6.505 17.523 2 12 2S2 6.504 2 12.06c0 5.023 3.656 9.185 8.437 9.94v-7.03H7.9v-2.91h2.538V9.844c0-2.521 1.493-3.915 3.778-3.915 1.093 0 2.238.197 2.238.197v2.476h-1.262c-1.242 0-1.628.776-1.628 1.572v1.887h2.773l-.443 2.908h-2.33V22C18.344 21.245 22 17.083 22 12.06Z"
                      fill="#2F3639"
                    />
                  </svg>
                </a>
              </li>

              {/* Twitter / X */}
              <li>
                <a
                  href="https://twitter.com/ziprecruiter/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-block text-[#1C1C1C] hover:opacity-80 transition-opacity"
                  aria-label="Twitter"
                >
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                    <title>Twitter</title>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.115 16.868 3 4h8.011l6.244 7.953 6.67-7.917h4.413l-8.95 10.635L30 28.188h-7.988l-6.76-8.601-7.218 8.577H3.598l9.517-11.296Zm10.062 8.935L7.912 6.384h1.934l15.245 19.42h-1.914Z"
                      fill="#1C1C1C"
                    />
                  </svg>
                </a>
              </li>

              {/* LinkedIn */}
              <li>
                <a
                  href="https://www.linkedin.com/company/ziprecruiter/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-block text-[#2F3639] hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                    <title>Linkedin</title>
                    <path
                      d="M21 4.324v15.353A1.323 1.323 0 0 1 19.677 21H4.324A1.323 1.323 0 0 1 3 19.677V4.324A1.324 1.324 0 0 1 4.324 3h15.353A1.323 1.323 0 0 1 21 4.324ZM8.294 9.882H5.647v8.47h2.647v-8.47Zm.238-2.911a1.525 1.525 0 0 0-1.514-1.536h-.047a1.535 1.535 0 0 0 0 3.07 1.525 1.525 0 0 0 1.561-1.487v-.047Zm9.82 6.236c0-2.546-1.62-3.536-3.229-3.536a3.017 3.017 0 0 0-2.678 1.366h-.074V9.882H9.882v8.47h2.647v-4.504a1.757 1.757 0 0 1 1.589-1.896h.1c.842 0 1.467.53 1.467 1.864v4.537h2.647l.02-5.146Z"
                      fill="#2F3639"
                    />
                  </svg>
                </a>
              </li>

              {/* Instagram */}
              <li>
                <a
                  href="https://www.instagram.com/ziprecruiter/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-block text-[#2F3639] hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                    <title>Instagram</title>
                    <rect x="2.25" y="2.25" width="26.833" height="26.833" rx="6" fill="#2F3639" />
                    <path d="M22.375 10.396a1.438 1.438 0 1 1-2.875 0 1.438 1.438 0 0 1 2.875 0Z" fill="#fff" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.667 20.458a4.792 4.792 0 1 0 0-9.583 4.792 4.792 0 0 0 0 9.583Zm0-1.916a2.875 2.875 0 1 0 0-5.75 2.875 2.875 0 0 0 0 5.75Z" fill="#fff" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.083 15.283c0-3.22 0-4.83.627-6.06A5.75 5.75 0 0 1 9.223 6.71c1.23-.627 2.84-.627 6.06-.627h.767c3.22 0 4.83 0 6.06.627a5.75 5.75 0 0 1 2.513 2.513c.627 1.23.627 2.84.627 6.06v.767c0 3.22 0 4.83-.627 6.06a5.75 5.75 0 0 1-2.513 2.513c-1.23.627-2.84.627-6.06.627h-.767c-3.22 0-4.83 0-6.06-.627A5.75 5.75 0 0 1 6.71 22.11c-.627-1.23-.627-2.84-.627-6.06v-.767ZM15.283 8h.767c1.642 0 2.758.001 3.62.072.84.069 1.27.193 1.57.346a3.833 3.833 0 0 1 1.675 1.675c.153.3.278.73.346 1.57.07.862.072 1.979.072 3.62v.767c0 1.642-.001 2.758-.072 3.62-.068.84-.193 1.27-.346 1.57a3.833 3.833 0 0 1-1.675 1.676c-.3.152-.73.277-1.57.345-.862.07-1.978.072-3.62.072h-.767c-1.641 0-2.758-.001-3.62-.072-.84-.068-1.27-.193-1.57-.345a3.833 3.833 0 0 1-1.675-1.676c-.153-.3-.277-.73-.346-1.57-.07-.862-.072-1.978-.072-3.62v-.767c0-1.641.001-2.758.072-3.62.069-.84.193-1.27.346-1.57a3.833 3.833 0 0 1 1.675-1.675c.3-.153.73-.277 1.57-.346.862-.07 1.979-.072 3.62-.072Z"
                      fill="#fff"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Secondary Footer Nav: Policies */}
          <nav className="secondary_footer_nav flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#002325] mb-4">
            <Link href="/about" className="hover:text-[#005745] hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-[#005745] hover:underline transition-colors">
              Terms of Use
            </Link>
            <Link href="/about" className="hover:text-[#005745] hover:underline transition-colors">
              Cookie Policy
            </Link>
            <Link href="/about" className="hover:text-[#005745] hover:underline transition-colors">
              Job Posting Rules
            </Link>
          </nav>

          {/* Secondary Footer Nav: Legal Notice & Copyright */}
          <div className="secondary_footer_nav text-[11px] text-[#5D6770] space-y-0.5 leading-relaxed">
            <p className="legal">
              ZipRecruiter, Inc. c/o, MCF Legal Technology Solutions Limited, Riverside one, Sir John Rogerson&apos;s Quay, Dublin 2, D02 X576, Ireland
            </p>
            <p className="legal">
              ZipRecruiter, Inc. © {currentYear} All Rights Reserved Worldwide
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
