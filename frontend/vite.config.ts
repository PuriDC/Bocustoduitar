import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      },
      // Uploaded images are written by the API and served by nginx in
      // production; in development the API serves them from the same origin.
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
