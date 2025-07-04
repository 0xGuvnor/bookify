"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrivateNavLinks } from "@/lib/constants";

interface SerializableUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

interface Props {
  user?: SerializableUser | null;
}

export default function Navbar({ user }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`glass-navbar-strong fixed inset-x-4 top-8 z-50 mx-auto max-w-4xl rounded-full backdrop-blur-xs transition-transform duration-700 ease-in-out md:inset-x-16 ${
        isVisible ? "translate-y-0" : "-translate-y-32"
      }`}
    >
      <div className="relative px-1 sm:px-2 lg:px-4">
        <div className="flex h-10 items-center justify-between md:h-14">
          {/* Logo - Left Side */}
          <Link
            href="/"
            className="smooth-transition z-10 flex cursor-pointer items-center"
          >
            {/* Mobile Logo */}
            <Image
              src="/logos/bookify-logo.png"
              alt="Bookify Logo"
              width={44}
              height={44}
              priority
              className="h-10 w-10 md:hidden"
            />
            {/* Desktop Logo */}
            <Image
              src="/logos/bookify-logo-2.png"
              alt="Bookify Logo"
              width={120}
              height={120}
              priority
              className="hidden h-24 w-auto md:block"
            />
          </Link>

          {/* Center Navigation - Absolutely Centered */}
          <nav className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center space-x-8 md:space-x-6 lg:space-x-8">
            {user ? (
              // Private navigation for authenticated users
              PrivateNavLinks.map((link) => {
                const isActive = pathname.startsWith(link.route);
                return (
                  <Link
                    key={link.route}
                    href={link.route}
                    className={`smooth-transition group relative flex items-center gap-x-1 text-sm font-medium ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    title={link.label}
                  >
                    <div
                      className={`relative flex-shrink-0 ${isActive ? "scale-110" : "group-hover:scale-105"} smooth-transition`}
                    >
                      <Image
                        src={link.imageUrl}
                        alt={link.label}
                        width={44}
                        height={44}
                        className={`size-9 md:h-8 md:w-8 ${
                          isActive
                            ? "opacity-100 drop-shadow-md"
                            : "opacity-75 group-hover:opacity-100"
                        } smooth-transition`}
                      />
                    </div>
                    <span className="hidden truncate text-sm lg:inline-block">
                      {link.label}
                    </span>
                    <span
                      className={`smooth-transition absolute -bottom-1 left-1/2 h-0.5 -translate-x-1/2 ${
                        isActive
                          ? "w-4 bg-blue-600 md:w-8 lg:left-0 lg:w-full lg:translate-x-0"
                          : "w-0 bg-gray-900 group-hover:w-3 md:group-hover:w-6 lg:left-0 lg:translate-x-0 lg:group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                );
              })
            ) : (
              // Public navigation for non-authenticated users - hidden on mobile
              <>
                <a
                  href="#features"
                  className="smooth-transition group relative hidden text-sm font-medium text-gray-700 hover:text-gray-900 md:block"
                >
                  Features
                  <span className="smooth-transition absolute -bottom-1 left-0 h-0.5 w-0 bg-gray-900 group-hover:w-full"></span>
                </a>
                <a
                  href="#pricing"
                  className="smooth-transition group relative hidden text-sm font-medium text-gray-700 hover:text-gray-900 md:block"
                >
                  Pricing
                  <span className="smooth-transition absolute -bottom-1 left-0 h-0.5 w-0 bg-gray-900 group-hover:w-full"></span>
                </a>
                <a
                  href="#about"
                  className="smooth-transition group relative hidden text-sm font-medium text-gray-700 hover:text-gray-900 md:block"
                >
                  About
                  <span className="smooth-transition absolute -bottom-1 left-0 h-0.5 w-0 bg-gray-900 group-hover:w-full"></span>
                </a>
              </>
            )}
          </nav>

          {/* Auth Section - Right Side */}
          <div className="z-10 flex items-center space-x-4">
            <SignedOut>
              <SignInButton>
                <button className="smooth-transition cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="smooth-transition cursor-pointer rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg hover:scale-105 hover:bg-gray-800 hover:shadow-xl md:px-6 md:py-2.5 md:text-sm">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "size-8 rounded-full ring-2 ring-gray-300/50 hover:ring-gray-400/70 smooth-transition hover:scale-105 md:size-9",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
