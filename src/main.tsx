import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Opt out of browser scroll-restoration. Browsers default to 'auto', which
// silently restores a saved scroll position on any navigation-adjacent
// event (history entry change, tab-return, back/forward). On /admin this
// was wiping the user's scroll position back to 0 whenever they tabbed
// away and returned. Confirmed 2026-07-25 via tracer: the scroll event
// fired with no matching JS scroll call in the stack.
// Setting 'manual' hands scroll behaviour to the app; existing site-wide
// ScrollToTop component still snaps to top on real route changes.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(<App />);
