import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Heart, Globe, Sparkles, Shield, Users, MessageCircle as MessageCircleIcon,
  Instagram, Facebook, Twitter, Linkedin, Loader2, ChevronLeft, ChevronRight,
  FileText, Smartphone, RefreshCw, MapPin, Clock, Camera, Music, Video,
  QrCode, Search, MessageSquare, ClipboardList, Radio, Flower2,
  BookOpen, Coins, CheckCircle2, XCircle, ArrowRight, Zap, ChevronDown,
  Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
}

const aboutBreadcrumb = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
]);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelink_events" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/VibelinkEvents" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/VibeLink_Events" },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@vibelink.events" },
];

const values = [
  {
    icon: Heart,
    title: "Dignity",
    description: "Every ceremony deserves respect. We treat each project with the care it deserves.",
  },
  {
    icon: Globe,
    title: "Culture",
    description: "We celebrate Ghanaian traditions and honor the unique aspects of every celebration.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "One link does everything. We believe beautiful design should be effortless to share.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Transparent pricing, reliable service. We deliver what we promise, every time.",
  },
];

const stats = [
  { value: 100, suffix: "+", label: "Invitations Created" },
  { value: 3, suffix: "", label: "Countries Reached" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 48, suffix: "hrs", label: "Fastest Delivery" },
];

const carouselImages = [
  { src: "/assets/carousel/wedding.png", label: "Weddings" },
  { src: "/assets/carousel/memorial.png", label: "Funerals" },
  { src: "/assets/carousel/church.png", label: "Church Events" },
  { src: "/assets/carousel/naming.png", label: "Naming Ceremonies" },
  { src: "/assets/carousel/birthday.png", label: "Birthdays" },
  { src: "/assets/carousel/graduation.png", label: "Graduations" },
  { src: "/assets/carousel/corporate.png", label: "Corporate Events" },
];

const paperProblems = [
  "Expensive to print in bulk",
  "Time-consuming to distribute by hand",
  "Cannot reach loved ones abroad",
  "Must reprint if details change",
];

const whatsappProblems = [
  "Images get compressed and lose quality",
  "Gets buried in busy WhatsApp chats",
  "No way to track who's coming",
  "Must reshare if details change",
  "No directions to venue",
  "Just a static picture - no interactivity",
];

// Feature tabs configuration
const featureTabs = [
  { id: "core", label: "Core", color: "primary" },
  { id: "engagement", label: "Guest", color: "pink-500" },
  { id: "media", label: "Media", color: "amber-500" },
  { id: "eventday", label: "Event Day", color: "emerald-500" },
  { id: "memorial", label: "Memorials", color: "slate-500" },
];

// Feature list organized by category
const allFeatures = [
  // Core Features
  { icon: RefreshCw, name: "Always Updated", desc: "Change details anytime - everyone sees the latest version", category: "core" },
  { icon: Globe, name: "Dedicated Webpage", desc: "A permanent link guests can bookmark and revisit", category: "core" },
  { icon: MapPin, name: "Google Maps", desc: "One-tap directions to your venue", category: "core" },
  { icon: Clock, name: "Countdown Timer", desc: "Build excitement as the day approaches", category: "core" },
  // Guest Engagement
  { icon: ClipboardList, name: "RSVP Tracking", desc: "Know exactly who's coming", category: "engagement" },
  { icon: FileText, name: "Registration Forms", desc: "Collect guest details and preferences", category: "engagement" },
  { icon: MessageSquare, name: "Guest Messaging", desc: "Direct communication with attendees", category: "engagement" },
  { icon: BookOpen, name: "Digital Guestbook", desc: "Heartfelt messages from loved ones", category: "engagement" },
  // Media
  { icon: Camera, name: "Photo Gallery", desc: "Share memories with all guests", category: "media" },
  { icon: Music, name: "Background Music", desc: "Set the mood instantly", category: "media" },
  { icon: Video, name: "Video Background", desc: "Cinematic first impressions", category: "media" },
  { icon: Radio, name: "Live Stream", desc: "Watch from anywhere in the world", category: "media" },
  // Event Day
  { icon: QrCode, name: "QR Check-in", desc: "Seamless guest scanning at the door", category: "eventday" },
  { icon: Search, name: "Lost & Found", desc: "Help recover misplaced items", category: "eventday" },
  // Memorials
  { icon: Flower2, name: "Tribute Wall", desc: "Share memories and condolences", category: "memorial" },
  { icon: BookOpen, name: "Obituary Section", desc: "Honor loved ones with dignity", category: "memorial" },
  { icon: Coins, name: "MoMo Donations", desc: "Direct contributions to the family", category: "memorial" },
];

const whyChooseFeatures = [
  {
    icon: MessageCircleIcon,
    title: "WhatsApp-First Support",
    description: "No emails, no waiting. Chat with us directly on WhatsApp and get real answers in minutes — not days.",
    tag: "Always Available",
  },
  {
    icon: Users,
    title: "Ghana-Focused Design",
    description: "Built for Ghanaian celebrations — from kente patterns to outdooring traditions. Your guests will feel it's made just for them.",
    tag: "Made for Ghana",
  },
  {
    icon: Globe,
    title: "Diaspora-Ready",
    description: "Family in London, New York or Accra? One link works everywhere. No app downloads, no login — just click and attend.",
    tag: "Global Reach",
  },
  {
    icon: Sparkles,
    title: "Works for Every Occasion",
    description: "Wedding, funeral, naming, graduation, corporate — one platform handles every Ghanaian celebration with style.",
    tag: "All Events",
  },
  {
    icon: Radio,
    title: "Always Live",
    description: "Your invitation stays online before, during and after your event. Guests can revisit memories, photos and messages anytime.",
    tag: "Always On",
  },
  {
    icon: Camera,
    title: "Photo Gallery Included",
    description: "Share memories before and after the event. Upload photos directly to your invitation page.",
    tag: "Memories Forever",
  },
];

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core"]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, bio, photo_url, social_facebook, social_twitter, social_instagram, social_linkedin")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setTeamMembers(data);
      }
      setLoadingTeam(false);
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <Layout>
      <SEO
        title="About Us"
        description="Learn about VibeLink Event - Ghana's premier digital invitation service. Discover our journey from paper to the future of event invitations."
        keywords="VibeLink Event, digital invitations, Ghana event services, about VibeLink"
        canonical="/about"
        jsonLd={aboutBreadcrumb}
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About VibeLink Event
            </h1>
            <p className="text-white/80 text-lg lg:text-xl">
              Ghana's premier digital invitation service, celebrating life's precious moments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story — 3-column then/better/now comparison */}
      <section className="py-20 bg-background overflow-x-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 lg:mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Our Story</h2>
            <p className="text-primary font-semibold text-sm md:text-base mb-4 uppercase tracking-wider">The evolution of invitations in Ghana</p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Ghanaian celebrations have always been our biggest moments — weddings, naming ceremonies, memorials, engagements. But the way we invite people to them has quietly changed with every wave of technology.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-3">
              Three eras. Three completely different ideas of what an invitation could be.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6 items-stretch">
            {/* PAPER — warm amber → orange → rose */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl border-2 border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 shadow-sm hover:shadow-lg hover:shadow-amber-500/20 transition-shadow"
            >
              {/* F · Connector arrow to next card — desktop only */}
              <div className="hidden md:flex absolute -right-6 top-10 z-10 items-center">
                <motion.div
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="h-0.5 w-6 origin-left bg-gradient-to-r from-amber-400 to-emerald-400"
                />
                <motion.div
                  initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 1 }}
                >
                  <ChevronRight className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                </motion.div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/30">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900">Then</span>
                  <p className="text-[11px] text-amber-900/70 mt-1">1980s → 2000s</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-amber-950 mb-0.5">The Paper Era</h3>
              <p className="text-[13px] font-semibold text-amber-800/90 italic mb-3">Traditional Printed Cards</p>
              <p className="text-amber-900/70 text-sm leading-relaxed mb-4">
                For decades, our biggest moments were announced with beautifully printed cards — hand-delivered, gold-edged, kept as keepsakes. Paper did a lot. But it couldn't do everything.
              </p>
              <motion.ul
                className="space-y-2 text-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } }}
              >
                {paperProblems.map((item, j) => (
                  <motion.li
                    key={j}
                    className="flex items-start gap-2 text-amber-900/80"
                    variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                  >
                    <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* WHATSAPP — emerald → teal → cyan */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl border-2 border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow"
            >
              {/* F · Connector arrow to next card — desktop only */}
              <div className="hidden md:flex absolute -right-6 top-10 z-10 items-center">
                <motion.div
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="h-0.5 w-6 origin-left bg-gradient-to-r from-emerald-400 to-primary"
                />
                <motion.div
                  initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 1.3 }}
                >
                  <ChevronRight className="w-4 h-4 text-primary" strokeWidth={3} />
                </motion.div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Smartphone className="w-7 h-7 text-white" strokeWidth={2} />
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">99+</span>
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900">Better</span>
                  <p className="text-[11px] text-emerald-900/70 mt-1">2010s → 2024</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 mb-0.5">The WhatsApp Era</h3>
              <p className="text-[13px] font-semibold text-emerald-800/90 italic mb-3">JPEG & PDF Flyers</p>
              <p className="text-emerald-900/70 text-sm leading-relaxed mb-4">
                Then the phone changed everything. Designers replaced ink with pixels, and JPEG flyers started flying through WhatsApp groups and family chats. Faster. Cheaper. But something got lost in the compression.
              </p>
              <motion.ul
                className="space-y-2 text-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.55 } } }}
              >
                {whatsappProblems.map((item, j) => (
                  <motion.li
                    key={j}
                    className="flex items-start gap-2 text-emerald-900/80"
                    variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                  >
                    <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* VIBELINK — dark glass + gradient border + idle float + shimmer */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8 }}
              className="relative rounded-2xl p-[2px] bg-gradient-to-r from-primary via-purple-500 to-secondary shadow-2xl shadow-primary/30 md:scale-105"
            >
              {/* B · Shimmer sweep across the gradient border every ~5 s */}
              <motion.div
                aria-hidden
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg z-10 whitespace-nowrap">
                You are here
              </span>

              <div className="relative rounded-[calc(1rem-2px)] p-6 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 overflow-hidden text-white h-full">
                {/* B · Ambient blur blobs slowly drifting to give a 'living' feel */}
                <motion.div
                  aria-hidden
                  animate={{ x: [0, 12, 0], y: [0, 8, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/30 blur-3xl pointer-events-none"
                />
                <motion.div
                  aria-hidden
                  animate={{ x: [0, -10, 0], y: [0, -6, 0], scale: [1.05, 1, 1.05] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-secondary/30 blur-3xl pointer-events-none"
                />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
                      <motion.span
                        animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.4, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary/20 border border-secondary/40 text-secondary">
                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        BEST
                      </span>
                      <p className="text-[11px] text-white/60 mt-1">2025 → Now</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-0.5">
                    The{" "}
                    <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">VibeLink</span>{" "}
                    Era
                  </h3>
                  <p className="text-[13px] font-semibold text-secondary/90 italic mb-3">Live, Interactive Invitations</p>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Not a picture. Not a PDF. A living, breathing event page — one link that holds your whole event and updates the moment you do. Your guests are anywhere in the world. So is your invitation.
                  </p>
                  <motion.ul
                    className="space-y-2 text-sm"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.75 } } }}
                  >
                    {[
                      "Update details anytime, guests see it instantly",
                      "Track RSVPs in real-time",
                      "Google Maps directions built-in",
                      "Photo galleries, music, live streams",
                      "Works on every phone, no app to download",
                      "Reaches loved ones anywhere in the world",
                    ].map((item, j) => (
                      <motion.li
                        key={j}
                        className="flex items-start gap-2 text-white/90"
                        variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                        </div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Believe — merged mission + values into one strong section */}
      <section className="py-20 bg-background overflow-x-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-12 lg:mb-16"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
            >
              What We Believe
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Three ideas that shape{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                everything we build
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Not features. Not policies. The values behind the product.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-14 lg:mb-16">
            {[
              {
                n: "01",
                value: "Every celebration is worth doing beautifully.",
                body: "A wedding in Kumasi, a naming in Cape Coast, a memorial in Ho — they all deserve the same care. We build one product with respect at its centre. No tiers of effort.",
                accent: "from-primary to-purple-500",
                shadow: "hover:shadow-primary/20",
                bar: "from-primary via-purple-500 to-primary",
              },
              {
                n: "02",
                value: "Family belongs, wherever they live.",
                body: "The diaspora isn't a checkbox — it's half our audience. Every invitation is built so the cousin in London opens the same beautiful link as the neighbour next door.",
                accent: "from-secondary via-yellow-400 to-secondary",
                shadow: "hover:shadow-secondary/20",
                bar: "from-secondary via-yellow-400 to-secondary",
              },
              {
                n: "03",
                value: "Ghanaian by design.",
                body: "Kente palettes, one-week ceremonies, funeral programs, outdoorings — every feature comes from watching how Ghanaian families actually celebrate. Not adapted from someone else's playbook.",
                accent: "from-emerald-500 via-teal-500 to-emerald-600",
                shadow: "hover:shadow-emerald-500/20",
                bar: "from-emerald-500 via-teal-500 to-emerald-600",
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`group relative bg-card border border-border rounded-2xl p-8 pb-9 shadow-sm hover:shadow-xl ${v.shadow} transition-all duration-300 overflow-hidden`}
              >
                <span
                  aria-hidden
                  className={`absolute -top-3 -right-2 text-7xl md:text-8xl font-black leading-none pointer-events-none select-none bg-gradient-to-br ${v.accent} bg-clip-text text-transparent opacity-10 group-hover:opacity-20 transition-opacity`}
                >
                  {v.n}
                </span>
                <span className={`inline-block text-[10px] font-bold tracking-[0.2em] uppercase mb-4 relative bg-gradient-to-r ${v.accent} bg-clip-text text-transparent`}>
                  Value {v.n}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 relative leading-snug">
                  {v.value}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-[15px] relative">
                  {v.body}
                </p>
                <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r ${v.bar} opacity-70`} />
              </motion.div>
            ))}
          </div>

          {/* Punchline callout (merged from the old Mission Statement) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-block px-8 py-5 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/30 relative overflow-hidden">
              <motion.div
                aria-hidden
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
              />
              <p className="text-xl md:text-2xl font-bold text-foreground relative z-10 leading-tight">
                Your event deserves more than a JPEG.<br />
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  It deserves a VibeLink.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#7C3AED]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <div className="text-white/80 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Vibers */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Our Team
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Meet The Vibers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The passionate people behind VibeLink Event
            </p>
          </motion.div>

          {loadingTeam ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="text-center text-white/40">Team information coming soon.</p>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${teamMembers.length >= 3 ? "lg:grid-cols-3" : ""} ${teamMembers.length >= 4 ? "xl:grid-cols-4" : ""} gap-6 max-w-5xl mx-auto`}>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: '2px solid rgba(212,175,55,0.35)' }}
                  whileHover={{ borderColor: 'rgba(212,175,55,0.85)', boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Photo */}
                  <img
                    src={member.photo_url || "/placeholder.svg"}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.08]"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0414]/95 via-[#0a0414]/40 to-transparent transition-all duration-400 group-hover:from-[#0a0414]/98 group-hover:via-[#0a0414]/70 group-hover:to-[#0a0414]/20" />

                  {/* Gold border */}
                  <div className="absolute inset-0 rounded-2xl border border-secondary/0 group-hover:border-secondary/40 transition-all duration-400 pointer-events-none" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs font-bold tracking-[3px] uppercase text-secondary/80 mb-1.5 block">
                      {member.role}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-0">{member.name}</h3>

                    {/* Bio teaser on hover */}
                    <div className="max-h-0 overflow-hidden group-hover:max-h-16 transition-all duration-400 ease-in-out">
                      {member.bio && (
                        <p className="text-white/55 text-sm leading-relaxed mt-2 line-clamp-2">{member.bio}</p>
                      )}
                    </div>

                    {/* View Profile hint */}
                    <div className="flex items-center gap-1.5 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      <span className="text-xs font-semibold text-secondary tracking-widest uppercase">View Profile</span>
                      <ArrowRight className="h-3 w-3 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Team Member Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative h-72">
              <img
                src={selectedMember.photo_url || "/placeholder.svg"}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0820] via-[#0d0820]/30 to-transparent" />

              {/* Close button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="bg-[#0d0820] border border-secondary/20 border-t-0 rounded-b-2xl p-6">
              <span className="text-xs font-bold tracking-[3px] uppercase text-secondary/80 mb-1 block">
                {selectedMember.role}
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">{selectedMember.name}</h3>
              <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-secondary mb-4" />
              {selectedMember.bio && (
                <p className="text-white/60 text-sm leading-relaxed mb-5">{selectedMember.bio}</p>
              )}

              {/* Socials */}
              <div className="flex gap-2">
                {selectedMember.social_linkedin && (
                  <a href={selectedMember.social_linkedin} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary border border-white/20 hover:border-secondary flex items-center justify-center transition-all duration-200">
                    <Linkedin className="h-4 w-4 text-white" />
                  </a>
                )}
                {selectedMember.social_instagram && (
                  <a href={selectedMember.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary border border-white/20 hover:border-secondary flex items-center justify-center transition-all duration-200">
                    <Instagram className="h-4 w-4 text-white" />
                  </a>
                )}
                {selectedMember.social_twitter && (
                  <a href={selectedMember.social_twitter} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary border border-white/20 hover:border-secondary flex items-center justify-center transition-all duration-200">
                    <Twitter className="h-4 w-4 text-white" />
                  </a>
                )}
                {selectedMember.social_facebook && (
                  <a href={selectedMember.social_facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary border border-white/20 hover:border-secondary flex items-center justify-center transition-all duration-200">
                    <Facebook className="h-4 w-4 text-white" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Let us help you celebrate, honour, and remember the moments that matter most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8">
                <Link to="/get-started">
                  Start Your Invitation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
};

export default About;
