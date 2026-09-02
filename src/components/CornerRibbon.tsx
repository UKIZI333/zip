"use client";

export default function CornerRibbon() {
  return (
    <div
      className="absolute -top-2.5 -right-2.5 w-[140px] h-[140px] pointer-events-none z-30 select-none overflow-visible"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ribbon-drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Top-Left Fold Shadow Triangle (tucks behind top edge of the card at y=10) */}
        <polygon
          points="20,10 30,10 20,0"
          fill="#1b2228"
        />

        {/* Bottom-Right Fold Shadow Triangle (tucks behind right edge of the card at x=130) */}
        <polygon
          points="130,110 130,120 140,120"
          fill="#1b2228"
        />

        {/* Main 45-Degree Diagonal Ribbon Band */}
        <polygon
          points="20,0 64,0 140,76 140,120"
          fill="#414c56"
          filter="url(#ribbon-drop-shadow)"
        />

        {/* Centered 45-Degree Angled Text inside Ribbon */}
        <g transform="rotate(45 91 49)">
          <text
            x="91"
            y="43.5"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="7.5"
            fontWeight="600"
            letterSpacing="0.18em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            POWERED BY
          </text>
          <text
            x="91"
            y="56.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="800"
            letterSpacing="0.08em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            NORTHFIELD
          </text>
        </g>
      </svg>
    </div>
  );
}
