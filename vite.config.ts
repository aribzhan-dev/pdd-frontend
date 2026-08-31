import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The API and its media are served by pdd_backend; proxying them in dev keeps
// the browser on a single origin, so no CORS preflight and no absolute URLs.
export default defineConfig({
  plugins: [react()],
  build: {
    // No source maps in the shipped bundle: they would publish the readable
    // original source next to the minified build.
    sourcemap: false,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/media": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
