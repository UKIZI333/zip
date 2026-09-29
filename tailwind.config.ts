import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:    "var(--color-paper)",
        paperdim: "var(--color-paperdim)",
        ink:      "var(--color-ink)",
        muted:    "var(--color-muted)",
        brass:    "var(--color-brass)",
        brassdim: "var(--color-brassdim)",
        rule:     "var(--color-rule)",
        nfdark:   "var(--color-nfdark)",
        // ZipRecruiter specific tokens
        zrdark:   "#002325",
        zrgreen:  "#45DB61",
        zrgreenhover: "#26c744",
        zremerald: "#277f6a",
        zrbg:     "#F2F4F4",
        zrborder: "#DEE1E3",
        zrmuted:  "#5D6770",
        zrgray:   "#f6f7f8",
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "Roboto", "\"Helvetica Neue\"", "Arial", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "Roboto", "\"Helvetica Neue\"", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        widest2: "0.15em",
      },
      boxShadow: {
        "2xs": "0 1px 2px rgba(0,0,0,0.04)",
        xs: "0 2px 4px rgba(0,0,0,0.06)",
        panel: "0 9px 30px 0 rgba(0,35,37,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
