import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import {
  Calendar, MapPin, Users, Camera, MessageSquare, Video,
  Check, Play, Clock, Bell, Send, Heart, Sparkles, Globe, Gift,
  Wallet, Baby, Shield, Award,
} from "lucide-react";

// Real service categories (same as production Services page) + demoKey.
// Each feature is now { name, description } so samples can show the sub-copy.
const categories = [
  {
    icon: Calendar,
    title: "Event Details & Timeline",
    tint: "from-blue-400 to-blue-600",
    soft: "bg-blue-50",
    accent: "text-blue-700",
    features: [
      { name: "Date, Time & Venue", description: "Display all essential event information beautifully" },
      { name: "Dress Code Display", description: "Let guests know the appropriate attire" },
      { name: "Event Timeline", description: "Display the full program schedule for your event" },
      { name: "Live Countdown", description: "Build excitement with a main countdown to your event" },
      { name: "Moment Countdowns", description: "Separate mini-countdowns for reception, first dance, cake cutting" },
      { name: "Story of Us", description: "Your love story timeline — how you met, the proposal, the journey" },
      { name: "Meet the Wedding Party", description: "Cards for bridesmaids, groomsmen, ring bearers, flower girls" },
      { name: "Q&A / FAQ Section", description: "Answer the questions guests always ask before they ask" },
      { name: "Weather Forecast", description: "Live weather forecast for your venue on the event day" },
    ],
    demoKey: "countdown",
  },
  {
    icon: MapPin,
    title: "Directions & Access",
    tint: "from-emerald-400 to-emerald-600",
    soft: "bg-emerald-50",
    accent: "text-emerald-700",
    features: [
      { name: "Google Maps Integration", description: "One-tap navigation to your venue" },
      { name: "Multiple Venue Support", description: "Separate directions for ceremony and reception" },
      { name: "Book a Ride", description: "Quick access to Uber, Bolt, Yango & more" },
      { name: "Nearby Accommodation", description: "Hotel suggestions for out-of-town guests" },
    ],
    demoKey: "map",
  },
  {
    icon: Users,
    title: "RSVP & Guest Management",
    tint: "from-purple-500 to-purple-700",
    soft: "bg-purple-50",
    accent: "text-purple-700",
    features: [
      { name: "RSVP Tracking", description: "Know exactly who is attending your event" },
      { name: "Meal Preferences", description: "Collect dietary requirements and food choices" },
      { name: "Guest Analytics", description: "See views, RSVPs, and engagement in real-time" },
      { name: "Better Planning", description: "Helps families, churches, and planners prepare accurately" },
      { name: "RSVP Progress Bar", description: "'42 of 100 guests have said yes' — a gold progress bar guests can see" },
      { name: "Live Attending Ticker", description: "Scrolling ticker of new RSVPs — 'The Boateng family just RSVP'd'" },
    ],
    demoKey: "rsvp",
  },
  {
    icon: Camera,
    title: "Media & Experience",
    tint: "from-pink-400 to-rose-500",
    soft: "bg-pink-50",
    accent: "text-pink-700",
    features: [
      { name: "Photo Gallery", description: "Showcase beautiful pre-event images on your invitation" },
      { name: "Background Music", description: "Set the mood with ambient music that plays automatically" },
      { name: "Video Background", description: "Add cinematic videos to your invitation" },
      { name: "Photo Booth Frame", description: "Custom frames for event photos guests can share" },
      { name: "Live Photo Wall", description: "Guest photos taken during the event stream onto the invitation in real time" },
      { name: "Video Guestbook", description: "Guests record 15-second video wishes that stack on a memory reel" },
      { name: "Post-Event Gallery", description: "A curated album delivered to guests after the day — download and re-live" },
    ],
    demoKey: "gallery",
  },
  {
    icon: MessageSquare,
    title: "Guest Interaction",
    tint: "from-orange-400 to-amber-500",
    soft: "bg-orange-50",
    accent: "text-orange-700",
    features: [
      { name: "Guest Messaging Wall", description: "Collect wishes, prayers, and heartfelt messages" },
      { name: "Digital Guestbook", description: "Guest messages & photos in one shareable book" },
      { name: "Contact Cards", description: "Let guests save your details directly to their phones" },
      { name: "WhatsApp Sharing", description: "Easy one-click sharing to family and friends" },
      { name: "Prayer Wall", description: "A dedicated space for prayer requests — church events, memorials, thanksgivings" },
      { name: "Reactions & Emojis", description: "Guests tap hearts, prayers, celebrations — the counter increments live" },
      { name: "Social Share Pack", description: "Pre-designed Instagram Stories and WhatsApp Status templates guests can post" },
    ],
    demoKey: "messages",
  },
  {
    icon: Video,
    title: "Live & Hybrid Events",
    tint: "from-red-500 to-rose-600",
    soft: "bg-red-50",
    accent: "text-red-700",
    features: [
      { name: "Live Stream Embed", description: "Let guests who cannot attend watch in real-time" },
      { name: "Diaspora Friendly", description: "Perfect for family members abroad" },
      { name: "International Reach", description: "Connect with guests anywhere in the world" },
      { name: "Video Integration", description: "Add event videos and highlights" },
      { name: "Time Zone Converter", description: "Auto-shows every guest's local time — Accra 12pm = London 12pm = NY 8am" },
      { name: "Watch Party Rooms", description: "Diaspora guests join a virtual room to watch the stream together with live chat" },
      { name: "Rewind & Replay", description: "Missed the vows? Rewind the livestream and catch every moment" },
    ],
    demoKey: "livestream",
  },
  {
    icon: Heart,
    title: "Funeral & Memorial",
    tint: "from-slate-500 to-slate-700",
    soft: "bg-slate-100",
    accent: "text-slate-700",
    features: [
      { name: "Memory Tribute Wall", description: "Collect condolences and remembrance messages" },
      { name: "Respectful Design", description: "Dignified layouts specifically for memorial services" },
      { name: "Donation Links", description: "Allow guests to contribute to family or charity" },
      { name: "Memorial Page Renewal", description: "Keep memories alive with annual renewals" },
      { name: "Obituary Section", description: "Share the life story and achievements of your loved one" },
      { name: "Photo Timeline", description: "Life in pictures — birth, key milestones, the whole journey" },
      { name: "One-Week & 40-Day Announcements", description: "Auto-schedule follow-up ceremonies with new details as they're set" },
      { name: "Grave Location Map", description: "Google Maps pin for the cemetery — for family who need to visit" },
    ],
    demoKey: "memorial",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    tint: "from-teal-400 to-cyan-600",
    soft: "bg-teal-50",
    accent: "text-teal-700",
    features: [
      { name: "English + Twi", description: "Reach your local Ghanaian audience" },
      { name: "English + French", description: "Perfect for Francophone guests" },
      { name: "Additional Languages", description: "Custom translations available on request" },
      { name: "International Families", description: "Great for mixed-culture celebrations" },
      { name: "RTL Support", description: "Arabic, Hebrew & other right-to-left languages" },
      { name: "Auto-Translate Guest Messages", description: "Aunty writes in Twi, cousin in London reads in English — automatic" },
    ],
    demoKey: "languages",
  },
  {
    icon: Gift,
    title: "Post-Event & Extras",
    tint: "from-amber-400 to-orange-500",
    soft: "bg-amber-50",
    accent: "text-amber-700",
    features: [
      { name: "Thank You Page", description: "Express gratitude after your event beautifully" },
      { name: "Calendar Integration", description: "Guests can add your event to their calendar" },
      { name: "Custom Domain", description: "Get a personalized URL" },
      { name: "Host Dashboard", description: "Manage your event from one central place" },
      { name: "Lost & Found", description: "Report and recover misplaced items after your event" },
      { name: "Anniversary Reminders", description: "Yearly notification with your original invitation revisited — every year" },
      { name: "Post-Event Analytics Report", description: "1-week summary emailed to you: total views, RSVPs, top-viewed sections" },
    ],
    demoKey: "thankyou",
  },
  {
    icon: Wallet,
    title: "Gifts & Contributions",
    tint: "from-yellow-400 to-amber-500",
    soft: "bg-yellow-50",
    accent: "text-yellow-700",
    features: [
      { name: "MoMo Registry", description: "Guests contribute directly via Mobile Money — MTN, Vodafone, AirtelTigo — with real-time tracking" },
      { name: "Wishlist Link", description: "Direct link to your online registry — Amazon, Zola, or your favourite store" },
      { name: "Dowry Contribution", description: "A private, family-only page for traditional dowry — kept off the public invitation" },
      { name: "Physical Gift Registry", description: "A curated list of physical gifts guests can bring or send" },
    ],
    demoKey: "rsvp",
  },
  {
    icon: Baby,
    title: "Kids & Family",
    tint: "from-cyan-400 to-sky-500",
    soft: "bg-cyan-50",
    accent: "text-cyan-700",
    features: [
      { name: "Kids Activity Zone", description: "Info on the play area, entertainment schedule, and supervision" },
      { name: "Child-Friendly Menu", description: "Meal options designed for children — nut-free, allergy-aware" },
      { name: "Breastfeeding Room", description: "Location and availability of a private, comfortable space for mothers" },
      { name: "Changing Facilities", description: "Where to find nappy-changing tables and family bathrooms" },
    ],
    demoKey: "messages",
  },
  {
    icon: Shield,
    title: "Safety & Emergency",
    tint: "from-rose-500 to-red-600",
    soft: "bg-rose-50",
    accent: "text-rose-700",
    features: [
      { name: "Emergency Contacts", description: "Quick access to venue security, event coordinator, and family contacts" },
      { name: "On-Site Medic", description: "Location and hours of medical support during the event" },
      { name: "Allergy Alerts", description: "Nut-free, gluten-free, or specific allergy warnings for the venue" },
      { name: "Late-Night Transport", description: "Safe transport options for guests staying past midnight" },
    ],
    demoKey: "map",
  },
  {
    icon: Award,
    title: "Vendors & Credits",
    tint: "from-indigo-500 to-purple-600",
    soft: "bg-indigo-50",
    accent: "text-indigo-700",
    features: [
      { name: "Photographer & Videographer", description: "Credits for the team capturing your day, with their booking info" },
      { name: "Caterer", description: "Recognise your catering team — their menu and contact details" },
      { name: "MC & DJ", description: "Featured MC and DJ with their portfolios and booking links" },
      { name: "Decorator & Florist", description: "Highlight the team behind the beautiful decor" },
    ],
    demoKey: "gallery",
  },
];

// —— Animated micro-demos ———————————————————————————————————
function Demo({ demoKey, tint }: { demoKey: string; tint: string }) {
  if (demoKey === "countdown") return <CountdownDemo tint={tint} />;
  if (demoKey === "map") return <MapDemo tint={tint} />;
  if (demoKey === "rsvp") return <RsvpDemo tint={tint} />;
  if (demoKey === "gallery") return <GalleryDemo tint={tint} />;
  if (demoKey === "messages") return <MessagesDemo tint={tint} />;
  if (demoKey === "livestream") return <LivestreamDemo tint={tint} />;
  if (demoKey === "memorial") return <MemorialDemo tint={tint} />;
  if (demoKey === "languages") return <LanguagesDemo tint={tint} />;
  if (demoKey === "thankyou") return <ThankYouDemo tint={tint} />;
  return null;
}

function CountdownDemo({ tint }: { tint: string }) {
  const [t, setT] = useState({ d: 12, h: 8, m: 32, s: 45 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let s = p.s - 1;
        let m = p.m, h = p.h, d = p.d;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) return { d: 12, h: 8, m: 32, s: 45 };
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {[
        { label: "days", n: t.d },
        { label: "hrs", n: t.h },
        { label: "min", n: t.m },
        { label: "sec", n: t.s },
      ].map((c, i) => (
        <div key={i} className={`rounded-xl bg-gradient-to-br ${tint} p-3 text-center text-white shadow-md`}>
          <div className="text-2xl md:text-3xl font-black tabular-nums leading-none">{String(c.n).padStart(2, "0")}</div>
          <div className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-80 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function MapDemo({ tint }: { tint: string }) {
  return (
    <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 shadow-inner">
      {/* Fake streets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
        <path d="M0 40 L300 60" stroke="rgba(255,255,255,0.7)" strokeWidth="6" />
        <path d="M0 110 L300 130" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
        <path d="M80 0 L100 180" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
        <path d="M200 0 L220 180" stroke="rgba(255,255,255,0.7)" strokeWidth="6" />
      </svg>
      {/* Pin */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
      >
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tint} flex items-center justify-center shadow-xl ring-4 ring-white`}>
          <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="w-1.5 h-4 bg-emerald-700 mx-auto rounded-b" />
      </motion.div>
      {/* Address chip */}
      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow-md">
        <p className="text-[10px] text-emerald-800 font-semibold">📍 Labadi Beach Hotel</p>
        <p className="text-[9px] text-emerald-800/70">Accra — one-tap navigation</p>
      </div>
    </div>
  );
}

function RsvpDemo({ tint }: { tint: string }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((p) => (p + 1) % 4), 1600);
    return () => clearInterval(id);
  }, []);
  const stats = [
    { label: "Attending", value: 148, colour: "text-emerald-600" },
    { label: "Maybe", value: 22, colour: "text-amber-600" },
    { label: "Meals: Chicken", value: 92, colour: "text-purple-600" },
    { label: "Meals: Vegetarian", value: 34, colour: "text-pink-600" },
  ];
  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center`}>
          <Users className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= stage ? 1 : 0.3 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-600">{s.label}</span>
            <span className={`font-black tabular-nums ${s.colour}`}>{s.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GalleryDemo({ tint }: { tint: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % 5), 1600);
    return () => clearInterval(id);
  }, []);
  const gradients = [
    "from-pink-300 to-purple-400",
    "from-amber-300 to-rose-400",
    "from-emerald-300 to-teal-400",
    "from-blue-300 to-indigo-400",
    "from-orange-300 to-red-400",
  ];
  return (
    <div className="w-full aspect-[5/3] rounded-xl overflow-hidden relative shadow-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-br ${gradients[idx]} flex items-center justify-center`}
        >
          <Camera className="w-10 h-10 text-white/80" strokeWidth={1.5} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
        {gradients.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

function MessagesDemo({ tint }: { tint: string }) {
  const messages = [
    { who: "Ama K.", text: "Wishing you both a lifetime of joy! 💖", side: "left" },
    { who: "You", text: "Thanks Ama! Can't wait to see you.", side: "right" },
    { who: "Kwame O.", text: "Congrats! See you Saturday 🙏", side: "left" },
  ];
  return (
    <div className="w-full rounded-xl bg-orange-50/50 p-3 shadow-md border border-orange-200 space-y-2 min-h-[140px]">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.4, duration: 0.4 }}
          className={`flex ${m.side === "right" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-[11px] shadow-sm ${
              m.side === "right"
                ? `bg-gradient-to-br ${tint} text-white`
                : "bg-white text-gray-800"
            }`}
          >
            {m.side !== "right" && <p className="text-[9px] font-bold text-orange-700 mb-0.5">{m.who}</p>}
            <p className="leading-snug">{m.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MemorialDemo({ tint }: { tint: string }) {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-slate-100 to-stone-100 p-4 shadow-md border border-slate-300 min-h-[140px] relative overflow-hidden">
      {/* Candle */}
      <div className="flex flex-col items-center mb-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-3 h-4 rounded-full bg-gradient-to-t from-orange-400 to-yellow-200 shadow-[0_0_16px_4px_rgba(251,191,36,0.6)]"
        />
        <div className="w-1.5 h-8 bg-slate-200 border border-slate-400" />
      </div>
      <p className="text-[10px] font-serif italic text-slate-600 text-center leading-snug mb-2">"In loving memory of Mr. Wilson Atta Krofah"</p>
      <div className="space-y-1">
        {[
          { who: "Rev. Owusu", text: "May his soul rest in perfect peace 🙏" },
          { who: "Ama K.", text: "Grateful for his life and legacy." },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.4 }}
            className="text-[10px] bg-white/70 rounded-lg px-2 py-1 shadow-sm"
          >
            <span className={`font-bold ${tint.includes("slate") ? "text-slate-800" : "text-slate-700"}`}>{m.who}: </span>
            <span className="text-slate-600">{m.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LanguagesDemo({ tint }: { tint: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % 4), 1600);
    return () => clearInterval(id);
  }, []);
  const langs = [
    { code: "EN", flag: "🇬🇧", label: "English", sample: "You are cordially invited to our wedding" },
    { code: "TWI", flag: "🇬🇭", label: "Twi", sample: "Yɛfrɛ wo bɛka yɛn ayɛforohyia" },
    { code: "FR", flag: "🇫🇷", label: "French", sample: "Vous êtes cordialement invité à notre mariage" },
    { code: "AR", flag: "🇸🇦", label: "Arabic", sample: "أنت مدعو بأدب إلى حفل زفافنا" },
  ];
  const cur = langs[idx];
  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md border border-teal-200 min-h-[140px]">
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {langs.map((l, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
              i === idx ? `bg-gradient-to-r ${tint} text-white shadow-md` : "bg-slate-100 text-slate-600"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.code}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`text-sm font-serif italic text-slate-700 text-center ${cur.code === "AR" ? "text-right" : ""}`}
          dir={cur.code === "AR" ? "rtl" : "ltr"}
        >
          "{cur.sample}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ThankYouDemo({ tint }: { tint: string }) {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-md border border-amber-200 min-h-[140px] relative overflow-hidden text-center">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={`inline-flex w-12 h-12 rounded-full bg-gradient-to-br ${tint} items-center justify-center shadow-lg mb-2`}
      >
        <Heart className="w-6 h-6 text-white fill-white" strokeWidth={0} />
      </motion.div>
      <p className="text-sm font-serif italic text-amber-900 mb-1">"Thank you for celebrating with us."</p>
      <p className="text-[10px] text-amber-800/70 mb-3">— Kofi & Ama</p>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-amber-300 text-[10px] font-semibold text-amber-800 shadow-sm">
        <Calendar className="w-3 h-3" />
        Add to calendar
      </div>
    </div>
  );
}

function LivestreamDemo({ tint }: { tint: string }) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 shadow-md">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${tint} flex items-center justify-center shadow-2xl`}
        >
          <Play className="w-6 h-6 text-white ml-1 fill-white" />
        </motion.button>
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-white"
        />
        Live
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white/80 text-[10px]">
        <span>👀 142 watching</span>
        <span>Diaspora inclusive</span>
      </div>
    </div>
  );
}

// —— Section shell ————————————————————————————————————————
function DemoShell({
  letter, title, description, bg = "bg-background", children,
}: { letter: string; title: string; description: string; bg?: string; children: React.ReactNode }) {
  return (
    <section className={`py-16 lg:py-20 ${bg} relative overflow-hidden`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg mb-3 shadow-lg">{letter}</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

// —— A · Interactive tabs + animated preview —————————————————
function SampleA() {
  const [idx, setIdx] = useState(0);
  const cur = categories[idx];
  const Icon = cur.icon;

  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % categories.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c, i) => {
          const CIcon = c.icon;
          return (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                i === idx
                  ? `bg-gradient-to-r ${c.tint} text-white shadow-lg`
                  : "bg-card border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              <CIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{c.title.split(" & ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="rounded-3xl bg-card border border-border p-6 md:p-10 shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${cur.soft} ${cur.accent} text-xs font-bold uppercase tracking-widest mb-4`}>
                <Icon className="w-3.5 h-3.5" /> Category
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{cur.title}</h3>
              <ul className="space-y-4">
                {cur.features.map((f, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + j * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${cur.tint} flex items-center justify-center shrink-0 mt-1`}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base leading-tight">{f.name}</p>
                      <p className="text-muted-foreground text-xs md:text-sm mt-0.5 leading-snug">{f.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx + "-demo"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-sm">
                <Demo demoKey={cur.demoKey} tint={cur.tint} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 flex gap-1">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 flex-1 rounded-full transition-all ${i === idx ? `bg-gradient-to-r ${cur.tint}` : "bg-border"}`}
              aria-label={`Tab ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// —— B · Bento grid with mixed sizes ——————————————————————
function SampleB() {
  // Pattern repeats every 6 tiles: hero → wide → std → tall → std → std
  const pattern = [
    "col-span-2 row-span-2 md:col-span-2 md:row-span-2", // hero
    "col-span-2 md:col-span-2 md:row-span-1",             // wide
    "col-span-1 md:col-span-1 md:row-span-1",             // standard
    "col-span-1 md:col-span-1 md:row-span-2",             // tall
    "col-span-1 md:col-span-1 md:row-span-1",             // standard
    "col-span-1 md:col-span-1 md:row-span-1",             // standard
  ];
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
      {categories.map((c, i) => {
        const Icon = c.icon;
        const span = pattern[i % pattern.length];
        const isHero = i === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className={`${span} group relative rounded-2xl bg-card border border-border p-4 md:p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden`}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${c.tint} shadow-md mb-3`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.25} />
            </div>
            <h3 className={`font-bold text-foreground leading-tight mb-2 ${isHero ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>{c.title}</h3>
            {isHero ? (
              <>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">Everything guests need for the big moment — timing, dress code, the plan for the day.</p>
                <div className="w-full max-w-[280px]">
                  <Demo demoKey={c.demoKey} tint={c.tint} />
                </div>
              </>
            ) : (
              <ul className="space-y-2 text-xs">
                {c.features.slice(0, 3).map((f, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <Check className={`w-3 h-3 shrink-0 mt-0.5 ${c.accent}`} strokeWidth={3} />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground leading-tight">{f.name}</p>
                      <p className="text-muted-foreground text-[10px] leading-snug line-clamp-1">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {/* Accent bar on hover */}
            <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${c.tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        );
      })}
    </div>
  );
}

// —— C · Scroll-driven storytelling (stacked panels) ———————
function SampleC() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {categories.map((c, i) => {
        const Icon = c.icon;
        const isEven = i % 2 === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`grid md:grid-cols-2 gap-6 md:gap-10 items-center rounded-3xl bg-card border border-border p-6 md:p-10 shadow-md`}
          >
            <div className={isEven ? "md:order-1" : "md:order-2"}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${c.soft} ${c.accent} text-xs font-bold uppercase tracking-widest mb-4`}>
                <Icon className="w-3.5 h-3.5" /> {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{c.title}</h3>
              <ul className="space-y-3">
                {c.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${c.tint} flex items-center justify-center shrink-0 mt-1`}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base leading-tight">{f.name}</p>
                      <p className="text-muted-foreground text-xs md:text-sm mt-0.5 leading-snug">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${isEven ? "md:order-2" : "md:order-1"} flex justify-center`}>
              <div className="w-full max-w-sm">
                <Demo demoKey={c.demoKey} tint={c.tint} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// —— D · Expanding cards on hover/tap ——————————————————————
function SampleD() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((c, i) => {
        const Icon = c.icon;
        const isOpen = openIdx === i;
        return (
          <motion.button
            key={i}
            onClick={() => setOpenIdx(isOpen ? null : i)}
            onMouseEnter={() => setOpenIdx(i)}
            layout
            className={`relative rounded-2xl bg-card border-2 text-left overflow-hidden transition-all ${
              isOpen ? "border-transparent shadow-xl ring-2 ring-primary/30" : "border-border shadow-sm hover:shadow-md"
            }`}
            style={{ minHeight: isOpen ? 260 : 140 }}
          >
            {/* Gradient border when open */}
            {isOpen && (
              <div className={`absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br ${c.tint} pointer-events-none`}>
                <div className="w-full h-full rounded-2xl bg-card" />
              </div>
            )}
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.tint} flex items-center justify-center shadow-md shrink-0`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.25} />
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base leading-tight">{c.title}</h3>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2.5 mt-3">
                      {c.features.map((f, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + j * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.tint} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs md:text-sm leading-tight">{f.name}</p>
                            <p className="text-muted-foreground text-[11px] mt-0.5 leading-snug">{f.description}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isOpen && (
                <p className="text-xs text-muted-foreground">{c.features.length} features — hover to expand</p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// —— E · Icon-orbit constellation ——————————————————————————
function SampleE() {
  const [active, setActive] = useState(0);
  const cur = categories[active];
  const Icon = cur.icon;
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % categories.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative w-full aspect-square max-w-[560px] mx-auto">
        {/* Central card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52%] aspect-square rounded-3xl bg-card border border-border shadow-xl flex flex-col items-center justify-center p-6 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cur.tint} flex items-center justify-center shadow-lg mb-3`}>
                <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-bold text-foreground leading-tight mb-2">{cur.title}</h3>
              <ul className="text-[10px] md:text-xs text-muted-foreground space-y-1 text-left">
                {cur.features.slice(0, 3).map((f, j) => (
                  <li key={j} className="leading-tight">
                    <span className="text-foreground font-semibold">· {f.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Orbiting satellite icons */}
        {categories.map((c, i) => {
          const CIcon = c.icon;
          const angle = (i / categories.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 46;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const isActive = active === i;
          return (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              animate={{ scale: isActive ? 1.2 : 1 }}
              whileHover={{ scale: 1.15 }}
              className={`absolute w-12 h-12 md:w-14 md:h-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br ${c.tint} shadow-lg flex items-center justify-center transition-shadow ${isActive ? "ring-4 ring-primary/40 shadow-2xl" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={c.title}
            >
              <CIcon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.25} />
            </motion.button>
          );
        })}

        {/* Orbit ring */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,1.5" className="text-muted-foreground/30" />
        </svg>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-6">Tap a satellite — details load in the centre. Auto-rotates every 4s.</p>
    </div>
  );
}

// —— F · Feature comparison table ————————————————————————
function SampleF() {
  const maxRows = Math.max(...categories.map((c) => c.features.length));
  const cols = categories.length; // 9
  return (
    <div className="max-w-6xl mx-auto overflow-x-auto">
      <div className="min-w-[1100px] rounded-2xl border border-border bg-card shadow-md overflow-hidden">
        {/* Header row */}
        <div className="grid border-b-2 border-border" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className={`p-4 text-center border-r border-border last:border-r-0 ${c.soft}`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${c.tint} shadow-md mb-2`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.25} />
                </div>
                <p className={`text-[11px] font-bold ${c.accent} leading-tight`}>{c.title}</p>
              </div>
            );
          })}
        </div>
        {/* Feature rows: up to maxRows (5), each shows one feature index across all categories */}
        {Array.from({ length: maxRows }).map((_, rowIdx) => (
          <div key={rowIdx} className="grid border-b border-border last:border-b-0" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {categories.map((c, i) => {
              const feature = c.features[rowIdx];
              return (
                <div key={i} className="p-3 text-center border-r border-border last:border-r-0 hover:bg-muted/40 transition-colors">
                  {feature ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${c.tint} flex items-center justify-center shadow-sm`}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-semibold text-foreground leading-tight">{feature.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{feature.description}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">Every feature in every category, side by side. Scan the columns to compare.</p>
    </div>
  );
}

// —— G · Vertical sidebar + preview ————————————————————————
function SampleG() {
  const [idx, setIdx] = useState(0);
  const cur = categories[idx];
  const Icon = cur.icon;
  return (
    <div className="max-w-6xl mx-auto rounded-3xl bg-card border border-border shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="border-b md:border-b-0 md:border-r border-border bg-muted/30 p-3 md:p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {categories.map((c, i) => {
            const CIcon = c.icon;
            const isActive = idx === i;
            return (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
                  isActive
                    ? `bg-gradient-to-r ${c.tint} text-white shadow-md`
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <CIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs md:text-sm font-semibold truncate">{c.title.split(" & ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${cur.soft} ${cur.accent} text-xs font-bold uppercase tracking-widest mb-4`}>
                <Icon className="w-3.5 h-3.5" /> Category
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{cur.title}</h3>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <ul className="space-y-3">
                  {cur.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${cur.tint} flex items-center justify-center shrink-0 mt-1`}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm leading-tight">{f.name}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{f.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="w-full max-w-sm">
                  <Demo demoKey={cur.demoKey} tint={cur.tint} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// —— H · Marquee of feature pills ————————————————————————
function SampleH() {
  // Duplicate for infinite scroll effect
  const all = [...categories, ...categories];
  return (
    <div className="max-w-6xl mx-auto space-y-6 overflow-hidden">
      {/* Category headers grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 max-w-6xl mx-auto">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`text-center p-4 rounded-2xl bg-gradient-to-br ${c.tint} text-white shadow-md`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1.5" strokeWidth={2.25} />
              <p className="text-[10px] font-bold leading-tight">{c.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Marquee row 1 (left→right) */}
      <div className="-mx-4 lg:-mx-8 overflow-hidden">
        <motion.div
          className="flex gap-3 py-2"
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {all.flatMap((c) => c.features.map((f) => ({ f, c }))).map((item, i) => (
            <div
              key={i}
              className={`shrink-0 inline-flex items-start gap-2 px-4 py-2.5 rounded-2xl ${item.c.soft} border border-current/20 ${item.c.accent} max-w-[280px]`}
            >
              <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.c.accent}`} strokeWidth={3} />
              <div className="text-left">
                <p className="text-xs md:text-sm font-bold whitespace-nowrap text-foreground">{item.f.name}</p>
                <p className="text-[10px] text-foreground/70 whitespace-nowrap">{item.f.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee row 2 (right→left) — offset for variety */}
      <div className="-mx-4 lg:-mx-8 overflow-hidden">
        <motion.div
          className="flex gap-3 py-2"
          animate={{ x: ["-50%", 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {all.flatMap((c) => c.features.map((f) => ({ f, c }))).reverse().map((item, i) => (
            <div
              key={i}
              className={`shrink-0 inline-flex items-start gap-2 px-4 py-2.5 rounded-2xl ${item.c.soft} border border-current/20 ${item.c.accent} max-w-[280px]`}
            >
              <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.c.accent}`} strokeWidth={3} />
              <div className="text-left">
                <p className="text-xs md:text-sm font-bold whitespace-nowrap text-foreground">{item.f.name}</p>
                <p className="text-[10px] text-foreground/70 whitespace-nowrap">{item.f.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// —— Preview page ————————————————————————————————————————
const ServicesPreview = () => {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <Layout>
      <SEO title="Services Layout — Preview Options" description="Four ways to display 'Everything Your Invitation Needs' on the Services page." canonical="/services-preview" />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-14 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <motion.div className="absolute top-10 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">
            Services page · 'Everything Your Invitation Needs'
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Pick your{" "}
            <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">display</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">Eight ways to show the invitation-features grid. Same 6 categories, eight completely different visual approaches.</p>
        </div>
      </section>

      <DemoShell letter="A" title="Interactive tabs + animated preview" description="Tabs across the top. Click one and the panel morphs to show that category's features on the left plus a live micro-demo on the right — ticking countdown, animated map, RSVP dashboard, and so on. Auto-cycles every 5s.">
        <SampleA />
      </DemoShell>

      <DemoShell letter="B" title="Bento grid with mixed sizes" description="Magazine-style asymmetric grid. Item 1 is a large hero tile (with the live demo inside), the others fill around it in different sizes. Visual hierarchy done right." bg="bg-muted/40">
        <SampleB />
      </DemoShell>

      <DemoShell letter="C" title="Story-driven stacked panels" description="Each category is its own large panel with the demo alternating left/right. Feels editorial, cinematic, like an Apple product page. Takes more real estate but earns it.">
        <SampleC />
      </DemoShell>

      <DemoShell letter="D" title="Expanding cards on hover / tap" description="Six compact category cards. Hover or tap one and it grows to reveal its features with a gradient border. Adjacent cards stay put — this variant expands only the active card in place." bg="bg-muted/40">
        <SampleD />
      </DemoShell>

      <DemoShell letter="E" title="Orbit / constellation" description="Category satellites orbit a central detail card. Tap one to bring it to the middle. Very novel — nobody else does this. Auto-rotates every 4s.">
        <SampleE />
      </DemoShell>

      <DemoShell letter="F" title="Feature comparison table" description="Categories as columns, features as rows. Scan every feature side-by-side. Most scannable, feels 'pricing-table professional' — great if you want visitors to see the depth of everything you offer at a glance." bg="bg-muted/40">
        <SampleF />
      </DemoShell>

      <DemoShell letter="G" title="Sidebar + preview panel" description="Vertical category list on the left (Notion / docs style), detail panel with features + live demo on the right. Cleanest, most 'app-like' layout. Great UX, works beautifully on mobile as a horizontal tab strip.">
        <SampleG />
      </DemoShell>

      <DemoShell letter="H" title="Marquee ticker of feature pills" description="Two rows of feature pills continuously scrolling in opposite directions, each pill colour-matched to its category. Category headers grid up top. Kinetic, energetic, works even if the visitor doesn't hover. Vercel / Stripe partner-wall style." bg="bg-muted/40">
        <SampleH />
      </DemoShell>

      {/* Vote */}
      <section className="py-14 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Which one wins?</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">Tap a letter — I'll ship it to /services.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => (
              <button
                key={letter}
                onClick={() => setPick(letter)}
                className={`w-12 h-12 rounded-2xl font-bold text-lg transition-all ${pick === letter ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-110" : "bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary"}`}
              >
                {pick === letter ? <Check className="w-5 h-5 mx-auto" /> : letter}
              </button>
            ))}
          </div>
          {pick && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-primary font-semibold text-sm">
              You picked <span className="font-bold">{pick}</span>. Tell me in chat and I'll swap it into /services.
            </motion.p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPreview;
