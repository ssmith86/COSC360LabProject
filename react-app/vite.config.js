import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/search": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
=======
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./Tests/setup.js'],
    include: ['Tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
>>>>>>> 06b40c2578e91020af67d5bc9c53e1348abb4707
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./Tests/setup.js"],
    include: ["Tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
});
