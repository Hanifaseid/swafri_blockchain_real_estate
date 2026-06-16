'use client';

import React, { useRef, useEffect } from 'react';
import { HERO_IMAGE, VIDEO_SRC } from './data';

interface HeroBackgroundProps {
  videoReady: boolean;
  heroImgLoaded: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function HeroBackground({ videoReady, heroImgLoaded, videoRef }: HeroBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: tiny LQIP placeholder — shows in the first ~100ms */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=10')`,
        }}
      />

      {/* Layer 2: full-quality hero image fades over the LQIP once loaded */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url('${HERO_IMAGE}')`,
          opacity: heroImgLoaded ? 1 : 0,
        }}
      />

      {/* Layer 3: video — preloaded silently, fades in over the image once canplaythrough fires */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: videoReady ? 1 : 0 }}
        src={VIDEO_SRC}
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Persistent gradient overlay — sits above all layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />

      {/* Ambient glow accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-900/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
    </div>
  );
}
