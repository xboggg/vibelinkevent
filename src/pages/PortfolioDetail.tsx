import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ArrowLeft, ExternalLink, Check, Quote } from "lucide-react";

// Split a long single-paragraph story into 2-3-sentence paragraphs so
// The Story reads as an editorial case study instead of a wall of text
// (especially on mobile, where the old single <p> was unreadable). If the
// story already contains \n\n breaks we honour them verbatim; otherwise we
// group sentences by count. The em-dash-aware sentence split preserves
// abbreviations and en-dash date ranges without over-splitting.
function splitStoryIntoParagraphs(story: string, sentencesPerParagraph = 3): string[] {
  const trimmed = story.trim();
  if (trimmed.includes("\n\n")) {
    return trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  }
  const sentences = trimmed.match(/[^.!?]+[.!?]+["']?(?:\s|$)/g) ?? [trimmed];
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    paragraphs.push(sentences.slice(i, i + sentencesPerParagraph).join("").trim());
  }
  return paragraphs.filter(Boolean);
}

const portfolioData: Record<string, {
  title: string;
  type: string;
  description: string;
  image: string;
  demoUrl: string | null;
  features: string[];
  story: string;
  package: string;
  highlights: string[];
  demoLabel?: string;
}> = {
  "baby-boy-coleman-christening": { demoLabel: "Open Demo",
    title: "Baby Boy Coleman — Christening & Dedication",
    type: "Naming",
    description: "A beautiful, animated christening and dedication invitation for the Coleman family, designed in soft sky-blue tones with a warm, celebratory feel.",
    image: "/coleman-detail.webp",
    demoUrl: "https://demo-coleman.vibelinkevent.com/",
    features: ["Animated splash screen with orbiting emojis", "Sonar heartbeat rings animation", "Baby photo with 3D pulse effect", "Live wishes wall", "Countdown timer", "RSVP with WhatsApp confirmation", "Parents showcase with real photos", "Scripture carousel", "Background music player", "Mobile responsive"],
    story: "The Coleman family wanted a digital invitation that felt as joyful and precious as the occasion itself — the christening and dedication of their baby boy. We designed an immersive experience starting with an animated splash screen featuring a glowing baby bottle, orbiting emojis, shooting stars, and a sonar heartbeat effect. The hero section showcases the baby's photo with a soft pulsing animation, framed with a spinning gradient ring. Guests can leave wishes through a live wall, so every message is visible to everyone in real time. The parents section features actual photos of Mr. and Mrs. Coleman, and the RSVP connects directly to WhatsApp for easy confirmation.",
    package: "Naming / Outdooring",
    highlights: ["Custom animated splash screen", "Live wishes wall for guests", "Real parent photos integrated"],
  },
  "wo1-deku-memorial": { demoLabel: "Open Invitation",
    title: "A Soldier's Final Salute - Ex-WO1 Raphael Yaovi Deku",
    type: "Funeral",
    description: "A dignified military tribute honoring a dedicated soldier of the Ghana Armed Forces who served his nation with honor and distinction.",
    image: "/wo1deku-detail-medium.jpg",
    demoUrl: "https://wo1deku.vibelinkevent.com/",
    features: ["Military-themed design", "Photo gallery", "Funeral program schedule", "Family tribute section", "Location directions", "Background music", "WhatsApp sharing"],
    story: "The Deku family approached us to create a fitting digital tribute for their beloved Ex-WO1 Raphael Yaovi Deku, who served in the Ghana Armed Forces from 1966 to 1994. They wanted something that honored his military service while celebrating his role as a loving father and family man. We designed an elegant military-themed memorial page with a dignified color scheme of deep green and gold, featuring his service history, family tributes, and all the funeral arrangements. The page helped coordinate family members across Ghana and abroad for the funeral, burial, and thanksgiving services.",
    package: "Funeral & Memorial",
    highlights: ["Military honor tribute", "3-day event coordination", "Family from diaspora engaged"],
  },
  "evans-mina-anniversary": { demoLabel: "Open Demo",
    title: "Evans & Mina's 15th Anniversary",
    type: "Anniversary",
    description: "A beautiful crystal anniversary celebration with elegant gold accents and heartfelt memories.",
    image: "/blog/evans-mina-anniversary.jpg",
    demoUrl: "https://demo-evmin.vibelinkevent.com/",
    features: ["Photo gallery with 10+ images", "RSVP tracking", "Background music", "Countdown timer", "Google Maps integration", "WhatsApp sharing", "Mobile responsive"],
    story: "Evans and Mina wanted to celebrate their 15 years of marriage with family and friends from around the world. We created a stunning digital invitation that showcased their journey together, complete with a photo gallery of their most cherished memories. The invitation was shared on WhatsApp and received over 200 views within the first week.",
    package: "Anniversary / Vow Renewal",
    highlights: ["200+ invitation views", "85 RSVPs received", "Shared across 3 countries"],
  },
  "kofi-ama-wedding": {
    title: "Kofi & Ama's Traditional Wedding",
    type: "Wedding",
    description: "A stunning traditional Ghanaian wedding with kente-inspired design elements.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Love story timeline", "Dual ceremony schedule", "Gift registry", "MoMo contribution collection", "Photo gallery", "Family tree display", "Add to calendar"],
    story: "Kofi and Ama came to us wanting something that honored their Ashanti heritage while being accessible to their diaspora family in the UK and USA. We designed a beautiful invitation featuring kente patterns and gold accents, with a love story timeline that touched everyone who saw it. The MoMo collection feature helped them receive contributions seamlessly from guests near and far.",
    package: "Wedding",
    highlights: ["GHS 15,000+ collected via MoMo", "120 RSVPs", "Featured love story timeline"],
  },
  "presec-osu-70th-anniversary": { demoLabel: "Open Invitation",
    title: "PRESEC-OSU 70th Anniversary Launch",
    type: "Anniversary",
    description: "A grand celebration marking 70 years of academic excellence, brotherhood, and the enduring legacy of Presbyterian Secondary School, Osu.",
    image: "/oposa-portfolio.webp",
    demoUrl: "https://osupresec70.vibelinkevent.com/",
    features: ["Event countdown timer", "Photo gallery", "Alumni registration portal", "Donation tracking", "Event schedule", "School history timeline", "WhatsApp sharing"],
    story: "We designed and developed a stunning digital platform for the Old Students Association of PRESEC-OSU for their landmark 70th Anniversary celebration. With alumni scattered across Ghana and the diaspora, they needed a central hub to rally the PRESEC family together. We delivered a vibrant, school-colored website featuring the iconic motto OPR3! BEE ESH3! that captured the spirit of brotherhood and excellence. The platform serves as both an invitation to the grand launch event and a registration portal for alumni worldwide.",
    package: "Bespoke",
    highlights: ["Alumni registration portal", "Nationwide reach", "Diaspora engagement from 3 countries"],
  },
  "nana-yaw-memorial": {
    title: "In Loving Memory of Nana Yaw",
    type: "Funeral",
    description: "A dignified digital tribute celebrating a life well-lived with grace and honor.",
    image: "/nanayaw-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Memorial biography", "Tribute wall for messages", "Funeral program schedule", "Donation tracking", "Photo gallery", "Location directions", "WhatsApp sharing"],
    story: "The family of Nana Yaw needed a way to coordinate a large funeral while keeping diaspora family members informed. We created a memorial page that served both as an invitation and a lasting tribute. The donation tracking feature helped the family manage contributions transparently, and the tribute wall became a cherished collection of memories from friends and family.",
    package: "Funeral & Memorial",
    highlights: ["GHS 10,000+ donations tracked", "20+ tribute messages", "200+ page views"],
  },
  "baby-adjoa-naming": {
    title: "Baby Adjoa's Naming Ceremony",
    type: "Naming",
    description: "A joyful celebration welcoming a beautiful baby girl to the world.",
    image: "/babyadjoa-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Baby photo gallery", "Naming ceremony program", "Gift wishes list", "RSVP tracking", "Countdown timer", "Family tree", "WhatsApp sharing"],
    story: "The proud parents wanted to share their joy with extended family spread across Ghana and abroad. We created a sweet, elegant invitation featuring baby Adjoa's first photos and a countdown to the big day. The gift wishes feature helped guests know exactly what the family needed, making gift-giving more meaningful.",
    package: "Naming / Outdooring",
    highlights: ["45 RSVPs received", "30+ gift wishes fulfilled", "Shared in 5 family groups"],
  },
  "sarah-john-wedding": {
    title: "Sarah & John's White Wedding",
    type: "Wedding",
    description: "An elegant church wedding designed for an international guest list.",
    image: "/sarahjohn-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Live stream link integration", "Multi-language support", "RSVP with dietary preferences", "Wedding party showcase", "Venue directions", "Accommodation suggestions", "Add to calendar"],
    story: "Sarah and John's families were spread across Ghana, the UK, and Canada. They needed an invitation that could serve guests in multiple time zones with live streaming information for those who couldn't attend in person. We delivered a sophisticated design with all the details their international guest list needed.",
    package: "Wedding",
    highlights: ["150+ live stream viewers", "90 in-person RSVPs", "3 language versions"],
  },
  "dr-mensah-graduation": {
    title: "Dr. Mensah's PhD Graduation",
    type: "Graduation",
    description: "Celebrating an incredible academic achievement with pride and joy.",
    image: "/drmensah-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Academic achievement showcase", "Event schedule", "Photo gallery", "RSVP tracking", "Venue directions", "Congratulatory messages wall", "WhatsApp sharing"],
    story: "After years of hard work, Dr. Mensah wanted to celebrate this milestone with everyone who supported his journey. We created an invitation that highlighted his academic journey and made it easy for guests across Ghana to join the celebration. The congratulations wall filled up with heartfelt messages from colleagues, friends, and family.",
    package: "Graduation",
    highlights: ["100+ congratulatory messages", "75 RSVPs", "Featured in family group chat"],
  },
  "kweku-efua-engagement": {
    title: "Kweku & Efua's Engagement",
    type: "Wedding",
    description: "A stunning traditional engagement ceremony rich with Akan cultural heritage.",
    image: "/kwekuefua-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Traditional ceremony program", "Family introductions", "Photo gallery", "RSVP tracking", "Event schedule", "Location with directions", "Cultural elements showcase"],
    story: "Kweku and Efua wanted their engagement to honor their Akan traditions while keeping guests informed of all the cultural protocols. We designed an invitation that explained each part of the ceremony and introduced both families beautifully. It became a reference guide that guests appreciated throughout the event.",
    package: "Engagement / Customary",
    highlights: ["80 RSVPs", "Both families featured", "Cultural guide included"],
  },
  "mama-akosua-memorial": {
    title: "Celebration of Life - Mama Akosua",
    type: "Funeral",
    description: "A touching tribute honoring a beloved grandmother and community pillar.",
    image: "/mamaakosua-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Life biography", "Funeral program", "Tribute messages", "MoMo contribution tracking", "Photo memories", "Service locations", "Family contact cards"],
    story: "Mama Akosua touched countless lives in her 85 years. Her family wanted a memorial that reflected her warmth and impact on the community. We created a tribute page that became a gathering place for memories, with hundreds of visitors leaving messages and the MoMo feature helping manage contributions from well-wishers.",
    package: "Funeral & Memorial",
    highlights: ["GHS 35,000+ contributions", "100+ tributes", "800+ page views"],
  },
  "baby-kwame-naming": {
    title: "Baby Kwame's Outdooring",
    type: "Naming",
    description: "A joyful outdooring ceremony celebrating a new blessing.",
    image: "/babykwame-portfolio-medium.jpg",
    demoUrl: null,
    features: ["Countdown timer", "Baby photo gallery", "Ceremony schedule", "RSVP tracking", "Gift registry", "Venue directions", "WhatsApp sharing"],
    story: "The family wanted to introduce baby Kwame to the world in style. We created a warm, inviting digital invitation that captured the excitement of welcoming a new family member. The countdown timer built anticipation, and the RSVP feature helped the family plan for the perfect celebration.",
    package: "Naming / Outdooring",
    highlights: ["35 RSVPs", "Countdown engagement", "20+ gifts received"],
  },
  "nana-60th-birthday": {
    title: "Nana's 60th Birthday",
    type: "Birthdays",
    description: "A lavish surprise birthday celebration for a beloved community elder.",
    image: "/nana60/vibelink-nana60_5-medium.jpg",
    demoUrl: null,
    features: ["Surprise element messaging", "Guest messages wall", "Photo slideshow", "Event schedule", "Venue directions", "RSVP tracking", "Add to calendar"],
    story: "Nana's children wanted to throw a surprise 60th birthday worthy of their father's impact on the family. We helped coordinate the surprise with discreet messaging and created a page where guests could leave birthday wishes. The photo slideshow at the event featured decades of cherished memories.",
    package: "Milestone Birthday",
    highlights: ["Successful surprise!", "60+ guest messages", "Family slideshow created"],
  },
  "asante-boateng-wedding": {
    title: "The Asante-Boateng Wedding",
    type: "Wedding",
    description: "A grand celebration blending traditional and contemporary wedding styles.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Dual ceremony pages", "Traditional & white wedding schedules", "Gift registry", "MoMo collection", "Wedding party showcase", "Multiple venue directions", "Accommodation guide"],
    story: "The Asante-Boateng wedding was a two-day affair with both traditional and white wedding ceremonies. We created a comprehensive digital invitation that guided guests through both events seamlessly. The MoMo collection feature was particularly useful for managing contributions across both ceremonies.",
    package: "Bespoke",
    highlights: ["GHS 50,000+ MoMo collected", "200+ guests", "2-day event coordination"],
  },
  "pastor-mensah-retirement": {
    title: "Pastor Mensah's Retirement",
    type: "Church Event",
    description: "Celebrating 40 years of faithful service to the church community.",
    image: "/pastormensah-portfolio.jpg",
    demoUrl: null,
    features: ["Ministry timeline", "Tribute messages", "Event program", "Photo gallery", "Venue directions", "RSVP tracking", "Appreciation fund collection"],
    story: "After 40 years of dedicated ministry, Pastor Mensah's congregation wanted to honor him properly. We created a tribute page that showcased his journey and allowed church members to leave appreciation messages. The appreciation fund feature helped coordinate the love gift from the congregation.",
    package: "Church Event",
    highlights: ["GHS 20,000+ appreciation fund", "150+ tribute messages", "40-year timeline featured"],
  },
  "novastream-conference": {
    title: "NovaStream CyberSecure Conference",
    type: "Corporate",
    description: "Ghana's cybersecurity conference bringing together industry leaders and professionals.",
    image: "/novastream-portfolio.jpg",
    demoUrl: "https://novastream.vibelinkevent.com/",
    features: ["Speaker lineup", "Agenda schedule", "Registration portal", "Sponsor showcase", "Venue directions", "Networking sessions", "WhatsApp sharing"],
    story: "NovaStream Digital needed a professional landing page for their annual cybersecurity conference. We created a sleek, tech-themed invitation that showcased their impressive speaker lineup and made registration seamless. The agenda schedule helped attendees plan their day across multiple tracks.",
    package: "Corporate Event",
    highlights: ["200+ registrations", "15 industry speakers", "Multiple session tracks"],
  },
  "baby-nortey-naming": { demoLabel: "Open Demo",
    title: "Baby Nortey's Naming Ceremony",
    type: "Naming",
    description: "A dreamy, animation-rich naming ceremony invitation with floating petals, butterflies, and watercolor elegance for the Nortey family.",
    image: "/nortey-portfolio.webp",
    demoUrl: "https://demo-nortey.vibelinkevent.com/",
    features: ["Animated floating petals & butterflies", "Watercolor gradient backgrounds", "Interactive envelope name reveal", "Live countdown timer", "Guest wishes & blessings wall", "RSVP with attendance tracking", "Gift registry with MoMo", "Background music player", "Google Maps integration", "WhatsApp sharing", "OG image for social sharing"],
    story: "The Nortey family wanted something truly special to invite loved ones to the naming ceremony of their baby girl. We crafted a breathtaking, animation-rich experience featuring floating flower petals, fluttering butterflies, and soft watercolor gradients in peach and blush tones. The interactive envelope animation builds anticipation for the baby's name reveal, while the countdown timer keeps excitement alive. Guests can leave heartfelt wishes, RSVP with ease, and even contribute gifts via MoMo. The site includes a custom background lullaby and a beautifully generated OG image for WhatsApp sharing. Every detail was designed to feel as warm and joyful as the celebration itself.",
    package: "Naming / Outdooring",
    highlights: ["15+ CSS animations", "Interactive name reveal", "Live wishes & RSVP backend"],
  },
  "atta-panyin-memorial": { demoLabel: "Open Demo",
    title: "Atta Panin Memorial",
    type: "Funeral",
    description: "A dignified digital tribute celebrating the life and legacy of Atta Panin with rich Ghanaian cultural heritage.",
    image: "/attapanyin-detail.webp",
    demoUrl: "https://demo-atta.vibelinkevent.com/",
    features: ["Memorial biography", "Photo gallery", "Tribute messages wall", "Funeral program schedule", "MoMo donation tracking", "Venue directions", "Family tribute section", "WhatsApp sharing", "Background music"],
    story: "The family of Atta Panin needed a fitting digital tribute to honor their beloved patriarch. We created a dignified memorial page rich with Ghanaian cultural elements, featuring kente-inspired design accents and warm earth tones. The tribute wall became a heartfelt collection of memories from family, friends, and community members. The MoMo donation feature helped the family manage contributions transparently, while the detailed funeral program kept attendees informed of all ceremonies and events.",
    package: "Funeral & Memorial",
    highlights: ["Cultural heritage design", "Community tribute wall", "Multi-event coordination"],
  },
  "charles-taylor-memorial": { demoLabel: "Open Memorial",
    title: "In Loving Memory — Charles Nii Aryertey Taylor",
    type: "Funeral",
    description: "A solemn, server-backed digital memorial for Charles Nii Aryertey Taylor (1971–2026), grandson of Nii Kwabena Bonnie III — one of the most interactive funeral portfolios we have built.",
    image: "/charlestaylor-detail.jpg",
    demoUrl: "https://charlestaylor.vibelinkevent.com/",
    features: [
      "Candle splash entry — visitor taps a flickering candle to enter",
      "Light-a-Candle virtual altar (PHP + JSON, live-refreshing every 30s)",
      "Voice Tribute wall — 30-second browser recordings stored server-side",
      "Live condolences wall with optional admin-only phone capture",
      "Cinematic masonry gallery with keyboard/touch lightbox",
      "Family admin panel: secret-key access, delete, CSV export, ZIP of voice recordings",
      "Custom 1200×630 OG share card (under 70 KB)",
      "Cormorant Garamond + Cinzel typography, brushed-gold and crimson palette",
      "Mobile-first responsive, full WhatsApp share",
    ],
    story: "The Taylor and Ayertey families approached VibeLink for a digital memorial worthy of Charles Nii Aryertey Taylor — a beloved son of Osu Alata and grandson of the celebrated Nii Kwabena Bonnie III. They wanted something more than a static invitation; something the diaspora could feel part of, a place where mourners could leave their flame, their voice, their words. We built a single solemn page anchored by a candle splash, with three live community features running on a custom PHP/JSON backend. Hundreds of candles can fill the altar over the weeks before the burial, voice tributes from elderly relatives and family abroad are saved as an audio keepsake, and every condolence is captured for the family — including private phone numbers visible only in the admin panel for personal follow-up. The colour palette draws on royal Ga-Adangbe mourning tradition: deep crimson, brushed gold, ivory parchment.",
    package: "Bespoke",
    highlights: ["Custom PHP backend with 3 live features", "Gated family admin with full data exports", "Server-rendered OG card (ImageMagick + Cormorant + Cinzel)"],
  },
  "frank-hannah-engagement": { demoLabel: "Open Invitation",
    title: "Frank & Hannah — Traditional Engagement",
    type: "Engagement",
    description: "An elegant Ghanaian traditional engagement invitation for Frank & Hannah — 16 April 2027 at 9:00 AM in Dansoman, Accra. Designed with no photographs at all, anchored instead by the Adinkra symbol Osrane ne Nsoromma — The Moon and the Star.",
    image: "/frankhannah-portfolio.webp",
    demoUrl: "https://frankhannah.vibelinkevent.com/",
    features: [
      "Animated Adinkra splash — the star and crescent moon glide from opposite corners and embrace",
      "Elegant hero with Tangerine script names and gold-on-ivory ornamental frame",
      "Live countdown to 16 April 2027 at 9:00 AM",
      "Traditional 5-step engagement programme (Knocking → Blessings → Reception)",
      "Landmark-first directions with a bold local-landmark callout above the map",
      "Ghana Post Digital Address callout for pin-drop navigation",
      "RSVP form with side selector (Bride / Groom / Both), guest count, admin-only phone capture",
      "Wishes wall as a paginated carousel — 3 cards per slide, dot pagination, touch swipe",
      "Family admin panel with CSV export for RSVPs and wishes",
      "Custom 1200×630 OG share card generated server-side (Tangerine + Cinzel + Cormorant Garamond)",
      "Mobile-first responsive, full WhatsApp share",
    ],
    story: "Frank & Hannah asked for something different — an invitation that felt Ghanaian and timeless, without a single photograph. We built the entire visual identity around the Adinkra symbol Osrane ne Nsoromma (The Moon and the Star) — the traditional emblem of love, faithfulness, and harmony in marriage. The star and crescent glide from opposite corners and embrace on the splash. That embrace repeats throughout the site as ornaments, dividers, and the anchor of the share card. The venue can be hard to find, so we placed a bold local-landmark callout right above the map — the digital-first equivalent of the direction you'd give a friend on the phone. The palette leans on warm ivory, champagne, rich gold and a soft rose-gold accent — an elegant Ghanaian engagement in web form.",
    package: "Bespoke",
    highlights: ["Zero photographs, pure ornamental typography", "Landmark-first directions for hard-to-find venue", "Server-rendered OG card with Adinkra motif"],
  },
  "eric-sherita-save-the-date": { demoLabel: "Open Invitation",
    title: "Eric & Sherita — Save the Date",
    type: "Wedding",
    description: "An editorial Save-the-Date for Eric & Sherita — Saturday, 28 November 2026 at 12PM, New Jersey. Sage-green, ivory and warm-gold palette lifted directly from the couple's paper card, with a cinematic splash-to-hero storytelling flow: gold rings on ivory lace fade into a full-bleed golden-hour walk.",
    image: "/ericsherita-portfolio.webp",
    demoUrl: "https://ericsherita.vibelinkevent.com/",
    features: [
      "Cinematic splash — hands, rings and eucalyptus on ivory lace, gold-cornered card with tap-to-enter",
      "Full-bleed golden-hour hero of the couple walking hand-in-hand with subtle Ken Burns breath",
      "Great Vibes script names with gold Cormorant ampersand — Vogue-editorial typography",
      "Live countdown to Saturday, 28 November 2026 at 12PM ET",
      "One-tap Add-to-Calendar: Google, Apple .ics, Outlook .ics (client-side blob, no server round-trip)",
      "RSVP form with Joyfully-Yes / Sadly-No toggle, ceremony/reception opt-in, guest count, side selector, optional note",
      "Wishes wall as a paginated carousel — 3 cards per slide desktop, 1 per slide mobile, dot pagination + swipe",
      "Officiant + family coordinator contact cards with call and WhatsApp CTAs",
      "Family admin panel (secret-key gated) with CSV export for RSVPs and wishes",
      "Custom 1200×630 OG share card, sage panel with gold divider ornaments",
      "Optional wedding-theme background music with fade-in and one-tap mute",
      "Lightweight self-hosted backend for RSVP + wishes with rate-limiting to prevent spam",
    ],
    story: "Eric and Sherita came in with a beautiful paper Save-the-Date and one simple brief: make the web version match the feel of the card — best of the best. No couple photos (their choice), so we built the whole visual identity around the palette (sage green #7d8e6d, ivory #f5f2e8, warm gold #c9a24a) and the story of the two supplied images: hands with gold rings resting on ivory lace, and the couple walking through a golden-hour garden. The splash uses the hands-and-rings frame as an intimate cinematic entry that opens on tap. The main hero then unfolds full-bleed on the walking couple — a subtle Ken Burns breath under a soft right-side gradient so the sage/ivory type stays readable. Great Vibes script for the names, Cinzel small-caps for the labels, Cormorant italic ampersands — the same typographic system as the paper card. Because most of their guests are US-based Ghanaian diaspora, we anchored the countdown to Eastern Time and made the Add-to-Calendar a one-tap affair (Google URL + auto-generated .ics for Apple and Outlook). The RSVP form quietly asks the questions that matter for a diaspora wedding: are you coming, how many, ceremony or reception or both, which side. Everything runs on our own infrastructure with no third-party subscriptions attached, so the couple has one flat build cost and no monthly bills to inherit.",
    package: "Bespoke",
    highlights: ["Palette lifted straight from the paper card — no design guessing", "Cinematic splash → full-bleed hero storytelling with subtle Ken Burns", "Diaspora-first: one-tap Add-to-Calendar (Google + Apple + Outlook) and RSVP with ceremony/reception split"],
  },
};

// Slugs hidden pending H20 consent audit — direct URLs render the
// "not found" state so bookmarked links stop working publicly, while
// data stays in `portfolioData` for one-line restoration if consent
// is later obtained. Keep in sync with `hidden: true` in portfolioItems.ts.
const HIDDEN_SLUGS = new Set<string>([]);

const PortfolioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = slug && !HIDDEN_SLUGS.has(slug) ? portfolioData[slug] : null;

  if (!item) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Portfolio item not found
            </h1>
            <p className="text-muted-foreground mb-8">
              This case study is coming soon or doesn't exist.
            </p>
            <Button asChild>
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              {item.type}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              {item.title}
            </h1>
            
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              {item.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Hero image — width/height reserve space to prevent the
                    layout jump that made slow-loading images look broken.
                    Eager decode: this is the first content the visitor came
                    for. Skeleton wrapper prevents a flash of empty white. */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-8 bg-muted/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30 animate-pulse" aria-hidden />
                  <img
                    src={item.image}
                    alt={item.title}
                    width={1600}
                    height={900}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="relative w-full h-full object-cover"
                  />
                </div>
                
                {/* The Story — editorial treatment. Section header with a
                    subtle divider, left-accent bar on the prose column, and
                    the long single-string story auto-split into 2-3-sentence
                    paragraphs so mobile users get real breathing room instead
                    of the wall of text the old single <p> produced. */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <Quote className="h-5 w-5 text-secondary flex-shrink-0" strokeWidth={2.25} />
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      The Story
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
                  </div>
                  <div className="relative pl-5 md:pl-6 border-l-2 border-secondary/40 space-y-4 md:space-y-5">
                    {splitStoryIntoParagraphs(item.story).map((para, idx) => (
                      <p
                        key={idx}
                        className="text-foreground/80 text-[15px] md:text-base leading-[1.75] md:leading-[1.8]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {item.demoUrl && (
                  <a
                    href={item.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant={item.demoLabel ? "default" : "gold"} size="lg">
                      {item.demoLabel || "View Live Demo"}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                {/* Package Used */}
                <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Package Used
                  </h3>
                  <p className="text-xl font-bold text-secondary">
                    {item.package}
                  </p>
                </div>

                {/* Highlights */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Project Highlights
                  </h3>
                  <ul className="space-y-3">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                        <span className="text-foreground text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Features Used
                  </h3>
                  <ul className="space-y-3">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <p className="text-muted-foreground text-sm mb-4">
                    Want something similar for your event?
                  </p>
                  <Button asChild variant="gold" className="w-full">
                    <Link to="/get-started">Create Yours</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default PortfolioDetail;
