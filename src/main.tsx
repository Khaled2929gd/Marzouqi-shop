import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { supabase } from "./lib/supabase";

// Initialize Supabase client early to ensure singleton pattern
// This prevents multiple client instances from being created during HMR
if (import.meta.env.DEV) {
  // Force initialization in development to avoid lock conflicts
  void supabase.auth.getSession();
}

createRoot(document.getElementById("root")!).render(<App />);
