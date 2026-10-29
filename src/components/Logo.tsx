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
  const isDark = theme === "dark" || theme === "auto";
  const logoSrc = isDark ? "/ziprecruiter-white.png" : "/ziprecruiter-dark.png";

  const dimensions = {
    sm: { width: 140, height: 32 },
    md: { width: 185, height: 42 },
    lg: { width: 235, height: 54 },
  }[size];

  return (
    <Link
      href="https://www.ziprecruiter.com/"
      className={`inline-flex items-center gap-3 group select-none ${className}`}
      aria-label="ZipRecruiter"
    >
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        <img
          src={logoSrc}
          alt="ZipRecruiter"
          className="w-full h-full object-contain"
        />
      </div>

      {showTagline && (
        <span
          className={`text-[11px] uppercase font-semibold tracking-wider ${
            isDark ? "text-white/60 border-white/20" : "text-[#5D6770] border-black/15"
          } border-l pl-2.5 py-0.5 leading-none`}
        >
          
        </span>
      )}
    </Link>
  );
}
