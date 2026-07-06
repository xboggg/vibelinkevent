import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PhoneCarouselItem {
  id: number | string;
  slug: string;
  title: string;
  type: string;
  image: string;             // fallback if server screenshot missing
  thumbnail?: string;        // second fallback
  demoUrl?: string;          // live URL for the iframe upgrade
}

interface PhoneCarouselProps {
  items: PhoneCarouselItem[];
  autoRotateMs?: number;     // default 3500; set 0 to disable
  showLiveButton?: boolean;  // default true
  className?: string;
}

// —— The phone bezel + screen ————————————————————————————
function PhoneFrame({
  image,
  liveUrl,
  isLive,
  isFront,
  title,
  type,
  fallbackImage,
  onTryLive,
  className = "",
}: {
  image: string;
  liveUrl?: string;
  isLive?: boolean;
  isFront?: boolean;
  title: string;
  type: string;
  fallbackImage?: string;
  onTryLive?: () => void;
  className?: string;
}) {
  const [src, setSrc] = useState(image);
  useEffect(() => setSrc(image), [image]);

  const canGoLive = isFront && !isLive && !!liveUrl && !!onTryLive;

  return (
    <div className={`relative ${className}`}>
      {/* Bezel */}
      <div className="relative w-full aspect-[9/19] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
          <div className="w-8 h-1.5 rounded-full bg-gray-700" />
        </div>

        {/* Screen */}
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white">
          {isLive && liveUrl ? (
            // Render the iframe at a REAL mobile viewport (390x844) then scale
            // it down with CSS transform. If we let it render at ~220px wide,
            // the site's mobile styles collapse into unreadable stacks. This
            // way the layout renders exactly as it would on a real phone.
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={liveUrl}
                title={title}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="border-0 origin-top-left w-[390px] h-[820px] scale-[0.472] md:scale-[0.574]"
              />
            </div>
          ) : (
            <>
              <img
                src={src}
                alt={title}
                onError={() => {
                  if (fallbackImage && src !== fallbackImage) setSrc(fallbackImage);
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-4 pt-16 text-white pointer-events-none">
                <p className="text-[10px] font-medium opacity-80 mb-0.5">{type}</p>
                <p className="text-sm font-bold leading-tight line-clamp-2">{title}</p>
              </div>
            </>
          )}

          {/* Pulsing LIVE dot on the front phone — signals interactivity */}
          {canGoLive && (
            <div className="absolute top-2 right-3 z-20 inline-flex items-center gap-1 pointer-events-none">
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-[9px] font-bold tracking-widest text-white/80 drop-shadow">LIVE</span>
            </div>
          )}

          {/* Full-screen tap area that triggers Live mode — only on front phone */}
          {canGoLive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTryLive?.();
              }}
              aria-label={`Try ${title} live`}
              className="absolute inset-0 z-30 focus:outline-none group"
            >
              {/* iOS-style action pill anchored to bottom of screen — clearly attached to THIS phone */}
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3.5 py-2 rounded-full bg-white/95 text-gray-900 text-xs font-bold shadow-lg backdrop-blur inline-flex items-center gap-1.5 whitespace-nowrap group-hover:scale-105 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tap to try it live
              </span>
            </button>
          )}

          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/40 z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// —— The carousel ————————————————————————————————————————
export function PhoneCarousel({
  items,
  autoRotateMs = 3500,
  showLiveButton = true,
  className = "",
}: PhoneCarouselProps) {
  const [active, setActive] = useState(0);
  const [liveIdx, setLiveIdx] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const paused = liveIdx !== null || userInteracted;

  useEffect(() => {
    if (paused || autoRotateMs <= 0 || items.length < 2) return;
    const id = setInterval(() => setActive((prev) => (prev + 1) % items.length), autoRotateMs);
    return () => clearInterval(id);
  }, [paused, autoRotateMs, items.length]);

  const goNext = () => {
    setUserInteracted(true);
    setLiveIdx(null);
    setActive((p) => (p + 1) % items.length);
  };
  const goPrev = () => {
    setUserInteracted(true);
    setLiveIdx(null);
    setActive((p) => (p - 1 + items.length) % items.length);
  };

  // Swipe detection
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? goPrev() : goNext();
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      className={`relative h-[520px] md:h-[600px] flex items-center justify-center ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {items.map((item, i) => {
        const offset = i - active;
        const abs = Math.abs(offset);
        const isVisible = abs <= 2;
        const isFront = offset === 0;
        const isLive = liveIdx === i;
        const shot = `/phone-shots/${item.slug}.jpg`;
        const fallback = item.thumbnail || item.image;
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-pointer"
            style={{ zIndex: isLive ? 30 : 10 - abs }}
            animate={{
              x: isLive ? 0 : offset * 140,
              scale: isLive ? 1.15 : isFront ? 1 : 0.75 - abs * 0.05,
              opacity: isLive || isVisible ? (isFront || isLive ? 1 : 0.5) : 0,
              rotateY: isLive ? 0 : offset * -12,
              filter: isFront || isLive ? "blur(0px)" : "blur(1px)",
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={() => {
              if (isLive) return;
              if (isFront) return; // front phone uses its own in-screen action button
              setActive(i);
            }}
          >
            <PhoneFrame
              image={shot}
              fallbackImage={fallback}
              liveUrl={item.demoUrl}
              isLive={isLive}
              isFront={isFront}
              title={item.title}
              type={item.type}
              onTryLive={showLiveButton ? () => setLiveIdx(i) : undefined}
              className="w-[200px] md:w-[240px]"
            />
          </motion.div>
        );
      })}

      {/* Close-live button */}
      {liveIdx !== null && (
        <button
          onClick={() => setLiveIdx(null)}
          className="absolute top-2 right-4 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
          aria-label="Close live preview"
        >
          ✕
        </button>
      )}

      {/* Prev / Next arrow buttons — outside the phone stack, always visible */}
      {liveIdx === null && items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous invitation"
            className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur border border-border shadow-lg text-foreground flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next invitation"
            className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur border border-border shadow-lg text-foreground flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setUserInteracted(true);
              setLiveIdx(null);
              setActive(i);
            }}
            className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`}
            aria-label={`Show ${items[i].title}`}
          />
        ))}
      </div>
    </div>
  );
}
