import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Star, Check, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
  "Beautiful digital invitation delivered in 5–7 days",
  "Share via WhatsApp — no app download needed",
  "RSVP tracking, countdown timer & photo gallery",
  "Works for weddings, funerals, naming ceremonies & more",
  "Packages from GHS 1,200",
];

export default function Referral() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const refCode = code || searchParams.get("ref") || "";
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    if (!refCode) return;
    supabase
      .from("referral_codes")
      .select("referrer_name, code")
      .eq("code", refCode.toUpperCase())
      .single()
      .then(({ data }) => {
        if (data?.referrer_name) setReferrerName(data.referrer_name);
      });
  }, [refCode]);

  const ctaHref = refCode
    ? `/get-started?ref=${encodeURIComponent(refCode.toUpperCase())}`
    : "/get-started";

  return (
    <Layout>
      <SEO
        title="You've Been Invited — VibeLink Event"
        description="Someone who loves VibeLink thinks you need a stunning digital invitation for your next event. Get started today."
        canonical={refCode ? `/ref/${refCode}` : "/referral"}
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 lg:px-8 relative py-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-sm font-semibold mb-6">
                <Gift className="h-4 w-4" />
                {referrerName ? `${referrerName} thinks you'll love this` : "You've been referred"}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your event deserves a{" "}
                <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">
                  stunning
                </span>{" "}
                digital invitation
              </h1>

              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Stop sending JPEG files. VibeLink turns your event invitation into a living digital experience — shareable in seconds, beautiful on any device.
              </p>

              <ul className="space-y-3 mb-10">
                {benefits.map((b, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3 text-white/80 text-sm">
                    <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    {b}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8">
                  <Link to={ctaHref}>
                    Get My Invitation <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/portfolio">See Examples</Link>
                </Button>
              </div>

              {refCode && (
                <p className="mt-4 text-white/40 text-xs">
                  Referral code <span className="text-secondary font-mono font-bold">{refCode.toUpperCase()}</span> will be applied automatically
                </p>
              )}
            </motion.div>

            {/* Right — social proof */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "500+", label: "Events Created" },
                  { value: "98%", label: "Satisfaction" },
                  { value: "48hr", label: "Rush Delivery" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-secondary">{s.value}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Testimonials */}
              {[
                { text: "The invitation was so beautiful, guests kept sharing it on WhatsApp. We got 200+ RSVPs!", name: "Abena K.", event: "Wedding, Accra" },
                { text: "Our funeral program page was dignified and easy to share with family abroad. Truly touched our hearts.", name: "Kofi M.", event: "Memorial, Kumasi" },
                { text: "I couldn't believe how professional it looked. Worth every pesewa!", name: "Sandra A.", event: "Naming Ceremony" },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />)}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed mb-2">"{t.text}"</p>
                  <p className="text-white/40 text-xs font-medium">{t.name} · {t.event}</p>
                </motion.div>
              ))}

              {/* Referred by badge */}
              {referrerName && (
                <div className="bg-secondary/15 border border-secondary/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-white/80 text-sm">
                    <span className="font-bold text-secondary">{referrerName}</span> referred you. They'll earn a reward when you place your order!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
