import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@workspace/api-client-react": path.resolve(import.meta.dirname, "src/api-client-react/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Recharts only used in admin — isolate it so storefront users never download it
          if (id.includes("recharts") || id.includes("victory-vendor")) {
            return "recharts";
          }
          // Keep React core in its own chunk — cached across deployments
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-core";
          }
          // Radix UI primitives in one vendor chunk
          if (id.includes("@radix-ui")) {
            return "radix-ui";
          }
          // Framer Motion separate — only loads on pages that animate
          if (id.includes("framer-motion")) {
            return "framer-motion";
          }
        },
      },
    },
  },
});
