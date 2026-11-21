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
        ucteknik: {
          blue: "#0A2540",
          navy: "#06182a",
          teal: "#087F72",
          amber: "#F4A261",
          crimson: "#E76F51",
          slate: "#F8FAFC",
          border: "#E2E8F0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
