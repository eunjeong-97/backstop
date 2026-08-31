import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111418",
        sub: "#5b636e",
        line: "#e4e7ec",
        bg: "#fbfbfc",
        high: "#c8322b",
        mid: "#b06a12",
        low: "#5b636e",
      },
    },
  },
  plugins: [],
} satisfies Config;
