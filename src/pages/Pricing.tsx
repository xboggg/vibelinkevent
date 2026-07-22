import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { Check, X, Star, MessageCircle, Sparkles, Crown, Percent, Gift, Users, Banknote, ArrowRight, Calculator, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";
import {
  EVENT_PACKAGES,
  UNIVERSAL_ADDONS,
  getNonBespokePackages,
  getStartingPriceLabel,
  type EventPackage,
} from "@/data/eventPackages";

const pricingBreadcrumb = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Pricing", url: "/pricing" },
]);

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "VibeLink Digital Invitations",
  description: "Digital event invitations for weddings, funerals, naming ceremonies in Ghana",
  brand: {
    "@type": "Brand",
    name: "VibeLink Event",
  },
  offers: EVENT_PACKAGES.map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: String(p.price),
    priceCurrency: "GHS",
    description: p.tagline,
  })),
};

// Rendered pricing cards — derived from the canonical EVENT_PACKAGES source.
// Each event package is shown as a card with its own features + price.
// The Bespoke package sits at the end as the premium/custom option.
const packages = EVENT_PACKAGES.map((p) => ({
  name: p.name,
  slug: p.slug,
  price: p.priceLabel,
  description: p.tagline,
  popular: !!p.popular,
  color: p.popular
    ? "border-secondary"
    : p.id === "bespoke"
    ? "border-amber-500/50"
    : "border-border",
  features: p.features.map((f) => ({ name: f, included: true })),
  excluded: [] as string[],
  quoteOnly: !!p.quoteOnly,
  eventPageRoute: p.eventPageRoute,
}));

// Universal add-ons (available on any non-Bespoke package).
// Event-specific add-ons are shown on each event's page.
const addOns = UNIVERSAL_ADDONS.map((a) => ({
  name: a.name,
  price: `GHS ${a.price.toLocaleString()}`,
  desc: a.description,
}));

// Calculator uses non-Bespoke packages only (Bespoke is quote-only).
// Keep `slug` so we can pass it through to /get-started as a URL param.
const calcPackages = getNonBespokePackages().map((p) => ({
  slug: p.slug,
  name: p.name,
  price: p.price,
}));

// Universal add-ons — keep the numeric id so we can pass to /get-started.
const calcAddOns = UNIVERSAL_ADDONS.map((a) => ({
  id: a.id,
  name: a.name,
  price: a.price,
}));

function PricingCalculator() {
  // Track selection by package NAME (unique) — earlier version keyed by price,
  // which caused all packages sharing the same price (Engagement, Funeral,
  // Milestone Birthday, Church all at GHS 2,000) to highlight together.
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<"full" | "split">("full");
  const [refCode, setRefCode] = useState("");

  const selectedPackageObj = selectedPackage
    ? calcPackages.find((p) => p.name === selectedPackage)
    : undefined;
  const packageTotal = selectedPackageObj?.price ?? 0;
  const addOnsTotal = selectedAddOns.reduce((sum, name) => {
    const a = calcAddOns.find(x => x.name === name);
    return sum + (a?.price ?? 0);
  }, 0);
  const grandTotal = packageTotal + addOnsTotal;
  const deposit = Math.ceil(grandTotal * 0.5 / 10) * 10;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Price Calculator</h2>
          <p className="text-muted-foreground">Build your package and see your total instantly</p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Selector */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Package */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Step 1 — Choose Package</p>
              <div className="grid grid-cols-2 gap-3">
                {calcPackages.map(pkg => {
                  const isSelected = selectedPackage === pkg.name;
                  return (
                    <button
                      key={pkg.name}
                      onClick={() => setSelectedPackage(pkg.name)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/40 bg-background"
                      }`}
                    >
                      <p className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{pkg.name}</p>
                      <p className="text-lg font-black text-foreground mt-0.5">GHS {pkg.price.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Add-ons */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-primary">Step 2 — Add-ons (optional)</p>
                {selectedAddOns.length > 0 && (
                  <button onClick={() => setSelectedAddOns([])} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                    <Trash2 className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {calcAddOns.map(addon => (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddOn(addon.name)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                      selectedAddOns.includes(addon.name)
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-secondary/40 bg-background"
                    }`}
                  >
                    <span className={`text-xs font-medium truncate ${selectedAddOns.includes(addon.name) ? "text-secondary" : "text-foreground"}`}>{addon.name}</span>
                    <span className="text-xs font-bold text-muted-foreground ml-2 flex-shrink-0">+{addon.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Plan */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Step 3 — Payment Plan</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentPlan("full")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${paymentPlan === "full" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <p className={`font-bold text-sm ${paymentPlan === "full" ? "text-primary" : "text-foreground"}`}>Full Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">Priority processing + FREE Save the Date</p>
                </button>
                <button
                  onClick={() => setPaymentPlan("split")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${paymentPlan === "split" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <p className={`font-bold text-sm ${paymentPlan === "split" ? "text-primary" : "text-foreground"}`}>50% + 50%</p>
                  <p className="text-xs text-muted-foreground mt-1">Pay deposit now, balance before delivery</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Your Estimate</p>

              {selectedPackage === null ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">Select a package to see your total</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{selectedPackage}</span>
                      <span className="font-semibold">GHS {packageTotal.toLocaleString()}</span>
                    </div>
                    {selectedAddOns.map(name => {
                      const a = calcAddOns.find(x => x.name === name);
                      return (
                        <div key={name} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate max-w-[160px]">{name}</span>
                          <span className="font-semibold flex-shrink-0">+{a?.price.toLocaleString()}</span>
                        </div>
                      );
                    })}
                    {selectedAddOns.length > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground border-t border-border pt-2">
                        <span>Add-ons ({selectedAddOns.length})</span>
                        <span>GHS {addOnsTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="text-2xl font-black text-primary">GHS {grandTotal.toLocaleString()}</span>
                    </div>
                    {paymentPlan === "split" && (
                      <div className="mt-2 p-3 bg-secondary/10 rounded-xl">
                        <p className="text-xs text-secondary font-semibold">50% deposit to start</p>
                        <p className="text-lg font-black text-secondary">GHS {deposit.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Balance: GHS {(grandTotal - deposit).toLocaleString()} before delivery</p>
                      </div>
                    )}
                  </div>

                  {/* Referral/coupon code */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Referral code (optional)"
                      value={refCode}
                      onChange={e => setRefCode(e.target.value.toUpperCase())}
                      className="flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      maxLength={20}
                    />
                  </div>

                  <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <Link
                      to={(() => {
                        // Carry the customer's selections into the order form so
                        // they don't have to re-pick everything after clicking
                        // Get Started. See GetStarted.tsx URL-param reader.
                        const params = new URLSearchParams();
                        if (selectedPackageObj?.slug) params.set("package", selectedPackageObj.slug);
                        const addonIds = selectedAddOns
                          .map((name) => calcAddOns.find((a) => a.name === name)?.id)
                          .filter(Boolean) as string[];
                        if (addonIds.length) params.set("addons", addonIds.join(","));
                        if (paymentPlan) params.set("plan", paymentPlan);
                        if (refCode) params.set("ref", refCode);
                        const q = params.toString();
                        return `/get-started${q ? `?${q}` : ""}`;
                      })()}
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">Prices in GHS. Final quote confirmed via WhatsApp.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Pricing = () => {
  const renderCellValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
            <Check className="h-4 w-4 text-accent" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center">
            <X className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
        {value}
      </span>
    );
  };

  return (
    <Layout>
      <SEO
        title="Pricing"
        description="Digital invitation packages for every Ghanaian event — weddings from GHS 2,500, funerals from GHS 2,000, birthdays from GHS 1,200. Every package built specifically for its event type."
        keywords="digital invitation prices Ghana, wedding invitation cost, event invitation packages Accra"
        canonical="/pricing"
        ogImage="https://vibelinkevent.com/og-pricing.jpg"
        jsonLd={[pricingSchema, pricingBreadcrumb]}
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
              One package per event, priced to match
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Pricing Built for Your Event
            </h1>
            <p className="text-primary-foreground/80 text-base lg:text-lg">
              Every event is different — so is every package. Pick the event you're planning and get exactly the features it needs. No stripped-down tiers, no confusing upgrades.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Templates CTA Banner */}
      <section className="py-5 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <p className="text-sm lg:text-base text-amber-900">
                <strong className="font-bold">Already know the look you want?</strong> Browse all our designs by event type, preview live, and order.
              </p>
            </div>
            <Link
              to="/designs"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-colors whitespace-nowrap"
            >
              Browse Designs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-5 rounded-2xl border-2 ${pkg.color} bg-card ${
                  pkg.popular ? "shadow-xl ring-2 ring-secondary/20" : "hover:shadow-lg"
                } transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 pt-1">
                  <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                  <p className="text-muted-foreground text-xs mb-3">{pkg.description}</p>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">{pkg.price}</div>
                </div>

                <ul className="space-y-2 mb-5">
                  {pkg.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2 text-xs lg:text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${feature.highlight ? "text-secondary" : "text-green-500"}`} />
                      <span className={feature.highlight ? "text-secondary font-medium" : "text-foreground"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                  {pkg.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs lg:text-sm">
                      <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/60">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={pkg.popular ? "gold" : "outline"}
                  className="w-full"
                  size="sm"
                >
                  <Link to={pkg.quoteOnly ? "/contact" : `/get-started?package=${encodeURIComponent(pkg.slug)}`}>
                    {pkg.quoteOnly ? "Get Custom Quote" : "Get Started"}
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  Money-back guarantee
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <PricingCalculator />

      {/* Add-ons Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Enhance Your Invitation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Add extra features to make your invitation even more special
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addOns.map((addon, index) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-medium text-sm block truncate">{addon.name}</span>
                    <span className="text-muted-foreground text-xs">{addon.desc}</span>
                  </div>
                  <span className="text-primary font-bold text-sm whitespace-nowrap ml-3 group-hover:text-secondary transition-colors">
                    {addon.price}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Plans */}
      <section className="py-14 bg-gradient-to-b from-muted/30 via-background to-muted/20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Pay Your Way
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Flexible Payment Options</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We understand budgets. Choose a payment plan that works best for you.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <div className="relative p-6 rounded-2xl bg-card border-2 border-green-500/30 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                      RECOMMENDED
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-1">Full Payment</h4>
                  <div className="text-4xl font-bold text-green-500 mb-3">100%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Pay once and relax. Your invitation gets priority processing.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Priority queue - we start immediately</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Free "Save the Date" teaser in 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>No follow-up payments to worry about</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 50/50 Split Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <div className="relative p-6 rounded-2xl bg-card border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Percent className="h-6 w-6 text-purple-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold">
                      FLEXIBLE
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-1">Split Payment</h4>
                  <div className="text-4xl font-bold text-purple-500 mb-3">50% + 50%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Split your payment in two. Pay half now, half before delivery.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>50% deposit to start your project</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>Review draft before final payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>Balance due before final delivery</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Animated Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Secure MoMo & Card Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-purple-500" />
                </div>
                <span>Money-Back Guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Refer & Earn Section */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-3">
              Refer & Earn
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Share the Vibe, Earn Cash
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Know someone planning an event? Refer them to VibeLink and earn real money when they order!
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              {[
                {
                  step: "1",
                  icon: Users,
                  title: "Get Your Code",
                  description: "Log into your Customer Portal and grab your unique referral code"
                },
                {
                  step: "2",
                  icon: MessageCircle,
                  title: "Share With Friends",
                  description: "Send your referral link via WhatsApp, Facebook, or any platform"
                },
                {
                  step: "3",
                  icon: Banknote,
                  title: "Earn Cash",
                  description: "When they complete an order, you earn cash sent to your MoMo!"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all group"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-sm font-bold shadow-lg">
                      {item.step}
                    </span>
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <item.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Earnings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 border border-secondary/30">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Gift className="h-6 w-6 text-secondary" />
                  <h4 className="text-xl font-bold text-foreground">Your Earnings Per Referral</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { package: "Any small event", reward: "GHS 100", color: "from-blue-500 to-cyan-500" },
                    { package: "Wedding / Corporate", reward: "GHS 250", color: "from-purple-500 to-pink-500" },
                    { package: "Bespoke", reward: "GHS 500", color: "from-amber-500 to-orange-500" }
                  ].map((tier, index) => (
                    <motion.div
                      key={tier.package}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="text-muted-foreground text-sm mb-1">When they order</p>
                      <p className="font-semibold text-foreground mb-2">{tier.package}</p>
                      <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${tier.color} text-white font-bold text-lg shadow-lg`}>
                        {tier.reward}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    No limits on referrals. The more you share, the more you earn!
                  </p>
                  <Button asChild variant="gold" size="lg" className="group">
                    <Link to="/customer-portal">
                      Get Your Referral Code
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-2">Not sure which to choose?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tell us about your event and we will recommend the perfect package for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="default" size="default">
                <Link to="/get-started">Get a Recommendation</Link>
              </Button>
              <Button asChild variant="outline" size="default">
                <a href="https://wa.me/4915757178561" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Pricing;

