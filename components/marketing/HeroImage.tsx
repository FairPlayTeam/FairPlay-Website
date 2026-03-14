"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroImage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`hero-image flex justify-center items-center py-12 transition-all duration-1000 ${
        animate
          ? "animate-heroImageEntrance"
          : "opacity-0 translate-y-17.5 scale-90"
      }`}
    >
      <div className="video-card-container perspective-[1000px]">
        <div
          className="video-card-3d-effect
            bg-background
            rounded-xl
            shadow-2xl
            transform rotate-x-10 rotate-y-[-40deg] rotate-[5deg]
            transform-3d
            transition-transform duration-300 ease-in-out
          "
        >
          <div className="video-card relative bg-background rounded-2xl w-95 z-1">
            <div className="video-player-placeholder bg-background h-55 w-full rounded-2xl">
              <Image
                src="/hero-video-thumbnail.png"
                alt="Video thumbnail"
                width={380}
                height={220}
                className="rounded-2xl shadow-lg transform -translate-x-5 origin-center"
              />
            </div>

            <div className="video-info p-4">
              <h3 className="video-title mb-2 mt-0 text-lg font-bold leading-[1.7] text-foreground">
                The Obviously True Theorem No One Can Prove
              </h3>
              <p className="video-rating mb-2.5 text-sm text-muted-foreground">
                4.5 / 5
              </p>
              <div className="video-tags flex gap-2">
                <span className="tag rounded-full bg-secondary px-2.5 py-1 text-sm lowercase text-secondary-foreground">
                  math
                </span>
                <span className="tag rounded-full bg-secondary px-2.5 py-1 text-sm lowercase text-secondary-foreground">
                  theorem
                </span>
                <span className="tag rounded-full bg-secondary px-2.5 py-1 text-sm lowercase text-secondary-foreground">
                  puzzle
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
