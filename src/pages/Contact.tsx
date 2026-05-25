import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { MessageCircle as MessageCircleIcon, Mail, MapPin, Phone, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    answer: "Absolutely! We serve clients across Africa, Europe, and beyond. With offices in Ghana and Germany, we understand diaspora needs well — our invitations include international sharing options and work perfectly on any device worldwide.",
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

  const handleEmailSubmit = () => {
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

    const subject = formData.eventType 
      ? `Inquiry about ${formData.eventType}` 
      : "Inquiry from VibeLink Website";
    
    const body = `Hi VibeLink Team,

Name: ${formData.name.trim()}
${formData.email ? `Email: ${formData.email.trim()}` : ""}
${formData.eventType ? `Event Type: ${formData.eventType.trim()}` : ""}

Message:
${formData.message.trim()}`;

    const mailtoUrl = `mailto:hello@vibelinkevent.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    toast({
      title: "Opening Email",
      description: "Complete your message in your email app!",
    });

    setFormData({ name: "", email: "", eventType: "", message: "" });
    setErrors({});
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us"
        description="Get in touch with VibeLink Event. Reach us via WhatsApp for quick responses or send us an email. We're here to help with your digital invitation needs."
        keywords="contact VibeLink Event, digital invitations help, WhatsApp support Ghana"
        canonical="/contact"
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
              Contact Us
            </h1>
            <p className="text-white/80 text-lg lg:text-xl">
              Have a question or ready to create your event? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MapPin, title: "Ghana Office", detail: "Accra, Ghana", flag: "🇬🇭", delay: 0 },
              { icon: MapPin, title: "Germany Office", detail: "Berlin, Germany", flag: "🇩🇪", delay: 0.1 },
              { icon: Phone, title: "Phone / WhatsApp", detail: "+49 157 571 78561", flag: null, delay: 0.2 },
              { icon: Clock, title: "Response Time", detail: "Within 2 hours", flag: null, delay: 0.3 },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: card.delay }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  {card.flag ? (
                    <span className="text-2xl">{card.flag}</span>
                  ) : (
                    <card.icon className="h-7 w-7 text-secondary" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                <MessageCircleIcon className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get In Touch
              </h2>
              <p className="text-muted-foreground text-lg">
                Have a question or want to discuss your event? Send us a message
                and we'll get back to you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border space-y-6"
            >
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

              {/* Dual Send Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold"
                >
                  <svg className="h-5 w-5 mr-2 fill-white flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Send via WhatsApp
                </Button>
                <Button 
                  type="button" 
                  onClick={handleEmailSubmit}
                  variant="outline"
                  size="lg" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send via Email
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-6">
              <HelpCircle className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions about our services
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm mb-3">Looking for more answers?</p>
              <Link to="/faq" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
                View Full FAQ Page →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
