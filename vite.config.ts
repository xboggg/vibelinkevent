import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Route-based code splitting is done via React.lazy() in src/App.tsx.
    // Here we additionally split large third-party vendors into their own
    // long-cachable chunks so a route bundle change doesn't invalidate them.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom", "react-router-dom"],
          "radix-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
          ],
          "tiptap": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-underline",
            "@tiptap/extension-text-align",
            "@tiptap/extension-highlight",
            "@tiptap/extension-character-count",
          ],
          "charts": ["recharts"],
          "framer": ["framer-motion"],
          "supabase": ["@supabase/supabase-js"],
          "date-fns": ["date-fns"],
        },
      },
    },
    // Higher warn threshold since we've now split things properly
    chunkSizeWarningLimit: 800,
  },
}));
