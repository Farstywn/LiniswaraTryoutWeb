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
        liniswara: {
          primary: "#0053FF",
          blue: "#0053FF",
          dark: "#213A8B",
          navy: "#0F2942",
          secondary: "#3A78B3",
          sky: "#4F97D1",
          teal: "#48C0B9",
          yellow: "#FFFD00",
          accent: "#61CE70",
          slate: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: [
          "Poppins",
          "Plus Jakarta Sans",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
