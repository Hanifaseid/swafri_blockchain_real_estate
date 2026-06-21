"use client";

import React from "react";
import { HERO_IMAGE, VIDEO_SRC } from "./data";

interface HeroBackgroundProps {
  videoReady: boolean;
  heroImgLoaded: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * HeroBackground — warm editorial canvas for "The Property Register".
 * Layers (back → front):
 *   1. Warm espresso/walnut canvas with gold + verdant glows
 *   2. Hero photograph, duotone-warmed, masked to the right so the
 *      editorial headline reads cleanly on the left
 *   3. Faint engraved ledger grid
 *   4. Film grain
 */
export default function HeroBackground({
  videoReady,
  heroImgLoaded,
  videoRef,
}: HeroBackgroundProps) {
  return (
    <div className=" fixed inset-0 overflow-hidden canvas-warm grain">
      {/* Photograph — pushed right, duotone, feathered into the canvas */}
      <div
        className="absolute inset-y-0 right-0 w-full lg:w-[62%] transition-opacity duration-1000"
        style={{
          opacity: heroImgLoaded ? 1 : 0,
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 38%, #000 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 38%, #000 100%)",
        }}
      >
        {/* LQIP */}
        <div
          className="absolute inset-0 bg-cover bg-center duotone-warm"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=10')`,
          }}
        />
        {/* Full image */}
        <div
          className="absolute inset-0 bg-cover bg-center duotone-warm transition-opacity duration-700"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            opacity: heroImgLoaded ? 1 : 0,
          }}
        />
        {/* Video — warm-graded, fades in over the still */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover duotone-warm transition-opacity duration-1000"
          style={{ opacity: videoReady ? 1 : 0 }}
          src={VIDEO_SRC}
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Vignette to seat the photo into the canvas */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#14110c] via-transparent to-[#14110c]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100d09] via-transparent to-[#14110c]/30" />
      </div>

      {/* Engraved ledger grid */}
      <div className="absolute inset-0 ledger-grid opacity-60" />

      {/* Soft gold + verdant glows */}
      <div className="absolute -top-[15%] right-[6%] w-[48%] h-[55%] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-12%] left-[-8%] w-[42%] h-[55%] rounded-full bg-emerald-800/15 blur-[150px] pointer-events-none" />
    </div>
  );
}
