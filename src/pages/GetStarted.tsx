import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrderFormWizard } from "@/components/order-form/OrderFormWizard";
import { OrderFormData } from "@/data/orderFormData";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Gift, Clock, MessageCircle, Shield, Sparkles } from "lucide-react";

const GetStarted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  const preselectedPackage = searchParams.get("package") || "";

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
          {preselectedPackage && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/15 border border-secondary/30 max-w-2xl mx-auto">
              <Sparkles className="h-4 w-4 text-secondary flex-shrink-0" />
              <span className="text-sm text-foreground">Package pre-selected: <strong className="text-secondary">{preselectedPackage}</strong> — you can change it at step 4.</span>
            </div>
          )}
          <OrderFormWizard onComplete={handleFormComplete} initialReferralCode={referralCode} initialPackage={preselectedPackage} />
        </div>
      </section>
    </Layout>
  );
};

export default GetStarted;
