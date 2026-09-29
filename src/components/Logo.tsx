import Link from "next/link";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  theme?: "dark" | "light" | "auto";
}

export default function Logo({
  className = "",
  showTagline = false,
  size = "md",
  theme = "auto",
}: LogoProps) {
  const iconSize = size === "sm" ? 32 : size === "lg" ? 48 : 38;
  const isDark = theme === "dark";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="Northfield Home"
    >
      {/* Northfield Modern Pinnacle / Ascent Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-lg transition-transform duration-200 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Rounded Container */}
          <rect
            width="40"
            height="40"
            rx="9"
            fill={isDark ? "#013437" : "#002325"}
          />
          {/* Stylized Modern Dynamic Geometric "N" with upward career ascent */}
          <path
            d="M11 29V11L21 24V11"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 11V29L19 16V29"
            stroke="#45DB61"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="2.2" fill="#45DB61" />
        </svg>
      </div>

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-sans tracking-tight font-extrabold flex items-center ${
              isDark ? "text-white" : "text-[#002325]"
            } ${size === "sm" ? "text-xl" : size === "lg" ? "text-3xl" : "text-2xl"}`}
          >
            Northfield
          </span>
          <span className="text-[#45DB61] font-bold text-xs tracking-normal">
            IE
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] uppercase font-semibold tracking-wider ${
              isDark ? "text-white/60" : "text-[#5D6770]"
            } mt-0.5`}
          >
            Ireland Careers
          </span>
        )}
      </div>
    </Link>
  );
}
