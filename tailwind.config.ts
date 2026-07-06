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
        // Identité Institutionnelle FrieslandCampina (Remplace l'ancien bleu générique)
        brand: {
          50: "#f0f6fc",
          100: "#e1ecf7",
          200: "#b8d4ee",
          300: "#7fb2e0",
          400: "#408ece",
          500: "#005CA9", // Bleu Royal FrieslandCampina officiel
          600: "#004b8c",
          700: "#003c71",
          800: "#00335e",
          900: "#012b4e",
          950: "#001b33",
        },
        // Identité Visuelle Bonnet Rouge (Idéal pour l'action, l'urgence et le terrain)
        accent: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#D32F2F", // Rouge Bonnet Rouge officiel
          600: "#B71C1C", // Rouge Foncé pour les états de survol
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#450a0a",
        },
        // Palettes secondaires spécifiques à la marque FrieslandCampina / Bonnet Rouge
        bonnetRouge: {
          gold: "#FBC02D",   // Or/Jaune iconique (Notation, NPS, Étoiles)
          cream: "#FFFDE7",  // Blanc crème (Fonds de carte légers, Onboarding)
          green: "#009639",  // Vert FrieslandCampina (Indicateurs positifs, "Synchronisé")
        }
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