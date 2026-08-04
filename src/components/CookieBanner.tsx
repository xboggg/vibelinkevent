import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

// Cookie consent banner. Google Analytics is initialised in index.html with
// `analytics_storage: denied` by default under Consent Mode v2, so no
// cookies are set until the visitor makes a choice here. On accept we
// update consent to granted; on reject we persist the "declined" state so
// we don't nag on every page visit. See index.html for the paired script.
const STORAGE_KEY = "vl-cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function CookieBanner() {
  // Undecided = null, otherwise "accepted" | "declined"
  const [decision, setDecision] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDecision(localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage blocked (private mode) — show the banner every visit
      setDecision(null);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch { /* ignore */ }
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    setDecision("accepted");
  };

  const reject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch { /* ignore */ }
    // Explicit denied — belt-and-braces even though default is already denied
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    setDecision("declined");
  };

  // Don't render on the server or before we've read the persisted decision.
  // Also don't render if the user has already decided.
  if (!mounted || decision !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-0 left-0 right-0 z-[70] p-3 md:p-4 pointer-events-none"
      >
        <div className="pointer-events-auto max-w-4xl mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed">
                We use cookies to understand how our site is used and to make it better.
                {" "}
                <Link
                  to="/cookies"
                  className="underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Cookie policy
                </Link>
                .
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 justify-end">
              <button
                type="button"
                onClick={reject}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground/80 hover:bg-muted transition-colors"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={accept}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={reject}
                aria-label="Close and reject non-essential cookies"
                className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
