"use client";

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
            className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl"
          >
            Schedule meetings with <span className="text-indigo-600">ease</span>
          </h1>
          <p
            ref={subtitleRef}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-600"
          >
            Bookify makes it simple to schedule meetings, manage your calendar,
            and connect with anyone, anywhere. Join thousands of professionals
            who trust Bookify for their scheduling needs.
          </p>
          <div ref={ctaRef} className="space-y-4">
            <p className="animate-typing text-lg text-gray-700">
              Ready to streamline your scheduling? Sign up to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
