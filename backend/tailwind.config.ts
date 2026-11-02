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
        brand: {
          DEFAULT: "#09214b",
          light: "#e0a028",
          dark: "#061432",
          50: "#eef1f6",
          100: "#dce2ea",
          200: "#b9c5d5",
          300: "#96a8c0",
          400: "#506e96",
          500: "#09214b",
          600: "#081d42",
          700: "#061432",
          800: "#040e22",
          900: "#020711",
        },
        gold: {
          DEFAULT: "#e0a028",
          light: "#f3c25b",
          dark: "#b87d15",
        },
      },
      backgroundImage: {
        "admin-gradient": "radial-gradient(60rem 40rem at 110% -10%, #09214b, transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
