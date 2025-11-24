"use client";

import { useEffect, useState } from "react";
import ExploreButton from "@/components/ui/ExploreButton";
import { cn } from "@/lib/utils";

export default function HeroText() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="
        hero-text flex-1
        transition-all duration-1000 ease-out
      "
    >
      <h1
        className={cn(
          "text-[53px] leading-[1.1] mb-[25px] font-bold",
          "transition-all duration-800 ease-out",
          animate
            ? "opacity-100 translate-x-0 delay-100"
            : "opacity-0 -translate-x-[50px]"
        )}
      >
        Fairplay, where creativity stays human
      </h1>

      <p
        className={cn(
          "text-[19px] text-text-para mb-[35px] max-w-[600px]",
          "transition-all duration-800 ease-out",
          animate
            ? "opacity-100 translate-x-0 delay-300"
            : "opacity-0 -translate-x-[50px]"
        )}
      >
        Your passions deserve more than an algorithm
      </p>

      <div
        className={cn(
          animate
            ? "opacity-100 translate-x-0 delay-500"
            : "opacity-0 -translate-x-[50px]",
          "transition-all duration-800 ease-out",
          "w-full flex justify-center lg:justify-start"
        )}
      >
        <ExploreButton onClick={() => (window.location.href = "/home")} />
      </div>
    </div>
  );
}
