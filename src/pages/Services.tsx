import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import SEO, { createServiceSchema, createBreadcrumbSchema } from "@/components/SEO";
import { InvitationFeaturesTabs } from "@/components/services/InvitationFeaturesTabs";
import {
  Heart,
  Gem,
  Users,
  Baby,
  Cake,
  GraduationCap,
  Building,
  Check,
  Calendar,
  MapPin,
  Camera,
  MessageSquare,
  Video,
  Globe,
  Gift,
  Timer,
  Image,
  Music,
  ClipboardList,
  BarChart3,
  Smartphone,
  Share2,
  Sparkles,
  ArrowRight,
  Link2,
  Car,
  Radio,
  Frame,
  Wallet,
  Search,
  Shield,
  Award,
  CloudSun,
  HelpCircle,
  BookHeart,
  Languages as LanguagesIcon,
  PartyPopper,
  Rewind,
  MonitorPlay,
  Armchair,
  Store,
  Briefcase,
  LineChart,
  Cloud,
  ClipboardCheck,
  Compass,
  Tv,
  ScrollText,
  Wand2,
  CreditCard,
  Landmark,
  Aperture,
  Crown,
} from "lucide-react";

import weddingImg from "@/assets/service-wedding.jpg";
import engagementImg from "@/assets/hero-engagement.jpg";
import funeralImg from "@/assets/hero-funeral.jpg";
import namingImg from "@/assets/hero-naming.jpg";
import anniversaryImg from "@/assets/service-anniversary.jpg";
import graduationImg from "@/assets/hero-graduation.jpg";
import corporateImg from "@/assets/hero-corporate.jpg";
import churchImg from "@/assets/hero-church.jpg";
import birthdayImg from "@/assets/hero-birthday.jpg";

const eventPageMap: Record<string, string> = {
  wedding: "/wedding-invitations",
  engagement: "/engagement-invitations",
  funeral: "/funeral-programs",
  church: "/church-events",
  naming: "/naming-ceremony",
  birthday: "/birthday",
  anniversary: "/anniversary-invitations",
  graduation: "/graduation",
  corporate: "/corporate-events",
};

const services = [
  {
    icon: Heart,
    title: "Wedding Invitations",
    description: "Beautiful digital invitations for your traditional wedding, white wedding, or both.",
    features: [
      { name: "Dual ceremony support", desc: "Traditional & white wedding" },
      { name: "Love story timeline", desc: "Your journey together" },
      { name: "RSVP with meal preferences", desc: "Guest management" },
      { name: "Wedding party introductions", desc: "Bridal party profiles" },
      { name: "Photo gallery", desc: "Engagement & pre-wedding" },
      { name: "Google Map Integration", desc: "Easy venue navigation" }
    ],
    slug: "wedding",
    image: weddingImg,
    stats: { created: "500+", satisfaction: "98%", label: "Weddings Created" },
  },
  {
    icon: Gem,
    title: "Engagement / Customary Marriage",
    description: "Elegant digital invitations for the knocking, customary marriage and engagement — where two families become one.",
    features: [
      { name: "Adinkra symbol design", desc: "Sankofa, Gye Nyame, Osrane ne Nsoromma" },
      { name: "Kente-inspired palette", desc: "Colours that honour both families" },
      { name: "Family acknowledgement", desc: "Respectful mention of both sides" },
      { name: "Dress code display", desc: "Colour of the day, cloth pattern" },
      { name: "Wish wall", desc: "Blessings from every guest, kept forever" },
      { name: "Livestream + RSVP", desc: "Family abroad watches live" }
    ],
    slug: "engagement",
    image: engagementImg,
    stats: { created: "180+", satisfaction: "98%", label: "Families Joined" },
  },
  {
    icon: Users,
    title: "Funeral Programs",
    description: "Dignified memorial pages that honor your loved ones with respect.",
    features: [
      { name: "Memory tribute wall", desc: "Condolences & messages" },
      { name: "Donation links", desc: "Support family or charity" },
      { name: "Program timeline", desc: "Order of service" },
      { name: "Photo memories gallery", desc: "Life in pictures" },
      { name: "Memorial page", desc: "Long-term remembrance" },
      { name: "Funeral-specific designs", desc: "Solemn, respectful layouts" }
    ],
    slug: "funeral",
    image: funeralImg,
    stats: { created: "200+", satisfaction: "100%", label: "Families Served" },
  },
  {
    icon: Radio,
    title: "Church Events",
    description: "Elegant invitations for harvest, thanksgiving, dedications, anniversaries and every church program.",
    features: [
      { name: "Service program & order", desc: "Full church program schedule" },
      { name: "Speaker & minister profiles", desc: "Introduce your speakers" },
      { name: "Live stream embed", desc: "For members who can't attend" },
      { name: "Donation & offering links", desc: "Online giving made easy" },
      { name: "Venue & directions", desc: "Maps & location details" },
      { name: "Guest messaging wall", desc: "Blessings from the congregation" }
    ],
    slug: "church",
    image: churchImg,
    stats: { created: "180+", satisfaction: "99%", label: "Church Events Done" },
  },
  {
    icon: Baby,
    title: "Naming Ceremonies",
    description: "Celebrate the arrival of new life with joyful, shareable invitations.",
    features: [
      { name: "Baby introduction", desc: "Welcome the new arrival" },
      { name: "Name meaning display", desc: "Cultural significance" },
      { name: "Godparents section", desc: "Honor godparents" },
      { name: "Photo gallery", desc: "Baby & family photos" },
      { name: "Event details & venue", desc: "Date, time, location" },
      { name: "Guest messaging wall", desc: "Blessings & wishes" }
    ],
    slug: "naming",
    image: namingImg,
    stats: { created: "300+", satisfaction: "99%", label: "Babies Welcomed" },
  },
  {
    icon: Cake,
    title: "Birthday Celebrations",
    description: "Interactive birthday invitations that go beyond a flyer — RSVP tracking, a live wishes wall, gift wishlist and countdown, all on a link you can share on WhatsApp in seconds.",
    // Optional per-card cross-link. Rendered as a subtle text link below the
    // description. Currently only Birthday uses this — points to the Milestone
    // Birthday page so we don't need a separate 'Milestone' card cluttering
    // the services grid.
    crossLink: { label: "Planning a 30th, 40th, 50th, 60th or 70th? See our Milestone Birthday page", href: "/milestone-birthday" },
    features: [
      { name: "Countdown to the big day", desc: "Build excitement early" },
      { name: "Gift wishlist & registry", desc: "Tell guests what you'd love" },
      { name: "Guest wishes wall", desc: "Birthday messages & shoutouts" },
      { name: "RSVP tracking", desc: "Know exactly who's coming" },
      { name: "Photo & video gallery", desc: "Celebrate the journey" },
      { name: "Music player", desc: "Set the party mood" }
    ],
    slug: "birthday",
    image: birthdayImg,
    stats: { created: "220+", satisfaction: "99%", label: "Birthdays Celebrated" },
  },
  {
    icon: Heart,
    title: "Anniversary & Vow Renewal",
    description: "Mark your years together with elegant digital celebrations.",
    features: [
      { name: "Journey timeline", desc: "Years together" },
      { name: "Photo memories", desc: "Through the years" },
      { name: "Love quotes", desc: "Meaningful messages" },
      { name: "Guest messaging", desc: "Wishes from loved ones" },
      { name: "Celebration countdown", desc: "Build excitement" },
      { name: "Event details & venue", desc: "Date, time, location" }
    ],
    slug: "anniversary",
    image: anniversaryImg,
    stats: { created: "150+", satisfaction: "97%", label: "Anniversaries Celebrated" },
  },
  {
    icon: GraduationCap,
    title: "Graduation Celebrations",
    description: "Celebrate your hard-won achievement with everyone who helped you get there.",
    features: [
      { name: "Achievement showcase", desc: "Degree, honors, awards" },
      { name: "Ceremony details", desc: "Date, time, venue" },
      { name: "Party information", desc: "After-party details" },
      { name: "Photo gallery", desc: "Academic journey" },
      { name: "Thank you messages", desc: "Gratitude section" },
      { name: "Countdown timer", desc: "To graduation day" }
    ],
    slug: "graduation",
    image: graduationImg,
    stats: { created: "400+", satisfaction: "99%", label: "Graduates Honored" },
  },
  {
    icon: Building,
    title: "Corporate Events",
    description: "Professional digital invitations for conferences, product launches, and corporate gatherings.",
    features: [
      { name: "QR check-in system", desc: "Track attendance" },
      { name: "Speaker profiles", desc: "Who's presenting" },
      { name: "Registration forms", desc: "Attendee sign-up" },
      { name: "Sponsor showcase", desc: "Feature event partners" },
      { name: "Program agenda", desc: "Detailed itinerary" },
      { name: "Live stream embed", desc: "Hybrid attendance" }
    ],
    slug: "corporate",
    image: corporateImg,
    stats: { created: "120+", satisfaction: "98%", label: "Corporate Events Hosted" },
  },
];

const featureCategories = [
  {
    icon: Calendar,
    title: "Event Details & Timeline",
    color: "bg-blue-100 text-blue-600",
    tint: "from-blue-400 to-blue-600",
    soft: "bg-blue-50",
    accent: "text-blue-700",
    demoKey: "countdown",
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
    ]
  },
  {
    icon: MapPin,
    title: "Directions & Access",
    color: "bg-green-100 text-green-600",
    tint: "from-emerald-400 to-emerald-600",
    soft: "bg-emerald-50",
    accent: "text-emerald-700",
    demoKey: "map",
    features: [
      { name: "Google Maps Integration", description: "One-tap navigation to your venue" },
      { name: "Multiple Venue Support", description: "Separate directions for ceremony and reception" },
      { name: "Book a Ride", description: "Quick access to Uber, Bolt, Yango & more" },
      { name: "Nearby Accommodation", description: "Hotel suggestions for out-of-town guests" },
    ]
  },
  {
    icon: Users,
    title: "RSVP & Guest Management",
    color: "bg-purple-100 text-purple-600",
    tint: "from-purple-500 to-purple-700",
    soft: "bg-purple-50",
    accent: "text-purple-700",
    demoKey: "rsvp",
    features: [
      { name: "RSVP Tracking", description: "Know exactly who is attending your event" },
      { name: "Meal Preferences", description: "Collect dietary requirements and food choices" },
      { name: "Guest Analytics", description: "See views, RSVPs, and engagement in real-time" },
      { name: "Better Planning", description: "Helps families, churches, and planners prepare accurately" },
      { name: "RSVP Progress Bar", description: "'42 of 100 guests have said yes' — a gold progress bar guests can see" },
      { name: "Live Attending Ticker", description: "Scrolling ticker of new RSVPs — 'The Boateng family just RSVP'd'" },
    ]
  },
  {
    icon: Armchair,
    title: "Seating & Table Assignments",
    color: "bg-teal-100 text-teal-600",
    tint: "from-teal-400 to-teal-600",
    soft: "bg-teal-50",
    accent: "text-teal-700",
    demoKey: "rsvp",
    features: [
      { name: "Personal Table Card", description: "Each guest opens their invitation and sees 'You're at Table 7' — no more hunting for the seating board" },
      { name: "Named or Numbered Tables", description: "Use classic Table 1–20 or give tables warm names like 'The Kente Room', 'Ashanti Corner', 'Family Elders'" },
      { name: "Seat Numbers", description: "Optional per-seat assignment for formal dinners and weddings that need exact placement" },
      { name: "See Your Companions", description: "'You're seated with Kwame, Ama & Kofi' — guests know their tablemates before they arrive" },
      { name: "Head Table & VIP Seating", description: "Mark tables as head, family, VIP, or elder-priority — visible only to those seated there" },
      { name: "Group Assignments", description: "Assign a whole family or friend group to a table in one click from the RSVP list" },
      { name: "Live Capacity Tracker", description: "See at a glance which tables are full, which have room, and how many guests are still unassigned" },
      { name: "Auto-Group by Family", description: "System suggests groupings based on RSVP surnames and shared meal preferences" },
      { name: "Change Notifications", description: "Guests get a quiet update if their table changes — no confusion on the day" },
      { name: "Printable Seating Chart", description: "One-tap PDF export for the venue coordinator, ushers, and the entrance display" },
      { name: "Usher-Friendly Search", description: "On event day, an usher can search a guest name and instantly see their table + companions" },
      { name: "Multiple Reception Rooms", description: "Split guests across ballroom, garden, and overflow spaces with clear signage per room" },
      { name: "Accessibility Flags", description: "Mark seats near the door, on ground floor, or away from the speakers for elders and guests with mobility needs" },
      { name: "Dietary Awareness", description: "Meal preferences from RSVP flow into the seating chart so the kitchen and servers know per table" },
      { name: "Church & Funeral Seating", description: "Front-pew reservations for immediate family, choir sections, and dignitary rows" },
    ]
  },
  {
    icon: Camera,
    title: "Media & Experience",
    color: "bg-pink-100 text-pink-600",
    tint: "from-pink-400 to-rose-500",
    soft: "bg-pink-50",
    accent: "text-pink-700",
    demoKey: "gallery",
    features: [
      { name: "Photo Gallery", description: "Showcase beautiful pre-event images on your invitation" },
      { name: "Background Music", description: "Set the mood with ambient music that plays automatically" },
      { name: "Video Background", description: "Add cinematic videos to your invitation" },
      { name: "Photo Booth Frame", description: "Custom frames for event photos guests can share" },
      { name: "Live Photo Wall", description: "Guest photos taken during the event stream onto the invitation in real time" },
      { name: "Video Guestbook", description: "Guests record 15-second video wishes that stack on a memory reel" },
      { name: "Post-Event Gallery", description: "A curated album delivered to guests after the day — download and re-live" },
    ]
  },
  {
    icon: MessageSquare,
    title: "Guest Interaction",
    color: "bg-orange-100 text-orange-600",
    tint: "from-orange-400 to-amber-500",
    soft: "bg-orange-50",
    accent: "text-orange-700",
    demoKey: "messages",
    features: [
      { name: "Guest Messaging Wall", description: "Collect wishes, prayers, and heartfelt messages" },
      { name: "Digital Guestbook", description: "Guest messages & photos in one shareable book" },
      { name: "Contact Cards", description: "Let guests save your details directly to their phones" },
      { name: "WhatsApp Sharing", description: "Easy one-click sharing to family and friends" },
      { name: "Prayer Wall", description: "A dedicated space for prayer requests — church events, memorials, thanksgivings" },
      { name: "Reactions & Emojis", description: "Guests tap hearts, prayers, celebrations — the counter increments live" },
      { name: "Social Share Pack", description: "Pre-designed Instagram Stories and WhatsApp Status templates guests can post" },
    ]
  },
  {
    icon: Video,
    title: "Live & Hybrid Events",
    color: "bg-red-100 text-red-600",
    tint: "from-red-500 to-rose-600",
    soft: "bg-red-50",
    accent: "text-red-700",
    demoKey: "livestream",
    features: [
      { name: "Live Stream Embed", description: "Let guests who cannot attend watch in real-time" },
      { name: "Diaspora Friendly", description: "Perfect for family members abroad" },
      { name: "International Reach", description: "Connect with guests anywhere in the world" },
      { name: "Video Integration", description: "Add event videos and highlights" },
      { name: "Time Zone Converter", description: "Auto-shows every guest's local time — Accra 12pm = London 12pm = NY 8am" },
      { name: "Watch Party Rooms", description: "Diaspora guests join a virtual room to watch the stream together with live chat" },
      { name: "Rewind & Replay", description: "Missed the vows? Rewind the livestream and catch every moment" },
    ]
  },
  {
    icon: Heart,
    title: "Funeral & Memorial",
    color: "bg-slate-100 text-slate-600",
    tint: "from-slate-500 to-slate-700",
    soft: "bg-slate-100",
    accent: "text-slate-700",
    demoKey: "memorial",
    features: [
      { name: "Memory Tribute Wall", description: "Collect condolences and remembrance messages" },
      { name: "Respectful Design", description: "Dignified layouts specifically for memorial services" },
      { name: "Donation Links", description: "Allow guests to contribute to family or charity" },
      { name: "Memorial Page Renewal", description: "Keep memories alive with annual renewals" },
      { name: "Obituary Section", description: "Share the life story and achievements of your loved one" },
      { name: "Photo Timeline", description: "Life in pictures — birth, key milestones, the whole journey" },
      { name: "One-Week & 40-Day Announcements", description: "Auto-schedule follow-up ceremonies with new details as they're set" },
      { name: "Grave Location Map", description: "Google Maps pin for the cemetery — for family who need to visit" },
    ]
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    color: "bg-teal-100 text-teal-600",
    tint: "from-teal-400 to-cyan-600",
    soft: "bg-teal-50",
    accent: "text-teal-700",
    demoKey: "languages",
    features: [
      { name: "English + Twi", description: "Reach your local Ghanaian audience" },
      { name: "English + French", description: "Perfect for Francophone guests" },
      { name: "Additional Languages", description: "Custom translations available on request" },
      { name: "International Families", description: "Great for mixed-culture celebrations" },
      { name: "RTL Support", description: "Arabic, Hebrew & other right-to-left languages" },
      { name: "Auto-Translate Guest Messages", description: "Aunty writes in Twi, cousin in London reads in English — automatic" },
    ]
  },
  {
    icon: Gift,
    title: "Post-Event & Extras",
    color: "bg-amber-100 text-amber-600",
    tint: "from-amber-400 to-orange-500",
    soft: "bg-amber-50",
    accent: "text-amber-700",
    demoKey: "thankyou",
    features: [
      { name: "Thank You Page", description: "Express gratitude after your event beautifully" },
      { name: "Calendar Integration", description: "Guests can add your event to their calendar" },
      { name: "Custom Domain", description: "Get a personalized URL" },
      { name: "Host Dashboard", description: "Manage your event from one central place" },
      { name: "Lost & Found", description: "Report and recover misplaced items after your event" },
      { name: "Anniversary Reminders", description: "Yearly notification with your original invitation revisited — every year" },
      { name: "Post-Event Analytics Report", description: "1-week summary emailed to you: total views, RSVPs, top-viewed sections" },
    ]
  },
  {
    icon: Wallet,
    title: "Gifts & Contributions",
    color: "bg-yellow-100 text-yellow-600",
    tint: "from-yellow-400 to-amber-500",
    soft: "bg-yellow-50",
    accent: "text-yellow-700",
    demoKey: "rsvp",
    features: [
      { name: "MoMo Registry", description: "Guests contribute directly via Mobile Money — MTN, Telecel, AirtelTigo — with real-time tracking" },
      { name: "Wishlist Link", description: "Direct link to your online registry — Amazon, Zola, or your favourite store" },
      { name: "Dowry Contribution", description: "A private, family-only page for traditional dowry — kept off the public invitation" },
      { name: "Physical Gift Registry", description: "A curated list of physical gifts guests can bring or send" },
    ]
  },
  {
    icon: Baby,
    title: "Kids & Family",
    color: "bg-cyan-100 text-cyan-600",
    tint: "from-cyan-400 to-sky-500",
    soft: "bg-cyan-50",
    accent: "text-cyan-700",
    demoKey: "messages",
    features: [
      { name: "Kids Activity Zone", description: "Info on the play area, entertainment schedule, and supervision" },
      { name: "Child-Friendly Menu", description: "Meal options designed for children — nut-free, allergy-aware" },
      { name: "Breastfeeding Room", description: "Location and availability of a private, comfortable space for mothers" },
      { name: "Changing Facilities", description: "Where to find nappy-changing tables and family bathrooms" },
    ]
  },
  {
    icon: Shield,
    title: "Safety & Emergency",
    color: "bg-rose-100 text-rose-600",
    tint: "from-rose-500 to-red-600",
    soft: "bg-rose-50",
    accent: "text-rose-700",
    demoKey: "map",
    features: [
      { name: "Emergency Contacts", description: "Quick access to venue security, event coordinator, and family contacts" },
      { name: "On-Site Medic", description: "Location and hours of medical support during the event" },
      { name: "Allergy Alerts", description: "Nut-free, gluten-free, or specific allergy warnings for the venue" },
      { name: "Late-Night Transport", description: "Safe transport options for guests staying past midnight" },
    ]
  },
  {
    icon: Award,
    title: "Vendors & Credits",
    color: "bg-indigo-100 text-indigo-600",
    tint: "from-indigo-500 to-purple-600",
    soft: "bg-indigo-50",
    accent: "text-indigo-700",
    demoKey: "vendors",
    features: [
      { name: "Photographer & Videographer", description: "Credits for the team capturing your day, with their booking info" },
      { name: "Caterer", description: "Recognise your catering team — their menu and contact details" },
      { name: "MC & DJ", description: "Featured MC and DJ with their portfolios and booking links" },
      { name: "Decorator & Florist", description: "Highlight the team behind the beautiful decor" },
    ]
  },
  {
    icon: Store,
    title: "Vendor Marketplace",
    color: "bg-fuchsia-100 text-fuchsia-600",
    tint: "from-fuchsia-500 to-pink-600",
    soft: "bg-fuchsia-50",
    accent: "text-fuchsia-700",
    demoKey: "vendors",
    features: [
      { name: "Vetted Vendor Directory", description: "Hand-picked photographers, caterers, DJs, florists, MCs — every vendor reviewed and approved by VibeLink" },
      { name: "Direct-Book from Invitation", description: "Guests need a photographer for their own event? One tap to browse and book from your invitation page" },
      { name: "Verified Reviews", description: "Real ratings and reviews from Ghanaian couples who actually hired the vendor" },
      { name: "Portfolio Galleries", description: "Every vendor has a curated portfolio showcasing their best Ghanaian event work" },
      { name: "Instant Quote Requests", description: "One form goes to 3-5 matching vendors — compare quotes without endless WhatsApp back-and-forth" },
      { name: "Package Comparisons", description: "Side-by-side comparison of vendor packages — silver, gold, platinum tiers with clear inclusions" },
      { name: "Availability Calendar", description: "See which vendors are free on your date before you even reach out" },
      { name: "Regional Filter", description: "Filter by Accra, Kumasi, Takoradi, Cape Coast, or diaspora-friendly vendors serving abroad Ghanaians" },
      { name: "Ghanaian Wedding Specialists", description: "Filter for vendors experienced with kente ceremonies, traditional attire coordination, and Ghanaian menu expertise" },
      { name: "Deposit Protection", description: "VibeLink holds vendor deposits until the event happens — protects both couple and vendor" },
    ]
  },
  {
    icon: Briefcase,
    title: "For Event Planners (White-Label)",
    color: "bg-slate-100 text-slate-700",
    tint: "from-slate-600 to-slate-800",
    soft: "bg-slate-50",
    accent: "text-slate-800",
    demoKey: "vendors",
    features: [
      { name: "Your Brand, Our Platform", description: "Custom domain, your logo, your colors — clients never see the word VibeLink" },
      { name: "Multi-Event Dashboard", description: "See all your active client events at a glance — RSVPs, payments, timelines, alerts" },
      { name: "Team Collaboration", description: "Add assistant planners with role-based permissions — event coordinators, junior planners, interns" },
      { name: "Client Sub-Accounts", description: "Give each couple/family limited access to their own event without seeing your other clients" },
      { name: "Bulk Event Discount", description: "Corporate wedding planners: bulk pricing on 10+ events per year — up to 40% off retail" },
      { name: "Planner-Only Templates", description: "Access to premium invitation templates not available to individual customers" },
      { name: "Priority Support Channel", description: "Direct WhatsApp/Telegram line to our team — no waiting in customer queue" },
      { name: "Revenue Share Program", description: "Earn 15% commission on every vendor booking made through invitations you manage" },
      { name: "Branded Reports", description: "PDF reports with your branding for client wrap-ups and post-event reviews" },
      { name: "API Access", description: "Integrate VibeLink data into your existing CRM (HoneyBook, Aisle Planner, or custom)" },
    ]
  },
  {
    icon: LineChart,
    title: "Analytics for Planners",
    color: "bg-cyan-100 text-cyan-600",
    tint: "from-cyan-500 to-blue-600",
    soft: "bg-cyan-50",
    accent: "text-cyan-700",
    demoKey: "rsvp",
    features: [
      { name: "Guest Satisfaction Survey", description: "Auto-sent 24 hours post-event — 5-star ratings on food, venue, music, coordination" },
      { name: "Invitation Heatmap", description: "See exactly which sections of the invitation got the most views — inform your next design" },
      { name: "Referral Tracker", description: "Which guest brought +1s? Who came alone? Helps identify your most engaged social connectors" },
      { name: "Gift & Contribution Ledger", description: "Full export for tax reporting and personalized thank-you notes — never miss a giver" },
      { name: "RSVP Response Curve", description: "See how quickly guests RSVP after invitation send — informs your future save-the-date timing" },
      { name: "Peak Traffic Times", description: "When are guests actually looking at the invitation? Optimize when to send updates and reminders" },
      { name: "Meal Choice Analytics", description: "Vegetarian vs meat vs pescatarian split — plan catering with data, not guesses" },
      { name: "Diaspora Reach Report", description: "How many guests opened from Ghana vs UK vs US vs Canada — informs future international events" },
      { name: "Device & Browser Stats", description: "Mobile-first optimization proof — 89% opened on WhatsApp browser, 11% on desktop" },
      { name: "Year-over-Year Trends", description: "For planners with recurring clients — compare this year's engagement to last year's" },
    ]
  },
  {
    icon: Cloud,
    title: "Weather & Contingency",
    color: "bg-sky-100 text-sky-600",
    tint: "from-sky-400 to-blue-500",
    soft: "bg-sky-50",
    accent: "text-sky-700",
    demoKey: "map",
    features: [
      { name: "Rain-Plan Broadcast", description: "One tap notifies all guests if outdoor event moves indoor — WhatsApp, SMS, and email at once" },
      { name: "Alternative Venue Map", description: "Pre-configured backup venue with directions ready to activate the moment weather turns" },
      { name: "Live Weather Forecast", description: "Widget on the invitation shows 10-day forecast for your venue — guests can plan attire and travel" },
      { name: "Harmattan Season Alerts", description: "For December-February outdoor events — dust warnings, hydration reminders for elderly guests" },
      { name: "Cancellation Broadcast", description: "Emergency postponement tool — sends across every channel with the new date already pre-filled" },
      { name: "Emergency Contact Tree", description: "Pre-built cascade — venue coordinator → planner → family heads → immediate guests" },
      { name: "Traffic Incident Alerts", description: "If Accra traffic disrupts arrivals, guests get real-time alternative route suggestions" },
      { name: "Curfew / Public Holiday Awareness", description: "Auto-warns if your event date coincides with a public event that affects travel" },
      { name: "Guest Safe-Arrival Check-in", description: "Diaspora family flying in? Optional check-in when they land, delivered to family group" },
      { name: "Insurance Info Display", description: "For events with wedding insurance — quick access to policy number and claim contact" },
    ]
  },
  {
    icon: ClipboardCheck,
    title: "Vendor Management (Planner Tools)",
    color: "bg-lime-100 text-lime-700",
    tint: "from-lime-500 to-green-600",
    soft: "bg-lime-50",
    accent: "text-lime-700",
    demoKey: "vendors",
    features: [
      { name: "Payment Tracker", description: "Who's been paid, who's owed, when — never scramble for receipts on event morning" },
      { name: "Arrival Schedule", description: "Florist 6am, DJ 10am, catering 2pm — auto-reminds each vendor 24 hours + 2 hours before their slot" },
      { name: "Vendor Quick-Dial", description: "One-tap call any vendor from the event dashboard — no more digging through WhatsApp for their number" },
      { name: "Day-Of Contract Summary", description: "Every vendor's deliverables, cutoff times, and special notes in one clean card per vendor" },
      { name: "Vendor Rating Post-Event", description: "Rate each vendor privately after the event — builds your trusted-vendor list over time" },
      { name: "Deposit vs Balance Tracking", description: "See at a glance what's been secured with deposit and what balance remains for each vendor" },
      { name: "Vendor WhatsApp Groups", description: "Auto-create a group with all vendors + planner for smooth event-day coordination" },
      { name: "Meal Requirements", description: "Track which vendors need vendor meals (photographer, DJ, videographer) and dietary requests" },
      { name: "Setup/Teardown Timeline", description: "Visual timeline showing exact 30-min windows each vendor has for load-in and load-out" },
      { name: "Vendor Insurance Docs", description: "Store vendor certificates of insurance in one place — required for many venues" },
    ]
  },
  {
    icon: Compass,
    title: "Story Modes",
    color: "bg-violet-100 text-violet-600",
    tint: "from-violet-500 to-purple-600",
    soft: "bg-violet-50",
    accent: "text-violet-700",
    demoKey: "gallery",
    features: [
      { name: "Interactive Love Story Timeline", description: "Swipe through the 'how we met' journey — first meeting, first date, proposal, engagement" },
      { name: "360° Venue Tour", description: "Virtual walkthrough of the ceremony and reception space before guests arrive — reduces day-of confusion" },
      { name: "Meet the Family Q&A", description: "Short bios so guests know who's who — Aunty Ama (bride's mother), Uncle Kwame (father of the groom)" },
      { name: "Traditional Attire Style Guide", description: "What different kente patterns mean, appropriate colors for the occasion, borrowing vs buying" },
      { name: "Cultural Custom Explainer", description: "For non-Ghanaian guests — what to expect at knocking, engagement, wedding day. When to stand, when to give gifts" },
      { name: "Bride & Groom Individual Stories", description: "Separate 'about the bride' and 'about the groom' pages with childhood photos and family history" },
      { name: "Family Trees", description: "Interactive family trees showing both sides — helps distant relatives find their connection" },
      { name: "Video Prologue", description: "60-second cinematic intro that plays when guests first open the invitation — sets the emotional tone" },
      { name: "Milestone Countdown Stories", description: "Weekly story updates as the event approaches — 'This week we finalized the menu, tasted the cake, met the officiant'" },
      { name: "Post-Event Story Continuation", description: "The story keeps going after the wedding — honeymoon updates, thank-you notes, first anniversary" },
    ]
  },
  {
    icon: Tv,
    title: "Livestream & Hybrid++",
    color: "bg-red-100 text-red-600",
    tint: "from-red-500 to-rose-600",
    soft: "bg-red-50",
    accent: "text-red-700",
    demoKey: "livestream",
    features: [
      { name: "Watch Party Rooms", description: "Diaspora guests (London, NY, Toronto) can watch together in virtual rooms with group video chat" },
      { name: "Multi-Camera Switcher", description: "Guests choose which angle to watch — church main, choir, audience, drone overhead" },
      { name: "Live Translation Subtitles", description: "Real-time Twi ↔ English ↔ French ↔ Arabic captions during the ceremony" },
      { name: "Time-Zone Aware Notifications", description: "'Ceremony starts in 2 hours' delivered in each guest's local time — no math required" },
      { name: "Post-Event Downloadable Stream", description: "72-hour access to download the full recording — perfect for elderly relatives without stable internet" },
      { name: "Chapter Markers", description: "Auto-generated timestamps — Ceremony Start, Vows, Ring Exchange, First Kiss, Reception Entrance — jump straight to key moments" },
      { name: "Live Reactions Wall", description: "Diaspora guests send hearts, claps, congratulations that appear on the invitation in real time" },
      { name: "Speaker Turn-Taking Detection", description: "AI highlights whoever's speaking (bride/groom/officiant) so remote viewers don't miss the moment" },
      { name: "Auto-Highlight Reel", description: "AI cuts a 3-minute highlight from the full stream — ready to share within hours of the event ending" },
      { name: "Watch Party Host Tools", description: "One family member can be 'host' — pause the stream, add commentary, manage the virtual room" },
    ]
  },
  {
    icon: ScrollText,
    title: "Memory Books & Legacy",
    color: "bg-yellow-100 text-yellow-700",
    tint: "from-yellow-500 to-amber-600",
    soft: "bg-yellow-50",
    accent: "text-yellow-700",
    demoKey: "gallery",
    features: [
      { name: "Guest-Written Blessing Collection", description: "Every guest leaves a written blessing during RSVP — compiled into a beautiful digital keepsake book" },
      { name: "Video Guestbook", description: "Guests record 30-second video wishes — stitched into a memory reel to watch on anniversaries" },
      { name: "Time Capsule", description: "Guests write letters to be opened on your 5th, 10th, 25th anniversary — auto-delivered on the date" },
      { name: "Ancestors Gallery", description: "Photos of grandparents, great-grandparents, with brief tributes — honor those who came before" },
      { name: "Living Tribute Book (Funerals)", description: "Collect memories BEFORE elderly parent passes — a gift they can read while still alive" },
      { name: "Family Recipe Book", description: "Aunties contribute their signature recipes — mama's jollof, grandma's kelewele — compiled as a wedding gift" },
      { name: "Traditional Wisdom Archive", description: "Elders record proverbs, marriage advice, family history in Twi — preserved for the next generation" },
      { name: "Milestone Anniversary Deliveries", description: "Highlights from your wedding auto-delivered on 1st, 5th, 10th anniversary — surprise couple with memories" },
      { name: "Printed Photo Book Option", description: "Order a physical hardback photo book after the event — printed in Accra, delivered locally or internationally" },
      { name: "Legacy Website", description: "Convert your event site into a permanent family history site — accessible forever, editable by descendants" },
    ]
  },
  {
    icon: Wand2,
    title: "AI-Enhanced Features",
    color: "bg-purple-100 text-purple-600",
    tint: "from-purple-500 to-fuchsia-600",
    soft: "bg-purple-50",
    accent: "text-purple-700",
    demoKey: "messages",
    features: [
      { name: "AI Photo Restoration", description: "Blurry family photos or old grandparent photos → sharp, clear, print-ready for funeral programs and memory books" },
      { name: "AI-Generated Program in Twi + English", description: "Draft your ceremony program in both languages with one click — culturally appropriate, respectful, ready to edit" },
      { name: "AI Outfit Color Suggestions", description: "Upload your kente pattern → AI suggests coordinating outfit colors for bridesmaids, groomsmen, mothers" },
      { name: "AI-Personalized Thank-You Notes", description: "Draft unique thank-you notes for each guest — mentions their specific gift, remembers what they said in their RSVP" },
      { name: "AI RSVP Chaser", description: "Friendly, personalized reminders to non-responders — different tone for close family vs distant colleagues" },
      { name: "AI Menu Suggestions", description: "Input your guest count and budget → AI suggests culturally-appropriate menu with vendor recommendations" },
      { name: "AI Seating Suggestions", description: "Based on RSVP data and family relationships, AI proposes optimal seating chart — you approve or edit" },
      { name: "AI Speech Assistant", description: "Bride/groom/best man/MC write speeches with AI help — trained on Ghanaian wedding speech tradition" },
      { name: "AI Photo Selection", description: "Uploaded 3,000 event photos? AI picks the best 100 for the highlight album based on composition, smiles, unique moments" },
      { name: "AI Music Playlist Builder", description: "Tell AI your vibe (traditional, gospel, hiplife, afrobeats) → generates a full reception playlist with the right song order" },
    ]
  },
  {
    icon: CreditCard,
    title: "Payments & Contributions",
    color: "bg-green-100 text-green-700",
    tint: "from-green-500 to-emerald-600",
    soft: "bg-green-50",
    accent: "text-green-700",
    demoKey: "rsvp",
    features: [
      { name: "Wedding & Bridal Shower Registry", description: "Guests can choose from a curated gift list — kitchen appliances, honeymoon fund contributions, house-warming items" },
      { name: "Group Contributions", description: "'13 friends contributed GH₵50 each to Aunty Ama's 60th' — see who chipped in without exposing individual amounts to strangers" },
      { name: "Nsawa Funeral Contributions", description: "Extended family shares funeral costs transparently — set a target, see progress, get instant Mobile Money receipts" },
      { name: "Mobile Money Split Payments", description: "MTN MoMo, Telecel Cash, AirtelTigo Money — all supported. Guests pay in their preferred network without friction" },
      { name: "Foreign Exchange Calculator", description: "'You gave $50 = GH₵625' — diaspora guests see instant conversion so their generosity is clear on both sides" },
      { name: "Contribution Goal Tracker", description: "'GH₵15,000 of GH₵20,000 raised for the funeral' — visible progress bar motivates late contributors" },
      { name: "Anonymous vs Named Options", description: "Guests choose whether their contribution is publicly acknowledged or private — respecting cultural preferences" },
      { name: "Auto-Thank-You Receipts", description: "Every contributor gets a personalized thank-you receipt within 60 seconds — includes amount, event, warm message" },
      { name: "Contribution Ledger Export", description: "Full CSV/PDF export for the family — every contributor, amount, date, method — perfect for follow-up thank-you notes" },
      { name: "Multi-Currency Support", description: "Accept GH₵, USD, GBP, EUR, CAD — auto-converts to Cedis for the family, remains transparent for the giver" },
      { name: "Recurring Contributions", description: "For long-term needs (education fund, memorial upkeep) — monthly recurring contributions with auto-reminders" },
      { name: "Payment Plan Support", description: "For expensive registry items (like appliances) — multiple guests can co-contribute in installments until the item is fully funded" },
    ]
  },
  {
    icon: Landmark,
    title: "Traditional Ceremonies (Ghana-Specific)",
    color: "bg-amber-100 text-amber-700",
    tint: "from-amber-500 to-orange-600",
    soft: "bg-amber-50",
    accent: "text-amber-700",
    demoKey: "countdown",
    features: [
      { name: "Knocking Ceremony (Kokooko)", description: "Separate small invitation for the intimate first ceremony — immediate family only, with tradition explainer" },
      { name: "Engagement List of Items", description: "Digital checklist for the family — drinks, cloths, tools, cash amounts. Each item tracks who's providing it" },
      { name: "Bride Price (Ti Nsa) Transparency", description: "Private view for immediate family only — never public, respects the sacred nature of the tradition" },
      { name: "8-Day Naming Ceremony (Din To)", description: "Auto-countdown from birth to naming day with tradition explainer for both parents and international family" },
      { name: "Libation Ceremony Order", description: "Who pours, what's said, in what order — traditional or Christian variations, editable per family preference" },
      { name: "One-Week (Nnawotwe)", description: "Coordination for the one-week post-burial gathering — separate from main funeral, family-only" },
      { name: "40-Day Funeral Remembrance", description: "Auto-scheduled follow-up 40 days after burial — invites extended community for prayers and memorial meal" },
      { name: "1-Year Funeral Anniversary", description: "Yearly remembrance service coordination — becomes tradition in the family with pre-built reminder system" },
      { name: "Adae Kese Recognition", description: "For families observing traditional festivals — mark Adae Kese, Odwira, Hogbetsotso with family reunions" },
      { name: "Chief & Elder Recognition", description: "Formal acknowledgment of chiefs, queen mothers, elders attending — proper protocols and seating traditions" },
      { name: "Sankofa Tradition Explainer", description: "For diaspora returning to Ghana for their wedding — cultural onboarding for their non-Ghanaian guests" },
      { name: "Multiple Ceremony Coordination", description: "Traditional + church + civil + reception — one platform, one guest list, coordinated timeline across all four" },
      { name: "Kente Weaving Requests", description: "For couples commissioning custom kente — pattern selection, weaver contact, delivery timeline tracker" },
      { name: "Traditional Drumming & Dance Coordination", description: "Book adowa dancers, kete drummers, kpanlogo groups — verified traditional performers with regional specialties" },
    ]
  },
  {
    icon: Aperture,
    title: "Photography & Videography",
    color: "bg-neutral-100 text-neutral-700",
    tint: "from-neutral-600 to-neutral-800",
    soft: "bg-neutral-50",
    accent: "text-neutral-800",
    demoKey: "gallery",
    features: [
      { name: "Photographer Must-Take Shot List", description: "'The aunty who traveled from London', 'Grandmother giving her blessing', 'Full family portrait before ceremony' — never miss the moments that matter" },
      { name: "Videographer Timeline Sync", description: "Your videographer sees the exact minute-by-minute schedule — knows when to be where, no missed vows or first dances" },
      { name: "Drone Permit & Coordinates", description: "Pre-arranged drone flight permits with venue GPS coordinates ready for the operator — legal, safe, spectacular aerial shots" },
      { name: "Photo Release Consent Forms", description: "Guests digitally consent to appearing in photos — critical for diaspora events and social media sharing (GDPR-safe)" },
      { name: "Curated Event Hashtag", description: "Tag #KwameAndAma2027 with instructions on where to share — auto-aggregates guest photos onto your invitation site" },
      { name: "Guest Photo Upload Portal", description: "Every guest can upload their photos post-event — becomes a crowdsourced gallery you'd never capture alone" },
      { name: "Photo Delivery Pipeline", description: "Photographer uploads → guests browse and download → high-res available for family, watermarked previews for social" },
      { name: "AI Face Recognition Sorting", description: "Guests search their own face across all event photos — no more scrolling 500 photos to find yours" },
      { name: "Album Selection Voting", description: "Family votes on their favorite photos for the printed album — collective decision, no arguments" },
      { name: "Instant Preview Wall", description: "During the reception, photographer uploads → photos appear on invitation site within seconds — guests re-live moments in real time" },
      { name: "Photographer Booking Direct", description: "Book your event photographer directly from VibeLink — pre-vetted portfolios, transparent pricing, deposit protection" },
      { name: "Traditional Attire Portrait Session", description: "Coordinate a formal traditional-attire portrait session before the ceremony — outfit changes, backdrop, timing" },
    ]
  },
  {
    icon: Crown,
    title: "Bridal Party Coordination",
    color: "bg-rose-100 text-rose-600",
    tint: "from-rose-500 to-pink-600",
    soft: "bg-rose-50",
    accent: "text-rose-700",
    demoKey: "rsvp",
    features: [
      { name: "Party Members-Only Pages", description: "Private hub for bridesmaids and groomsmen — rehearsal schedule, dress fitting appointments, day-of instructions" },
      { name: "Bridesmaids' Outfit Coordinator", description: "Upload fabric swatches, share color palettes, browse suggestions — everyone knows the plan before shopping starts" },
      { name: "Groomsmen Boutonnière & Pocket Square", description: "Coordinate exact colors, style, and delivery — no more mismatched suits on wedding day" },
      { name: "Bachelor / Bachelorette Party Planning", description: "Hidden entirely from bride/groom — secret planning space for the party members" },
      { name: "Party Contact Directory", description: "One-tap access to every party member's number — no more asking 'who has Ama's number?' during setup" },
      { name: "Rehearsal Dinner Separate Invitation", description: "Different guest list, different venue, different vibe — separate invitation just for the rehearsal dinner crew" },
      { name: "Dress Fitting Appointments", description: "Central calendar for all bridesmaid fittings — auto-reminds each bridesmaid 48 hours before" },
      { name: "Party Contribution Tracker", description: "Bridal shower gift, wedding weekend accommodation split, party expenses — transparent among party members only" },
      { name: "Wedding-Weekend Group Chat", description: "Auto-created WhatsApp/Telegram group for the wedding party 2 weeks before the event — pre-loaded with schedule and contacts" },
      { name: "Day-Of Emergency Kit Checklist", description: "Bobby pins, safety pins, stain remover, bandaids, snacks — assigned to specific bridesmaids so no one forgets" },
      { name: "Chief Bridesmaid / Best Man Tools", description: "Dedicated tools for the maid of honor and best man — speech planning, schedule tracking, delegation" },
      { name: "Post-Wedding Thank-You Coordination", description: "Bride and groom thank each party member personally — pre-drafted messages, gift suggestions, delivery tracking" },
    ]
  },
];

// Computed stat totals — auto-update as we add tabs, no more stale hardcoded numbers
const TOTAL_FEATURE_CATEGORIES = featureCategories.length;
const TOTAL_FEATURES = featureCategories.reduce((sum, cat) => sum + cat.features.length, 0);

const servicesSchema = createServiceSchema(
  services.map((s) => ({ name: s.title, description: s.description }))
);

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Services", url: "/services" },
]);

// Big stat number that counts up from 0 to the target when it enters the viewport.
function StatNumber({ target, suffix = "", duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setN(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return <span ref={ref} className="tabular-nums">{n}{suffix}</span>;
}

const Services = () => {
  return (
    <Layout>
      <SEO
        title="Our Services"
        description="Digital invitations for weddings, funerals, naming ceremonies, anniversaries, graduations and corporate events in Ghana. Beautiful designs, easy sharing via WhatsApp."
        keywords="wedding invitations Ghana, funeral programs Accra, naming ceremony invitations, digital event invitations"
        canonical="/services"
        ogImage="https://vibelinkevent.com/og-services.jpg"
        jsonLd={[servicesSchema, breadcrumbSchema]}
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Event Types We Serve
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Digital Invitations for Every Occasion
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              From joyful celebrations to dignified memorials
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services - Alternating Layout */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-16 lg:space-y-24">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;
              const IconComponent = service.icon;

              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}
                >
                  {/* Mobile title (icon + title only) — shows above the image on mobile, hidden on desktop */}
                  <div className="lg:hidden flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      {service.title}
                    </h2>
                  </div>

                  {/* Image */}
                  <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="group relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] cursor-pointer"
                    >
                      <img
                        src={service.image}
                        alt={`${service.title} - Ghana`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

                      {/* Hover overlay used to show fake stats (500+ Weddings
                          Created, 98% satisfaction, etc.). Removed 2026-07-23
                          per honesty pass — site isn't public yet so per-
                          category volume claims were fabricated. The title +
                          feature list on the text side of the card already
                          communicates the value; no overlay needed. */}
                    </motion.div>
                  </div>

                  {/* Text content — desktop shows icon+title inline here; mobile skips title (already shown above image) */}
                  <div className={`space-y-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <h2 className="hidden lg:block text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                      {service.title}
                    </h2>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {service.description}
                    </p>

                    {/* Optional cross-link to a sibling page (e.g. Birthday
                        card links to /milestone-birthday). Kept subtle so it
                        doesn't compete with the primary CTAs at the bottom. */}
                    {service.crossLink && (
                      <Link
                        to={service.crossLink.href}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {service.crossLink.label} <span aria-hidden>→</span>
                      </Link>
                    )}

                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-foreground">{feature.name}</span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-3 pt-2">
                      {eventPageMap[service.slug] && (
                        <Button asChild variant="default" size="default" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md hover:shadow-lg transition-all">
                          <Link to={eventPageMap[service.slug]}>
                            Explore {service.title} →
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="default" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-500/90 hover:to-pink-500/90 text-white shadow-md hover:shadow-lg transition-all">
                        <Link to={`/portfolio?type=${service.slug}`}>See Examples</Link>
                      </Button>
                      <Button asChild size="default" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400/90 hover:to-orange-500/90 text-white shadow-md hover:shadow-lg transition-all">
                        <Link to="/get-started">Get Quote</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Your Invitation Needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Features available in our digital invitations
            </p>
          </motion.div>

          <InvitationFeaturesTabs categories={featureCategories} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-6">
              Features shown here vary by event package.
              <Link to="/pricing" className="text-primary font-medium ml-1">View our pricing</Link> to see what's included with each event.
            </p>
            <div className="mb-8 max-w-2xl mx-auto px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-sm text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Advanced features</span> such as vendor marketplace, weather contingency, planner analytics, and enterprise white-label are part of our
              <Link to="/pricing" className="font-semibold underline underline-offset-2 mx-1">Bespoke package</Link>
              or available on request.
              <Link to="/contact" className="font-semibold underline underline-offset-2 ml-1">Talk to us for a custom quote.</Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <Link to="/pricing">View Pricing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/get-started">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Features Grid - Enhanced with animations */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Packed with Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">By the Numbers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The scale behind every VibeLink invitation
            </p>
          </motion.div>

          {/* Stats — 4 big animated counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-16">
            {[
              { n: TOTAL_FEATURES, suffix: "", label: "Features included", tint: "from-primary to-purple-600" },
              { n: TOTAL_FEATURE_CATEGORIES, suffix: "", label: "Feature categories", tint: "from-secondary to-yellow-400" },
              { n: 1, suffix: "", label: "Link, every guest", tint: "from-emerald-500 to-teal-600" },
              { n: 9, suffix: "", label: "Event types covered", tint: "from-pink-500 to-rose-600" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br ${s.tint} bg-clip-text text-transparent leading-none mb-2`}>
                  <StatNumber target={s.n} suffix={s.suffix} />
                </div>
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Members' picks header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs md:text-sm font-bold uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Members' picks
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">The features people love most</h3>
            <p className="text-sm md:text-base text-muted-foreground">Six crowd-favourites from the families we've served</p>
          </motion.div>

          {/* Members' picks — 6 curated cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-6xl mx-auto">
            {[
              {
                icon: Timer,
                title: "Live Countdown",
                desc: "Build excitement day-by-day, hour-by-hour — right up to the moment guests arrive.",
                tint: "from-orange-500 to-amber-500",
              },
              {
                icon: MapPin,
                title: "Google Maps + Ride",
                desc: "One-tap navigation to the venue. Book Uber, Bolt or Yango right from the invitation.",
                tint: "from-emerald-500 to-teal-600",
              },
              {
                icon: Radio,
                title: "Live Stream Embed",
                desc: "Family in Berlin joins the church in Kumasi. Live, in real time, on one link.",
                tint: "from-red-500 to-rose-600",
              },
              {
                icon: ClipboardList,
                title: "RSVP Tracking",
                desc: "Know exactly who's coming — attending, meals, plus-ones — no more guesswork or spreadsheets.",
                tint: "from-purple-500 to-indigo-600",
              },
              {
                icon: Wallet,
                title: "MoMo Registry",
                desc: "Guests contribute via MTN, Telecel or AirtelTigo. Real-time tracking. Zero setup for the host — standard network charges still apply as normal.",
                tint: "from-yellow-500 to-amber-600",
              },
              {
                icon: Image,
                title: "Post-Event Gallery",
                desc: "A curated album delivered to every guest after the day — memories, forever.",
                tint: "from-pink-500 to-rose-600",
              },
            ].map((f, i) => {
              const IconComponent = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 18 }}
                  whileHover={{ y: -6 }}
                  className="group relative p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Members' pick chip */}
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles className="h-2.5 w-2.5" />
                    Pick
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center shadow-md mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" strokeWidth={2.25} />
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                  {/* Accent bar on hover */}
                  <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${f.tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </motion.div>
              );
            })}
          </div>

          {/* Interactive CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <motion.p
              className="text-muted-foreground mb-6"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              All features designed to make your event unforgettable
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild variant="default" size="lg" className="group">
                <Link to="/get-started" className="gap-2">
                  Start Creating
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-flex"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Event pages strip */}
      <section className="py-8 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Dedicated Pages for Every Event</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "💍 Weddings", href: "/wedding-invitations" },
              { label: "💎 Engagement", href: "/engagement-invitations" },
              { label: "🕊️ Funerals", href: "/funeral-programs" },
              { label: "👶 Naming Ceremony", href: "/naming-ceremony" },
              { label: "🎓 Graduation", href: "/graduation" },
              { label: "🎂 Birthday", href: "/birthday" },
              { label: "🥂 Anniversary", href: "/anniversary-invitations" },
              { label: "⛪ Church Events", href: "/church-events" },
              { label: "💼 Corporate", href: "/corporate-events" },
            ].map(e => (
              <Link key={e.href} to={e.href}
                className="px-4 py-2 rounded-full border border-border bg-background text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                {e.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick nav strip */}
      <section className="py-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works →</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">View Pricing →</Link>
            <Link to="/portfolio" className="hover:text-primary transition-colors">See Portfolio →</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">Read Our Blog →</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQs →</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Services;

