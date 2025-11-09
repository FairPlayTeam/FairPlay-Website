"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function HeroImage() {
  const [animate, setAnimate] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 8; // subtle tilt
      const rotateY = ((x - centerX) / centerX) * 8;

      // Smooth animation
      card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    };

    const handleMouseLeave = () => {
      if (card) {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className={`hero-image flex justify-center items-center py-12 transition-all duration-1000 ${
        animate ? "animate-heroImageEntrance" : "opacity-0 translate-y-[70px] scale-90"
      }`}
    >
      <div className="video-card-container">
        <div
          ref={cardRef}
          className="video-card-3d-effect
            bg-[var(--color-background)]
            rounded-[20px]
            shadow-lg
            transition-transform duration-300 ease-out
            w-[380px]
          "
        >
          <div className="video-player-placeholder rounded-t-[20px] overflow-hidden">
            <Image
              src="https://tilbgoymzrpnhzlqsvgj.supabase.co/storage/v1/object/public/thumbnails/1756208153103_demoThumbnail.png"
              alt="Video thumbnail"
              width={380}
              height={220}
              className="w-full h-[220px] object-cover"
            />
          </div>

          <div className="video-info p-[15px_20px]">
            <h3 className="video-title text-[var(--color-text)] text-[1.2em] font-bold leading-[1.7] mb-[8px] mt-0">
              The Obviously True Theorem No One Can Prove
            </h3>
            <p className="video-rating text-[var(--color-text-para)] text-[0.9em] mb-[10px]">
              4.5 / 5
            </p>
            <div className="video-tags flex gap-[8px] flex-wrap">
              <span className="tag bg-[var(--gray-700)] rounded-full text-[var(--color-text)] text-[0.8em] px-[10px] py-[5px] lowercase">
                math
              </span>
              <span className="tag bg-[var(--gray-700)] rounded-full text-[var(--color-text)] text-[0.8em] px-[10px] py-[5px] lowercase">
                theorem
              </span>
              <span className="tag bg-[var(--gray-700)] rounded-full text-[var(--color-text)] text-[0.8em] px-[10px] py-[5px] lowercase">
                puzzle
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// 100 wow so cool
