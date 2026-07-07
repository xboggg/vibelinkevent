import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import SEO, { createServiceSchema, createBreadcrumbSchema } from "@/components/SEO";
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
    description: "Beautiful digital invitations for your traditional, white wedding, or both.",
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
    description: "Dignified digital invitations for the knocking, customary marriage and engagement ceremony — where two families become one.",
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
    description: "Elegant digital invitations for harvest services, thanksgiving, dedications, pastor anniversaries, and all church programs.",
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
    description: "Celebrate the arrival of new life with joyful digital invitations.",
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
    description: "Make every birthday unforgettable with vibrant, personalised digital invitations.",
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
    description: "Share your academic achievements with family and friends.",
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
    icon: Camera,
    title: "Media & Experience",
    color: "bg-pink-100 text-pink-600",
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
    features: [
      { name: "MoMo Registry", description: "Guests contribute directly via Mobile Money — MTN, Vodafone, AirtelTigo — with real-time tracking" },
      { name: "Wishlist Link", description: "Direct link to your online registry — Amazon, Zola, or your favourite store" },
      { name: "Dowry Contribution", description: "A private, family-only page for traditional dowry — kept off the public invitation" },
      { name: "Physical Gift Registry", description: "A curated list of physical gifts guests can bring or send" },
    ]
  },
  {
    icon: Baby,
    title: "Kids & Family",
    color: "bg-cyan-100 text-cyan-600",
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
    features: [
      { name: "Photographer & Videographer", description: "Credits for the team capturing your day, with their booking info" },
      { name: "Caterer", description: "Recognise your catering team — their menu and contact details" },
      { name: "MC & DJ", description: "Featured MC and DJ with their portfolios and booking links" },
      { name: "Decorator & Florist", description: "Highlight the team behind the beautiful decor" },
    ]
  },
];

const servicesSchema = createServiceSchema(
  services.map((s) => ({ name: s.title, description: s.description }))
);

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Services", url: "/services" },
]);

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
                  <div className={`space-y-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                      {service.title}
                    </h2>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {service.description}
                    </p>

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

                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/70 to-primary/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                        <div className="text-center text-primary-foreground">
                          <div className="text-5xl md:text-6xl font-bold mb-2">{service.stats.created}</div>
                          <div className="text-lg font-medium mb-4 opacity-90">{service.stats.label}</div>
                          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <span className="text-sm">Client Satisfaction:</span>
                            <span className="text-lg font-bold">{service.stats.satisfaction}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCategories.map((category, catIndex) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">{category.title}</h3>
                  </div>

                  <ul className="space-y-4">
                    {category.features.map((feature) => (
                      <li key={feature.name} className="group">
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground block">{feature.name}</span>
                            <span className="text-sm text-muted-foreground">{feature.description}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-6">
              Features availability varies by package.
              <Link to="/pricing" className="text-primary font-medium ml-1">View our pricing</Link> to see what is included in each tier.
            </p>
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">At a Glance</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Quick overview of what makes VibeLink special
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
            {[
              { icon: Timer, label: "Countdown Timer", color: "from-orange-500 to-amber-500", delay: 0 },
              { icon: Image, label: "Photo Gallery", color: "from-pink-500 to-rose-500", delay: 0.05 },
              { icon: Music, label: "Background Music", color: "from-purple-500 to-indigo-500", delay: 0.1 },
              { icon: ClipboardList, label: "RSVP Tracking", color: "from-blue-500 to-cyan-500", delay: 0.15 },
              { icon: MapPin, label: "Google Maps", color: "from-green-500 to-emerald-500", delay: 0.2 },
              { icon: Calendar, label: "Calendar Sync", color: "from-teal-500 to-cyan-500", delay: 0.25 },
              { icon: MessageSquare, label: "Guest Messages", color: "from-yellow-500 to-orange-500", delay: 0.3 },
              { icon: Link2, label: "Donation Link", color: "from-red-500 to-pink-500", delay: 0.35 },
              { icon: BarChart3, label: "Analytics", color: "from-indigo-500 to-purple-500", delay: 0.4 },
              { icon: Globe, label: "Custom Domain", color: "from-cyan-500 to-blue-500", delay: 0.45 },
              { icon: Smartphone, label: "Mobile Ready", color: "from-emerald-500 to-green-500", delay: 0.5 },
              { icon: Share2, label: "WhatsApp Share", color: "from-green-600 to-emerald-600", delay: 0.55 },
              { icon: Search, label: "Lost & Found", color: "from-slate-500 to-gray-600", delay: 0.6 },
              { icon: Car, label: "Book a Ride", color: "from-yellow-500 to-amber-600", delay: 0.65 },
              { icon: Radio, label: "Live Streaming", color: "from-red-600 to-rose-600", delay: 0.7 },
              { icon: Video, label: "Video Background", color: "from-violet-500 to-purple-600", delay: 0.75 },
              { icon: Frame, label: "Photo Booth Frame", color: "from-fuchsia-500 to-pink-600", delay: 0.8 },
              { icon: Wallet, label: "QR Check-in", color: "from-orange-600 to-red-500", delay: 0.85 },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: item.delay,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.08,
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative cursor-pointer"
                >
                  <div className="relative flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                    {/* Gradient glow on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    {/* Icon container with gradient */}
                    <motion.div
                      className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <IconComponent className="h-7 w-7 text-white" />

                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
                        initial={{ x: "-100%", opacity: 0 }}
                        whileHover={{ x: "100%", opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.div>

                    {/* Label */}
                    <span className="text-sm font-semibold text-foreground text-center relative z-10 group-hover:text-primary transition-colors duration-300">
                      {item.label}
                    </span>

                    {/* Check badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: item.delay + 0.3, type: "spring", stiffness: 500 }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-md"
                    >
                      <Check className="h-3.5 w-3.5 text-accent-foreground" />
                    </motion.div>
                  </div>
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

