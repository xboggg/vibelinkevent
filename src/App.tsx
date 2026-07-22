import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { usePageTracking } from "@/hooks/usePageTracking";
import { Loader2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";

// Index page is eager-loaded because it's the most common entry point
// and prerendered — lazy would defeat the prerender warmup.
import Index from "./pages/Index";

// Every other route is code-split so the initial bundle only ships what
// the current URL needs. Admin gets its own big chunk (Tiptap + heavy
// admin panels) instead of loading with every visitor.
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioDetail = lazy(() => import("./pages/PortfolioDetail"));
const Designs = lazy(() => import("./pages/Designs"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const BlogSeriesIndex = lazy(() => import("./pages/BlogSeriesIndex"));
const BlogSeriesDetail = lazy(() => import("./pages/BlogSeriesDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const Survey = lazy(() => import("./pages/Survey"));
const InvoiceView = lazy(() => import("./pages/InvoiceView"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Preview = lazy(() => import("./pages/Preview"));
const StoryPreview = lazy(() => import("./pages/StoryPreview"));
const ServicesPreview = lazy(() => import("./pages/ServicesPreview"));
const WeddingPreview = lazy(() => import("./pages/WeddingPreview"));
const DesignsPreview = lazy(() => import("./pages/DesignsPreview"));
const BlogArticlePreview = lazy(() => import("./pages/BlogArticlePreview"));
const BookConsultation = lazy(() => import("./pages/BookConsultation"));
const Referral = lazy(() => import("./pages/Referral"));
const WeddingInvitations = lazy(() => import("./pages/events/WeddingInvitations"));
const EngagementInvitations = lazy(() => import("./pages/events/EngagementInvitations"));
const FuneralPrograms = lazy(() => import("./pages/events/FuneralPrograms"));
const NamingCeremony = lazy(() => import("./pages/events/NamingCeremony"));
const GraduationInvitations = lazy(() => import("./pages/events/GraduationInvitations"));
const BirthdayInvitations = lazy(() => import("./pages/events/BirthdayInvitations"));
const AnniversaryInvitations = lazy(() => import("./pages/events/AnniversaryInvitations"));
const ChurchEvents = lazy(() => import("./pages/events/ChurchEvents"));
const CorporateEvents = lazy(() => import("./pages/events/CorporateEvents"));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

// Page tracking wrapper component
const PageTracker = ({ children }: { children: React.ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <PageTracker>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
              <Route path="/designs" element={<Designs />} />
              {/* Back-compat: old /templates URLs redirect to /designs */}
              <Route path="/templates" element={<Navigate to="/designs" replace />} />
              <Route path="/templates/:slug" element={<TemplateDetail />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/portfolio-preview" element={<Preview />} />
              <Route path="/story-preview" element={<StoryPreview />} />
              <Route path="/services-preview" element={<ServicesPreview />} />
              <Route path="/wedding-preview" element={<WeddingPreview />} />
              <Route path="/designs-preview" element={<DesignsPreview />} />
              <Route path="/blog-preview/graduating-in-ghana" element={<BlogArticlePreview />} />
              <Route path="/book-consultation" element={<BookConsultation />} />
              <Route path="/ref/:code" element={<Referral />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/wedding-invitations" element={<WeddingInvitations />} />
              <Route path="/engagement-invitations" element={<EngagementInvitations />} />
              <Route path="/funeral-programs" element={<FuneralPrograms />} />
              <Route path="/naming-ceremony" element={<NamingCeremony />} />
              <Route path="/graduation" element={<GraduationInvitations />} />
              <Route path="/birthday" element={<BirthdayInvitations />} />
              <Route path="/anniversary-invitations" element={<AnniversaryInvitations />} />
              <Route path="/church-events" element={<ChurchEvents />} />
              <Route path="/corporate-events" element={<CorporateEvents />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/series" element={<BlogSeriesIndex />} />
              <Route path="/blog/series/:slug" element={<BlogSeriesDetail />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/my-orders" element={<CustomerPortal />} />
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="/survey/:token" element={<Survey />} />
              <Route path="/invoice/:invoiceNumber" element={<InvoiceView />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </PageTracker>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
