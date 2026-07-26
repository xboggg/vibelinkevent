import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { MessageCircle as MessageCircleIcon, Mail, MapPin, Clock, HelpCircle, Loader2, Sparkles, Send, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppFAQ } from "@/components/WhatsAppFAQ";

const faqs = [
  {
    question: "How long does it take to create my digital invitation?",
    answer: "Delivery across all packages is 5-10 business days from when you provide all required details. Need it faster? We offer a 48-hour express delivery option available at an additional fee.",
  },
  {
    question: "Can I make changes after my invitation is created?",
    answer: "Yes, revisions are included in every package. The Starter plan includes 1 revision round, Classic includes 2, Prestige includes 5, and Royal includes unlimited revisions. Additional revision rounds beyond your plan can be purchased as an add-on.",
  },
  {
    question: "How do guests access my digital invitation?",
    answer: "Your invitation comes with a unique link that you can share via WhatsApp, SMS, email, or social media. Guests simply click the link to view all event details on any device.",
  },
  {
    question: "Do you serve clients outside Ghana?",
    answer: "Absolutely. We serve Ghanaian families and organisations wherever they are — Accra to London, Toronto, New York, Berlin, and beyond. Every invitation includes international sharing options and works on any device worldwide, and we chat freely on WhatsApp across time zones.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept MTN Mobile Money, bank transfers, and international card or bank transfer payments for clients outside Ghana.",
  },
  {
    question: "Can I collect contributions through the invitation?",
    answer: "Yes! We can integrate Mobile Money collection directly into your invitation, making it easy for guests to contribute and for you to track all donations transparently.",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your name (at least 2 characters)";
    }
    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Please enter a message (at least 10 characters)";
    }
    if (formData.message.length > 1000) {
      newErrors.message = "Message must be less than 1000 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppSubmit = () => {
    if (!validateForm()) {
      const firstError = document.querySelector('[class*="border-destructive"]') as HTMLElement;
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      toast({
        title: "Almost there!",
        description: "Please fill in your name and message before sending.",
        variant: "destructive",
      });
      return;
    }

    const message = `Hi VibeLink! 👋\n\n*Name:* ${formData.name.trim()}${formData.email ? `\n*Email:* ${formData.email.trim()}` : ""}${formData.eventType ? `\n*Event Type:* ${formData.eventType}` : ""}\n\n*Message:*\n${formData.message.trim()}`;

    window.open(`https://wa.me/4915757178561?text=${encodeURIComponent(message)}`, "_blank");

    toast({
      title: "Opening WhatsApp",
      description: "Complete your message in WhatsApp to reach us!",
    });

    setFormData({ name: "", email: "", eventType: "", message: "" });
    setErrors({});
  };

  const handleEmailSubmit = async () => {
    if (!validateForm()) {
      const firstError = document.querySelector('[class*="border-destructive"]') as HTMLElement;
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      toast({
        title: "Almost there!",
        description: "Please fill in your name and message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-message", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          eventType: formData.eventType.trim() || undefined,
          message: formData.message.trim(),
        },
      });

      if (error || (data && (data as { error?: string }).error)) {
        throw new Error((data as { error?: string })?.error ?? error?.message ?? "Failed to send");
      }

      toast({
        title: "Message sent",
        description: formData.email
          ? "We've sent you a confirmation email. We'll respond within 24 hours."
          : "Thank you. Our team will respond shortly.",
      });

      setFormData({ name: "", email: "", eventType: "", message: "" });
      setErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Could not send",
        description: `${msg}. Please try WhatsApp instead.`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us"
        description="Get in touch with VibeLink Event. Reach us via WhatsApp for quick responses or send us an email. We're here to help with your digital invitation needs."
        keywords="contact VibeLink Event, digital invitations help, WhatsApp support Ghana"
        canonical="/contact"
      />
      {/* Hero — animated orbs, gradient headline, pulsing trust badge */}
      <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-28 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A] overflow-hidden">
        {/* Animated floating orbs */}
        <motion.div
          className="absolute top-20 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-10 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sparkle particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/60"
            style={{
              left: `${15 + i * 13}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}

        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Pulsing trust badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-white/90 text-sm font-medium">We usually reply within 24 hours</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Let's build{" "}
              <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">
                something
              </span>
              {" "}beautiful
            </h1>
            <p className="text-white/80 text-lg lg:text-xl max-w-2xl mx-auto">
              A question, a quote, a vision — send it our way. Wherever you are in Ghana or the diaspora, we're one message away.
            </p>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" preserveAspectRatio="none" className="block w-full h-[50px] md:h-[80px]">
            <path
              d="M0 100L60 90C120 80 240 60 360 55C480 50 600 60 720 62.5C840 65 960 60 1080 55C1200 50 1320 55 1380 57.5L1440 60V100H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Contact Info Cards — 3 colour-themed cards. WhatsApp is a real
          click-target (opens chat). "Serving" card replaces the previous
          "Ghana Office / Germany Office" pair since we don't have a physical
          office — it names the reach honestly. Design intent: bigger cards,
          more breathing room, WhatsApp card visually pops as the primary CTA. */}
      <section className="py-14 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                type: "static" as const,
                icon: Globe, title: "Serving", detail: "Ghana & the diaspora",
                subdetail: "Accra to London, Toronto, New York, Berlin",
                grad: "from-red-500 via-yellow-400 to-emerald-500",   // Ghanaian flag palette
                text: "text-emerald-700 dark:text-emerald-400",
                border: "border-emerald-200/70 dark:border-emerald-900/50",
                glow: "shadow-emerald-500/25",
              },
              {
                type: "whatsapp" as const,
                chatHref: "https://wa.me/4915757178561",
                icon: MessageCircleIcon, title: "WhatsApp", detail: "+49 157 5717 8561",
                subdetail: "Chat or call · free worldwide · fastest reply",
                grad: "from-emerald-400 via-green-500 to-green-600",
                text: "text-green-700 dark:text-green-400",
                border: "border-green-200/70 dark:border-green-900/50",
                glow: "shadow-green-500/40",
                featured: true,  // slightly bigger and more prominent
              },
              {
                type: "static" as const,
                icon: Zap, title: "Response Time", detail: "Within 24 hours",
                subdetail: "Mon–Fri 9am–5pm · Sat 10am–2pm GMT",
                grad: "from-violet-500 via-purple-500 to-fuchsia-600",
                text: "text-violet-700 dark:text-violet-400",
                border: "border-violet-200/70 dark:border-violet-900/50",
                glow: "shadow-violet-500/25",
              },
            ].map((card, i) => {
              const isWhatsApp = card.type === "whatsapp";
              const commonClasses = `group relative text-center p-7 lg:p-8 rounded-2xl bg-card border ${card.border} shadow-sm hover:shadow-2xl ${card.glow} transition-all duration-300 ${card.featured ? 'md:-translate-y-2 ring-1 ring-green-500/20' : ''}`;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: isWhatsApp ? -8 : -6, scale: isWhatsApp ? 1.03 : 1.02 }}
                  className={commonClasses}
                >
                  {/* Coloured accent bar on top */}
                  <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${card.grad}`} />

                  {/* Icon badge with gradient — floats subtly */}
                  <motion.div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${card.grad} flex items-center justify-center mb-5 shadow-lg`}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  >
                    <card.icon className="h-7 w-7 text-white" strokeWidth={2.25} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-1.5">{card.title}</h3>
                  <p className={`${card.text} text-base font-semibold mb-1`}>{card.detail}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{card.subdetail}</p>

                  {/* WhatsApp card: single Chat action.
                      Opens wa.me — once in WhatsApp, the user can
                      voice/video-call from inside the app natively. */}
                  {isWhatsApp && card.chatHref && (
                    <div className="mt-5 pt-4 border-t border-border/60">
                      <a
                        href={card.chatHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-br ${card.grad} text-white text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-110 transition-all`}
                      >
                        <MessageCircleIcon className="h-4 w-4" strokeWidth={2.25} />
                        Chat on WhatsApp
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section — soft gradient background, glass card with animated gradient border */}
      <section className="relative py-14 lg:py-20 bg-gradient-to-br from-purple-50 via-background to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20 overflow-hidden">
        {/* Soft ambient orb (outside the section clipping - safe because no overflow-hidden) */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
              >
                <MessageCircleIcon className="h-8 w-8 text-white" strokeWidth={2.25} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Get In{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Have a question or want to discuss your event? Send us a message — we reply on WhatsApp or email within 24 hours.
              </p>
            </motion.div>

            {/* Animated gradient border wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl p-[2px] bg-gradient-to-r from-primary via-secondary to-pink-500 shadow-xl shadow-primary/20"
            >
              <div className="p-6 md:p-8 rounded-[calc(1.5rem-2px)] bg-card space-y-6 relative overflow-hidden">
                {/* Sparkles floating in top corner */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -right-6 text-primary/10 pointer-events-none"
                >
                  <Sparkles className="w-20 h-20" />
                </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Kwame Asante"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-destructive" : ""}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kwame@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-destructive" : ""}
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-foreground">
                  Event Type (optional)
                </Label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select event type...</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Engagement">Engagement / Customary Marriage</option>
                  <option value="Funeral / Memorial">Funeral / Memorial</option>
                  <option value="Church Event">Church Event</option>
                  <option value="Naming Ceremony">Naming Ceremony</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  Your Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event or ask any questions..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`min-h-[120px] ${errors.message ? "border-destructive" : ""}`}
                  maxLength={1000}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/1000
                </p>
              </div>

              {/* Dual Send Buttons — WhatsApp green + primary purple, both with hover-lift + shimmer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:from-[#1ebe5d] hover:to-[#128C7E] text-white font-semibold shadow-md hover:shadow-lg shadow-green-500/30 transition-all"
                >
                  <svg className="h-5 w-5 mr-2 fill-white flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Send via WhatsApp
                </Button>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={isSending}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-md hover:shadow-lg shadow-primary/30 transition-all disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                </motion.div>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section — coloured icon, animated accordion cards */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
            >
              <HelpCircle className="h-8 w-8 text-white" strokeWidth={2.25} />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know before we get started.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <WhatsAppFAQ faqs={faqs} intro="Hi 👋 Here are the questions we hear most often — tap one to see the answer." />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-10"
            >
              <p className="text-muted-foreground text-sm mb-3">Looking for more answers?</p>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
              >
                View Full FAQ Page →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
