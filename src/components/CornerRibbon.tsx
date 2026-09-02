"use client";

export default function CornerRibbon() {
  return (
    <div
      className="absolute -top-3 -right-3 w-[180px] h-[180px] pointer-events-none z-30 select-none overflow-visible"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 180 180"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ribbon-drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Top-Left Fold Shadow Triangle (tucks behind top edge of the card) */}
        <polygon
          points="24,12 36,12 24,0"
          fill="#1b2228"
        />

        {/* Bottom-Right Fold Shadow Triangle (tucks behind right edge of the card) */}
        <polygon
          points="168,144 168,156 180,156"
          fill="#1b2228"
        />

        {/* Main 45-Degree Diagonal Ribbon Band with Horizontal Top Cut & Vertical Right Cut */}
        <polygon
          points="24,0 78,0 180,102 180,156"
          fill="#414c56"
          filter="url(#ribbon-drop-shadow)"
        />

        {/* 45-Degree Angled Text inside Ribbon */}
        <g transform="rotate(45 102 54)">
          <text
            x="102"
            y="48"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="9"
            fontWeight="600"
            letterSpacing="0.2em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            POWERED BY
          </text>
          <text
            x="102"
            y="64"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="13.5"
            fontWeight="800"
            letterSpacing="0.1em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            NORTHFIELD
          </text>
        </g>
      </svg>
    </div>
  );
}
