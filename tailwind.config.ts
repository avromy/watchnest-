import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        nest: {
          50: "#f4fbf8",
          100: "#def7ed",
          500: "#25a979",
          700: "#157055",
          900: "#0c3b31"
        }
      }
    }
  },
  plugins: []
};

export default config;
