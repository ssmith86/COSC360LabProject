import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/search": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
  test: {
    environment: "jsdom",
    include: ["Tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
});
