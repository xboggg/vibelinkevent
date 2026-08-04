import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export interface PhoneCarouselItem {
  id: number | string;
  slug: string;
  title: string;
  type: string;
  image: string;             // fallback if server screenshot missing
  thumbnail?: string;        // second fallback
  demoUrl?: string;          // live URL for the iframe upgrade
  demoLabel?: string;        // present = real client work; absent = sample design
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
  isSample = false,
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
  isSample?: boolean;
}) {
  const [src, setSrc] = useState(image);
  useEffect(() => setSrc(image), [image]);

  // Iframe ref so we can drive back/home from the phone frame's controls,
  // just like on a real iPhone: back = one step in history, home = reload
  // the invitation to its opening view.
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const goBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch {
      // Cross-origin block — fall back to full reload
      setIframeKey((k) => k + 1);
    }
  };
  const goHome = () => {
    // Force a fresh iframe mount by changing its React key. This works even
    // when history.go(-N) is blocked by cross-origin policies.
    setIframeKey((k) => k + 1);
  };

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
                ref={iframeRef}
                key={iframeKey}
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
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[10px] font-medium opacity-80">{type}</p>
                  {isSample && (
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-[1px] rounded-sm bg-white/25 backdrop-blur">
                      Sample
                    </span>
                  )}
                </div>
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

          {/* Whole-screen tap area on the front phone — invisible, no chrome
              on top of the invitation. The visible CTA lives BELOW the
              phone, in the carousel container. */}
          {canGoLive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTryLive?.();
              }}
              aria-label={`Try ${title} live`}
              className="absolute inset-0 z-30 focus:outline-none"
            />
          )}

          {/* Home indicator / nav controls.
              - When NOT live: static home pill (keeps the phone-y feel).
              - When live: a small back arrow on the left + a home pill on the
                right, both tappable so visitors can navigate the invitation. */}
          {isLive && liveUrl ? (
            <div className="absolute bottom-1.5 left-0 right-0 z-30 flex items-center justify-center gap-3 pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); goBack(); }}
                aria-label="Back one step"
                className="pointer-events-auto inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/60 backdrop-blur border border-white/25 text-white hover:bg-black/80 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goHome(); }}
                aria-label="Home — reset invitation"
                title="Home"
                className="pointer-events-auto w-28 h-1.5 rounded-full bg-white/70 hover:bg-white active:scale-95 transition shadow-md"
              />
            </div>
          ) : (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/40 z-10 pointer-events-none" />
          )}
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

  // Pause auto-cycle when carousel is scrolled off-screen — prevents subtle
  // repaints while the user is looking at something else on the page.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, []);

  const paused = liveIdx !== null || userInteracted || !inView;

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
      ref={rootRef}
      className={`relative h-[600px] md:h-[700px] flex items-center justify-center ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {items.map((item, i) => {
        // Circular offset: treat the carousel as a ring, not a line.
        // The shortest-path distance from `active` to `i` (positive = to
        // the right, negative = to the left, wraps at +/- N/2). This
        // way going from item N-1 -> 0 slides in from the right instead
        // of sweeping backwards across every other phone.
        const N = items.length;
        const raw = i - active;
        const wrapped = ((raw % N) + N) % N;
        const offset = wrapped > N / 2 ? wrapped - N : wrapped;
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
              isSample={!item.demoLabel}
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

      {/* Bottom controls: 'Tap to try it live' button + dot indicators.
          The button sits DIRECTLY BELOW the front phone bezel so it's
          obviously tied to it, without covering the invitation content. */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        {showLiveButton && liveIdx === null && items[active]?.demoUrl && (
          <motion.button
            key={active}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              setUserInteracted(true);
              setLiveIdx(active);
            }}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/40 hover:scale-105 transition-transform inline-flex items-center gap-2 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Tap to try it live
          </motion.button>
        )}

        {/* Dot indicators */}
        <div className="flex gap-2">
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
    </div>
  );
}
