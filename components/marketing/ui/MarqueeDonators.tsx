"use client";
import { useEffect, useRef, useCallback } from "react";

type Donor = {
  name: string;
  amount: string;
};

const DONORS: Donor[] = [
  { name: "Spectra", amount: "25€" },
  { name: "Shuu", amount: "52€" },
  { name: "Anonymous", amount: "1€" },
  { name: "Oscar", amount: "100€" },
  { name: "Acrilic", amount: "1€" },
];

export default function MarqueeDonators() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(10);
  const singleWidthRef = useRef(0);

  const startAnimation = useCallback(() => {
    if (rafRef.current) return;
    let lastTime: number | null = null;
    const step = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      offsetRef.current += speedRef.current * deltaTime;
      const singleWidth = singleWidthRef.current || 1;
      if (offsetRef.current >= singleWidth) offsetRef.current -= singleWidth;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleResize = useCallback(() => {
    if (trackRef.current) {
      singleWidthRef.current = trackRef.current.scrollWidth / 2;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    singleWidthRef.current = track.scrollWidth / 2;
    window.addEventListener("resize", handleResize);
    startAnimation();
    return () => {
      stopAnimation();
      window.removeEventListener("resize", handleResize);
    };
  }, [startAnimation, stopAnimation, handleResize]);

  const items = DONORS.map((donor, index) => (
    <div
      key={`donor-${index}`}
      className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 transition-all duration-300"
    >
      <span className="text-base font-extrabold text-primary">{donor.amount}</span>
      <span className="font-medium text-foreground">{donor.name}</span>
    </div>
  ));

  return (
    <div
      ref={containerRef}
      className="my-12 overflow-hidden py-2 mask-[linear-gradient(90deg,transparent_0%,black_10%,black_90%,transparent_100%)]"
      aria-label="Donators list"
    >
      <div ref={trackRef} className="flex gap-4" style={{ willChange: "transform" }}>
        {items}
        {items}
      </div>
    </div>
  );
}
