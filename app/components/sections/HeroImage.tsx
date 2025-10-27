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
        animate ? "animate-heroImageEntrance" : "opacity-0 translate-y-[70px] scale-90"
      }`}
    >
      <div className="video-card-container perspective-[1000px]">
        <div
          className="video-card-3d-effect
            bg-(--color-background)
            rounded-[15px]
            shadow-[0_25px_50px_rgba(0,0,0,0.2)]
            transform rotate-x-10 rotate-y-[-40deg] rotate-[5deg]
            transform-3d
            transition-transform duration-300 ease-in-out
          "
        >
          <div className="video-card relative bg-(--color-background) rounded-[20px] w-[380px] z-1">
            <div className="video-player-placeholder bg-(--color-background) h-[220px] w-full rounded-[20px]">
              <Image
                src="https://tilbgoymzrpnhzlqsvgj.supabase.co/storage/v1/object/public/thumbnails/1756208153103_demoThumbnail.png"
                alt="Video thumbnail"
                width={380}
                height={220}
                className="video-thumbnail rounded-[20px] shadow-[0_15px_30px_rgba(0,0,0,0.1)] transform -translate-x-5 origin-[center_center] backface-hidden max-w-full h-auto"
              />
            </div>

            <div className="video-info p-[15px_20px]">
              <h3 className="video-title text-(--color-text) text-[1.2em] font-bold leading-[1.7] mb-2 mt-0">
                The Obviously True Theorem No One Can Prove
              </h3>
              <p className="video-rating text-(--color-text-para) text-[0.9em] mb-2.5">
                4.5 / 5
              </p>
              <div className="video-tags flex gap-2">
                <span className="tag bg-(--gray-700) rounded-full text-(--color-text) text-[0.8em] px-2.5 py-[5px] lowercase">
                  math
                </span>
                <span className="tag bg-(--gray-700) rounded-full text-(--color-text) text-[0.8em] px-2.5 py-[5px] lowercase">
                  theorem
                </span>
                <span className="tag bg-(--gray-700) rounded-full text-(--color-text) text-[0.8em] px-2.5 py-[5px] lowercase">
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