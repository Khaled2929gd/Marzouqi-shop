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
      "@workspace/api-client-react": path.resolve(
        import.meta.dirname,
        "src/api-client-react/index.ts",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  esbuild: {
    drop: ["console", "debugger"],
    legalComments: "none",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    cssMinify: true,
    minify: "esbuild",
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("recharts") || id.includes("victory-vendor"))
            return "recharts";
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          )
            return "react-core";
          if (id.includes("@radix-ui")) return "radix-ui";
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "tanstack-query";
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("zod")
          )
            return "forms";
        },
      },
    },
  },
});
