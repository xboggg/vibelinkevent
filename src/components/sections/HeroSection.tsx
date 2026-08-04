import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Floating particle component
const FloatingParticle = ({ 
  size, 
  initialX, 
  initialY, 
  duration, 
  delay,
  type 
}: { 
  size: number; 
  initialX: number; 
  initialY: number; 
  duration: number; 
  delay: number;
  type: 'circle' | 'star' | 'diamond' | 'ring';
}) => {
  const getShape = () => {
    switch (type) {
      case 'star':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'diamond':
        return <div className="w-full h-full rotate-45 bg-current" />;
      case 'ring':
        return <div className="w-full h-full rounded-full border-2 border-current bg-transparent" />;
      default:
        return <div className="w-full h-full rounded-full bg-current" />;
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none text-white/20"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        y: [0, -100, -200, -100, 0],
        x: [0, 30, -20, 40, 0],
        opacity: [0.1, 0.4, 0.2, 0.5, 0.1],
        scale: [1, 1.2, 0.8, 1.1, 1],
        rotate: type === 'star' ? [0, 180, 360] : [0, 45, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {getShape()}
    </motion.div>
  );
};

// Floating particles container
const FloatingParticles = () => {
  const particles = useMemo(() => {
    const types: Array<'circle' | 'star' | 'diamond' | 'ring'> = ['circle', 'star', 'diamond', 'ring'];
    return [...Array(25)].map((_, i) => ({
      id: i,
      size: 4 + Math.random() * 12,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      type: types[Math.floor(Math.random() * types.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          size={particle.size}
          initialX={particle.initialX}
          initialY={particle.initialY}
          duration={particle.duration}
          delay={particle.delay}
          type={particle.type}
        />
      ))}
      
      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          left: "10%",
          top: "20%",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
          right: "15%",
          bottom: "30%",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          left: "60%",
          top: "60%",
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
};
import heroWedding from "@/assets/hero-wedding.jpg";
import heroNaming from "@/assets/hero-naming.jpg";
import heroFuneral from "@/assets/hero-funeral.jpg";
import heroGraduation from "@/assets/hero-graduation.jpg";
import heroBirthday from "@/assets/hero-birthday.jpg";
import heroChurch from "@/assets/hero-church.jpg";
import heroCorporate from "@/assets/hero-corporate.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

const avatarImages = [avatar1, avatar2, avatar3, avatar4];

const slides = [
  {
    image: heroWedding,
    alt: "Ghanaian wedding celebration",
    objectPos: "center 25%",
    headline: "Your Event,",
    highlight: "Elevated.",
    subline: "Stop sending JPEGs.",
    description: "VibeLink turns your invitation into a live, interactive experience — RSVP tracking, countdown timers, photo galleries and more. Shared in one link. Impressive on every screen.",
  },
  {
    image: heroNaming,
    alt: "Ghanaian naming ceremony",
    objectPos: "center 40%",
    headline: "Welcome Your",
    highlight: "Little One",
    subline: "Not a JPEG — a living invitation.",
    description: "Share the joy of new life with a digital naming ceremony invitation. RSVP tracking, gallery, countdown and more — all in one beautiful link.",
  },
  {
    image: heroFuneral,
    alt: "Dignified funeral ceremony",
    objectPos: "center 35%",
    headline: "Honor Their",
    highlight: "Legacy",
    subline: "A dignified tribute, not a PDF.",
    description: "A living memorial page your family can visit from anywhere in the world. Tribute messages, gallery, programme and livestream — all in one link.",
  },
  {
    image: heroGraduation,
    alt: "Graduation celebration",
    objectPos: "center 30%",
    headline: "Celebrate Your",
    highlight: "Achievement",
    subline: "Make it interactive, not just a card.",
    description: "Share your milestone with a stunning digital invitation that lets guests RSVP, find the venue and celebrate with you in real time.",
  },
  {
    image: heroBirthday,
    alt: "Birthday party celebration",
    objectPos: "center 30%",
    headline: "Make Your",
    highlight: "Birthday",
    subline: "More than a WhatsApp flyer.",
    description: "A live, interactive birthday invitation with countdowns, RSVP, gallery and a wish wall. Your guests will remember it long after the party.",
  },
  {
    image: heroChurch,
    alt: "Church event",
    objectPos: "center 30%",
    headline: "Invite Your",
    highlight: "Congregation",
    subline: "Interactive, not just a bulletin.",
    description: "Digital invitations for church events with livestream links, maps, programme schedules and RSVP — all in one shareable link.",
  },
  {
    image: heroCorporate,
    alt: "Corporate event",
    objectPos: "center",
    headline: "Elevate Your",
    highlight: "Brand Events",
    subline: "Professional, not plain.",
    description: "Premium digital invitations for conferences, product launches and corporate gatherings. First impressions matter — make yours unforgettable.",
  },
];

// Preload images for smoother transitions
const preloadImages = () => {
  slides.forEach((slide) => {
    const img = new Image();
    img.src = slide.image;
  });
};

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number>(0);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    preloadImages();
  }, []);

  // Pause auto-cycle when hero is scrolled off-screen — prevents subtle
  // repaints while the user is looking at content below.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || !inView) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, inView]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100dvh' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
      }}
    >
      {/* Background Images with Crossfade and Parallax
       *
       * All slide images are permanently mounted in a stack and cross-faded
       * via opacity/z-index. Previously the code had 2 <img> slots (current
       * + previous) with key={currentSlide} on the wrapper, which forced
       * React to UNMOUNT the old <img> and MOUNT a fresh one every cycle.
       * Browsers treat a freshly-mounted <img> as a new resource request —
       * over 15+ cycles that made ~131 image requests for 7 files, ~23 MB
       * of duplicated download (external perf audit 2026-07-26). Keeping
       * the <img> elements mounted means each file is fetched exactly once
       * for the lifetime of the page.
       */}
      <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-navy"
        style={{ y: parallaxY, scale: parallaxScale }}
      >
        {slides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{
              objectPosition: slide.objectPos,
              opacity: i === currentSlide ? 1 : 0,
              zIndex: i === currentSlide ? 2 : 1,
            }}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            onLoad={() => handleImageLoad(i)}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-purple-dark/70" style={{ zIndex: 3 }} />
        <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ zIndex: 3 }} />
      </motion.div>
      </div>

      {/* Floating Particles Effect */}
      <FloatingParticles />

      {/* Decorative Diagonal Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
        {/* Diagonal lines pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute inset-0"
        >
          {/* Top-right diagonal lines */}
          <div className="absolute top-0 right-0 w-1/2 h-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <line x1="20" y1="0" x2="100" y2="80" stroke="hsl(var(--secondary))" strokeWidth="0.15" strokeOpacity="0.3" />
              <line x1="40" y1="0" x2="100" y2="60" stroke="hsl(var(--secondary))" strokeWidth="0.1" strokeOpacity="0.2" />
              <line x1="60" y1="0" x2="100" y2="40" stroke="hsl(var(--secondary))" strokeWidth="0.15" strokeOpacity="0.25" />
              <line x1="80" y1="0" x2="100" y2="20" stroke="hsl(var(--secondary))" strokeWidth="0.1" strokeOpacity="0.15" />
            </svg>
          </div>
          
          {/* Bottom-left wave pattern */}
          <div className="absolute bottom-0 left-0 w-full h-32">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <motion.path
                d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="1"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeOpacity="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.3, duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Animated floating diagonal accent */}
        <motion.div
          className="absolute top-1/4 right-10 w-px h-32 bg-gradient-to-b from-transparent via-secondary/40 to-transparent"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          className="absolute top-1/3 right-24 w-px h-24 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ transform: "rotate(45deg)" }}
        />
        
        {/* Corner accent lines */}
        <div className="absolute top-20 right-20 w-20 h-20 border-t border-r border-secondary/20 rounded-tr-lg" />
        <div className="absolute bottom-32 left-10 w-16 h-16 border-b border-l border-primary/15 rounded-bl-lg" />
      </div>

      {/* Carousel Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-20 lg:pt-24">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Digital invitations for Ghanaian celebrations
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6">
                {slides[currentSlide].headline}{" "}
                <span className="text-gradient-gold">{slides[currentSlide].highlight}</span>{" "}
                {slides[currentSlide].subline}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-8 max-w-2xl">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <MagneticButton strength={0.25}>
              <Button asChild variant="hero" size="xl">
                <Link to="/get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/portfolio">View Portfolio</Link>
              </Button>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {avatarImages.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`Happy customer ${i + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-navy object-cover"
                />
              ))}
            </div>
            <div className="text-primary-foreground/80 text-sm">
              <span className="text-secondary font-semibold">100+</span>{" "}
              Ghanaian families trust us
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-secondary w-8"
                : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-secondary"
          />
        </div>
      </motion.div>
    </section>
  );
}
