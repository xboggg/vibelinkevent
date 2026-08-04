import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ChatWidget } from "@/components/ChatWidget";
import { CookieBanner } from "@/components/CookieBanner";

interface LayoutProps {
  children: React.ReactNode;
}

// Routes where the fixed FAB stack (ChatWidget + FloatingWhatsApp) overlays
// right-aligned numeric content the customer needs to read — the pricing
// calculator estimate panel and the get-started wizard order summary.
// Audit finding H3: FABs were literally truncating the total price mid-word.
const HIDE_FAB_ROUTES = ["/pricing", "/get-started"];

export function Layout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { pathname } = useLocation();
  const hideFab = HIDE_FAB_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip-to-content link — visually hidden until it receives focus
          (Tab from address bar). Keyboard and screen-reader users can jump
          past the persistent Navbar straight to the main content. Standard
          WCAG 2.4.1 bypass-blocks pattern. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      {!hideFab && <ChatWidget onOpenChange={setIsChatOpen} />}
      <AnimatePresence>
        {!isChatOpen && !hideFab && <FloatingWhatsApp />}
      </AnimatePresence>
      <ScrollToTop />
      <CookieBanner />
    </div>
  );
}
