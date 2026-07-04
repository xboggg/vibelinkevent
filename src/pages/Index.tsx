import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { EventTypesSection } from "@/components/sections/EventTypesSection";
import { PortfolioPreviewSection } from "@/components/sections/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { HowItWorksPreviewSection } from "@/components/sections/HowItWorksPreviewSection";
import { HomeClosingSection } from "@/components/sections/HomeClosingSection";
import SEO, { createServiceSchema } from "@/components/SEO";

const homePageServices = [
  { name: "Wedding Invitations", description: "Beautiful digital invitations for traditional and white weddings in Ghana" },
  { name: "Funeral Programs", description: "Dignified memorial pages that honor your loved ones with respect" },
  { name: "Naming Ceremonies", description: "Celebrate the arrival of new life with joyful digital invitations" },
  { name: "Graduation Celebrations", description: "Share academic achievements with family and friends" },
  { name: "Corporate Events", description: "Professional digital invitations for conferences and corporate events" },
];

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Digital Event Invitations in Ghana | VibeLink Event"
        description="VibeLink builds interactive digital invitations for Ghanaian weddings, funerals, outdoorings, birthdays and corporate events. Share by link, track RSVPs."
        canonical="/"
        jsonLd={createServiceSchema(homePageServices)}
      />
      <HeroSection />
      <FeaturesSection />
      <EventTypesSection />
      <PortfolioPreviewSection />
      <TestimonialsSection />
      <HomeClosingSection />
      <HowItWorksPreviewSection />
    </Layout>
  );
};

export default Index;
