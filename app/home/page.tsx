"use client";
import Section from "@/components/sections/Section";
import Button from "@/components/ui/Button";
import { FaArrowRight } from "react-icons/fa";

export default function DisclaimerPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Section className="flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Hang on a sec...
          </h1>
          <p className="text-base md:text-lg mb-4">
            This part of the website is currently under development! By clicking
            Continue, you will be redirected to the live build version.
          </p>
          <p className="text-base md:text-lg mb-6">
            Note: Videos and accounts created on this preview version will be
            deleted. It is for development purposes only. Enjoy!
          </p>
          <Button
            onClick={() =>
              (window.location.href = "https://fairplay.video/explore")
            }
            className="px-6 py-3 flex items-center gap-3"
          >
            Continue <FaArrowRight />
          </Button>
          <br />
          <Button
            onClick={() =>
              (window.location.href = "https://lab.fairplay.video")
            }
            className="px-6 py-3 flex items-center gap-3"
          >
            Continue on the old version <FaArrowRight />
          </Button>
        </div>
      </Section>
    </div>
  );
}
