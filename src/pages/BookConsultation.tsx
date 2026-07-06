import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calendar, Clock, MessageCircle, CheckCircle, Phone } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const eventTypes = [
  "Wedding",
  "Engagement / Customary Marriage",
  "Funeral / Memorial",
  "Church Event",
  "Naming Ceremony",
  "Birthday",
  "Anniversary",
  "Graduation",
  "Corporate Event",
  "Other",
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const whyPoints = [
  { icon: Clock, text: "30-minute focused session" },
  { icon: MessageCircle, text: "Via WhatsApp call or video" },
  { icon: Calendar, text: "We confirm within 2 hours" },
  { icon: Phone, text: "Free — no obligation" },
];

export default function BookConsultation() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    eventType: "", preferredDate: "",
    preferredTime: "", message: "",
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.eventType || !form.preferredDate || !form.preferredTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await supabase.from("consultation_bookings").insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        event_type: form.eventType,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        message: form.message || null,
        status: "pending",
      });

      // Build WhatsApp notification message
      const wa = `https://wa.me/4915757178561?text=${encodeURIComponent(
        `📅 *New Consultation Request*\n\n👤 *Name:* ${form.name}\n📱 *Phone:* ${form.phone}\n🎉 *Event:* ${form.eventType}\n📆 *Date:* ${form.preferredDate}\n🕐 *Time:* ${form.preferredTime}${form.message ? `\n💬 *Note:* ${form.message}` : ""}`
      )}`;

      setSubmitted(true);
      setTimeout(() => window.open(wa, "_blank"), 800);
    } catch {
      toast({ title: "Something went wrong. Please try WhatsApp directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Book a Free Consultation"
        description="Book a free 30-minute consultation with the VibeLink Event team. We'll help you plan the perfect digital invitation for your event."
        canonical="/book-consultation"
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4">
              Free — No Obligation
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Book a Free Consultation
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Not sure which package is right for you? Let's talk. A 30-minute WhatsApp call and we'll figure it out together.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-10">
            {whyPoints.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <p.icon className="h-5 w-5 text-white/80" />
                </div>
                <p className="text-white/70 text-xs text-center">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 50 720 60 0 20Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Booking Received!</h2>
              <p className="text-muted-foreground mb-2">We'll confirm your slot via WhatsApp within 2 hours.</p>
              <p className="text-muted-foreground text-sm mb-8">A WhatsApp message is opening so you can send it directly to us.</p>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary">
                <a href="/" >Back to Home <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">WhatsApp / Phone <span className="text-destructive">*</span></Label>
                    <Input id="phone" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={e => update("phone", e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label>Event Type <span className="text-destructive">*</span></Label>
                  <Select onValueChange={v => update("eventType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select your event type" /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Preferred Date <span className="text-destructive">*</span></Label>
                    <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={form.preferredDate} onChange={e => update("preferredDate", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred Time <span className="text-destructive">*</span></Label>
                    <Select onValueChange={v => update("preferredTime", v)}>
                      <SelectTrigger><SelectValue placeholder="Pick a time" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Anything we should know? (optional)</Label>
                  <Textarea id="message" placeholder="e.g. My event is in 2 weeks and I need urgent help..." rows={3} value={form.message} onChange={e => update("message", e.target.value)} />
                </div>

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={loading}>
                  {loading ? "Booking..." : "Book My Free Consultation"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Free consultation. No commitment. We'll confirm via WhatsApp.
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
