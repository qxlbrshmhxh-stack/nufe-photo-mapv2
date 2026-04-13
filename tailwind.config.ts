import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#122117",
        moss: "#31533B",
        fern: "#5E8E5A",
        mist: "#EEF4EB",
        sand: "#F4E6CC",
        coral: "#D66A52"
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(18, 33, 23, 0.12)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(18, 33, 23, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 33, 23, 0.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
