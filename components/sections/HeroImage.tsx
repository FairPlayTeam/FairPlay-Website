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
          : "opacity-0 translate-y-[70px] scale-90"
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
          <div className="video-card relative bg-background rounded-2xl w-[380px] z-1">
            <div className="video-player-placeholder bg-background h-[220px] w-full rounded-2xl">
              <Image
                src="/images/hero-video-thumbnail.png"
                alt="Video thumbnail"
                width={380}
                height={220}
                className="rounded-2xl shadow-lg transform -translate-x-5 origin-center"
              />
            </div>

            <div className="video-info p-4">
              <h3 className="video-title text-text text-lg font-bold leading-[1.7] mb-2 mt-0">
                The Obviously True Theorem No One Can Prove
              </h3>
              <p className="video-rating text-text-para text-sm mb-2.5">
                4.5 / 5
              </p>
              <div className="video-tags flex gap-2">
                <span className="tag bg-gray-700 rounded-full text-text text-sm px-2.5 py-1 lowercase">
                  math
                </span>
                <span className="tag bg-gray-700 rounded-full text-text text-sm px-2.5 py-1 lowercase">
                  theorem
                </span>
                <span className="tag bg-gray-700 rounded-full text-text text-sm px-2.5 py-1 lowercase">
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
