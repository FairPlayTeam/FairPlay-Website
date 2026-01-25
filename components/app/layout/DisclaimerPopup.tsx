"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { FaArrowRight } from "react-icons/fa";

interface DisclaimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerPopup({
  isOpen,
  onClose,
}: DisclaimerPopupProps) {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const popup = document.querySelector(".disclaimer-popup");
      if (popup && !popup.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="disclaimer-popup w-full max-w-xl rounded-3xl border border-white/10 bg-(--gray-900)/95 shadow-2xl p-6 sm:p-8 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
          <span className="font-semibold">!</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
          Hang on a sec…
        </h1>

        <p className="text-sm sm:text-base text-(--gray-200) mb-4">
          This part of the website is currently under development. By clicking
          <span className="font-medium text-text"> Continue</span>, you will be
          redirected to the live build version.
          <span className="font-medium text-text">
            This environment is for development purposes only.
          </span>
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.href = "https://fairplay.video/explore";
              onClose();
            }}
            className="flex items-center justify-center gap-3"
          >
            Continue <FaArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
