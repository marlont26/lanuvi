import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf7f0",
        brand: {
          50: "#f6f3ff",
          100: "#ece6ff",
          200: "#d9cffd",
          300: "#bfaaf8",
          400: "#a184f0",
          500: "#875fe5",
          600: "#7248d1",
          700: "#5f3aae",
          800: "#4d308c",
          900: "#3f2a71",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
