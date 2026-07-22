import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrderFormWizard } from "@/components/order-form/OrderFormWizard";
import { OrderFormData } from "@/data/orderFormData";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Gift, Clock, MessageCircle, Shield, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { portfolioItems } from "@/data/portfolioItems";
import { templates as tieredTemplates } from "@/data/templatesData";
import { getPackageById, EventPackageId } from "@/data/eventPackages";

// Look up a design by slug across both data sources so we can show a friendly
// "You picked X" banner when the visitor came from /designs.
function findDesignBySlug(slug: string) {
  const fromPortfolio = portfolioItems.find((p) => p.slug === slug);
  if (fromPortfolio) return { title: fromPortfolio.title, image: fromPortfolio.image };
  const fromTemplates = tieredTemplates.find((t) => t.slug === slug);
  if (fromTemplates) return { title: fromTemplates.name, image: fromTemplates.thumbnail };
  return null;
}

const GetStarted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  const packageParam = searchParams.get("package") || "";
  const addonsParam = searchParams.get("addons") || "";
  const templateSlug = searchParams.get("template") || "";
  const pickedDesign = templateSlug ? findDesignBySlug(templateSlug) : null;

  // Look up the actual EventPackage the customer picked on the /pricing calculator
  // so we can pre-fill event type + package on the wizard and skip past those steps.
  const preselectedPkg = packageParam ? getPackageById(packageParam as EventPackageId) : undefined;
  // OrderFormWizard stores selectedPackage as the package ID (slug), not display
  // name — that's what PackageStep / calculateTotal look up against.
  const preselectedPackage = preselectedPkg?.id || "";
  const preselectedEventType = preselectedPkg?.id || "";

  // Calculator addon IDs → order-form addon IDs. The calculator uses the
  // UNIVERSAL_ADDONS set (eventPackages.ts) but the order form uses the addOns
  // set (orderFormData.ts) which is a different catalogue with different prices.
  // We only carry over addons that have a clean equivalent in the order form.
  const CALC_TO_FORM_ADDON: Record<string, string> = {
    "custom-domain":    "custom-domain",
    "hosting-6mo":      "hosting-6m",
    "hosting-1yr":      "hosting-1y",
    "extra-revision":   "extra-revision",
  };
  const preselectedAddons = addonsParam
    ? addonsParam.split(",").map((id) => CALC_TO_FORM_ADDON[id]).filter(Boolean)
    : [];

  const handleFormComplete = (data: OrderFormData) => {
    toast.success("Order submitted successfully! We'll contact you within 2 hours.");
    navigate("/thank-you");
  };

  const handleFormError = () => {
    toast.error("Failed to submit order. Please try again.");
  };

  return (
    <Layout>
      <SEO 
        title="Get Started"
        description="Create your digital invitation today. Fill out our simple 7-step form and receive your custom quote on WhatsApp within 2 hours."
        keywords="order digital invitation Ghana, create wedding invitation, event invitation order"
        canonical="/get-started"
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Get Started
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Let's Create Your Invitation
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl mb-6">
              Fill out the form below with your event details and style preferences.
              We'll get back to you within 2 hours with a custom quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: Clock, text: "Takes about 2 minutes" },
                { icon: MessageCircle, text: "Quote on WhatsApp in 2 hrs" },
                { icon: Shield, text: "Money-back guarantee" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-primary-foreground/70">
                  <item.icon className="h-4 w-4 text-secondary" />
                  <span>{item.text}</span>
                </div>
              ))}</div>
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <Gift className="h-4 w-4 text-secondary" />
                <span className="text-secondary text-sm font-medium">
                  Referral code applied: <strong>{referralCode}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {preselectedPkg && (
            <div className="mb-6 max-w-2xl mx-auto px-4 py-3 rounded-xl bg-secondary/15 border border-secondary/30">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  We've pre-filled your <strong className="text-secondary">{preselectedPkg.name}</strong> selection from the pricing calculator
                  {preselectedAddons.length > 0 && (
                    <> plus <strong className="text-secondary">{preselectedAddons.length} add-on{preselectedAddons.length > 1 ? "s" : ""}</strong></>
                  )}
                  . Fill in your event details and we'll get started.
                </div>
              </div>
            </div>
          )}

          {pickedDesign && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6 max-w-2xl mx-auto rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="shrink-0 w-14 h-14 rounded-lg bg-white shadow-sm overflow-hidden border border-emerald-200">
                  <img
                    src={pickedDesign.image}
                    alt={pickedDesign.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    <CheckCircle2 className="h-3 w-3" /> You picked
                  </div>
                  <p className="font-bold text-emerald-900 text-sm md:text-base truncate">{pickedDesign.title}</p>
                  <p className="text-emerald-800/70 text-xs">Let's get your details — we'll build this design for you.</p>
                </div>
                <Link
                  to="/designs"
                  className="shrink-0 hidden sm:inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline underline-offset-2"
                >
                  <ArrowLeft className="h-3 w-3" /> Change
                </Link>
              </div>
            </motion.div>
          )}
          <OrderFormWizard
            onComplete={handleFormComplete}
            initialReferralCode={referralCode}
            initialPackage={preselectedPackage}
            initialEventType={preselectedEventType}
            initialAddOns={preselectedAddons}
          />
        </div>
      </section>
    </Layout>
  );
};

export default GetStarted;
