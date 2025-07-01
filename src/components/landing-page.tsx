"use client";

import { SignUpButton } from "@clerk/nextjs";
import { animate } from "motion";
import { useEffect, useRef } from "react";

function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial states for animation
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
    }
    if (titleRef.current) {
      titleRef.current.style.opacity = "0";
      titleRef.current.style.transform = "translateY(30px)";
    }
    if (subtitleRef.current) {
      subtitleRef.current.style.opacity = "0";
      subtitleRef.current.style.transform = "translateY(30px)";
    }
    if (ctaRef.current) {
      ctaRef.current.style.opacity = "0";
      ctaRef.current.style.transform = "translateY(30px)";
    }

    // Animate elements in sequence
    const animateSequence = async () => {
      // Fade in container first
      if (containerRef.current) {
        await animate(
          containerRef.current,
          { opacity: 1 },
          { duration: 0.6, ease: "easeOut" },
        );
      }

      // Animate title
      if (titleRef.current) {
        animate(
          titleRef.current,
          { opacity: 1, transform: "translateY(0px)" },
          { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        );
      }

      // Animate subtitle with slight delay
      setTimeout(() => {
        if (subtitleRef.current) {
          animate(
            subtitleRef.current,
            { opacity: 1, transform: "translateY(0px)" },
            { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
          );
        }
      }, 200);

      // Animate CTA with more delay
      setTimeout(() => {
        if (ctaRef.current) {
          animate(
            ctaRef.current,
            { opacity: 1, transform: "translateY(0px)" },
            { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
          );
        }
      }, 400);
    };

    animateSequence();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screenx h-[150vh] bg-gradient-to-br from-blue-50 to-indigo-100 pt-16"
    >
      <div className="container mx-auto px-4 py-16">
        <div ref={heroRef} className="text-center">
          <h1
            ref={titleRef}
            className="mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text pb-2 text-4xl leading-tight font-bold text-transparent md:text-6xl md:leading-tight"
          >
            Schedule meetings with{" "}
            <span className="animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text font-extrabold text-transparent">
              ease
            </span>
          </h1>
          <p
            ref={subtitleRef}
            className="mx-auto mb-8 max-w-2xl text-xl font-medium text-gray-700"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent">
              Bookify
            </span>{" "}
            makes it simple to schedule meetings, manage your calendar, and
            connect with anyone, anywhere. Join thousands of professionals who
            trust{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent">
              Bookify
            </span>{" "}
            for their scheduling needs.
          </p>
          <div ref={ctaRef} className="space-y-4">
            <p className="animate-typing text-lg font-semibold">
              Ready to{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                streamline
              </span>{" "}
              your scheduling?{" "}
              <SignUpButton>
                <span className="cursor-pointer border-b-2 border-orange-500 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent transition-all duration-300 hover:scale-110 hover:border-orange-400 hover:from-orange-400 hover:to-pink-400 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] active:scale-95">
                  Sign up
                </span>
              </SignUpButton>{" "}
              to get started! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
