import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  title,
  type,
  fallbackImage,
  className = "",
}: {
  image: string;
  liveUrl?: string;
  isLive?: boolean;
  title: string;
  type: string;
  fallbackImage?: string;
  className?: string;
}) {
  const [src, setSrc] = useState(image);
  useEffect(() => setSrc(image), [image]);

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
            <iframe
              src={liveUrl}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-4 pt-16 text-white">
                <p className="text-[10px] font-medium opacity-80 mb-0.5">{type}</p>
                <p className="text-sm font-bold leading-tight line-clamp-2">{title}</p>
              </div>
            </>
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
  const paused = liveIdx !== null;

  useEffect(() => {
    if (paused || autoRotateMs <= 0 || items.length < 2) return;
    const id = setInterval(() => setActive((prev) => (prev + 1) % items.length), autoRotateMs);
    return () => clearInterval(id);
  }, [paused, autoRotateMs, items.length]);

  if (items.length === 0) return null;

  return (
    <div className={`relative h-[520px] md:h-[600px] flex items-center justify-center ${className}`}>
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
              if (isFront) return;
              setActive(i);
            }}
          >
            <PhoneFrame
              image={shot}
              fallbackImage={fallback}
              liveUrl={item.demoUrl}
              isLive={isLive}
              title={item.title}
              type={item.type}
              className="w-[200px] md:w-[240px]"
            />
          </motion.div>
        );
      })}

      {/* Front-of-stack "Tap to try live" button */}
      {showLiveButton && liveIdx === null && items[active]?.demoUrl && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        >
          <button
            onClick={() => setLiveIdx(active)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/40 hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Tap to try it live
          </button>
        </motion.div>
      )}

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

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
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
