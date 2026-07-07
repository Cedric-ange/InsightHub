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
        // FrieslandCampina "Bonnet Rouge" — rouge officiel comme couleur de marque.
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f2555a",
          500: "#D32F2F", // Rouge Bonnet Rouge officiel
          600: "#B71C1C", // Rouge foncé (survol / états actifs)
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#601010",
          950: "#3f0a0a",
        },
        accent: {
          // Vert FrieslandCampina — indicateurs positifs / "Synchronisé".
          500: "#009639",
          600: "#00792e",
        },
        gold: "#FBC02D", // Or iconique (notation, NPS, étoiles)
        cream: "#FFFDE7", // Blanc crème (fonds légers)
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
