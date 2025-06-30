import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="glass-navbar-strong fixed inset-x-16 top-4 z-50 mx-auto max-w-7xl rounded-full backdrop-blur-xs">
      <div className="relative px-6 sm:px-8 lg:px-12">
        <div className="flex h-14 items-center justify-between">
          {/* Logo - Left Side */}
          <Link
            href="/"
            className="smooth-transition z-10 flex cursor-pointer items-center"
          >
            <Image
              src="/bookify-logo-2.png"
              alt="Bookify Logo"
              width={120}
              height={120}
              priority
              className="h-24 w-auto"
            />
          </Link>

          {/* Center Navigation - Absolutely Centered */}
          <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform items-center space-x-8 md:flex">
            <a
              href="#features"
              className="smooth-transition group relative text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Features
              <span className="smooth-transition absolute -bottom-1 left-0 h-0.5 w-0 bg-gray-900 group-hover:w-full"></span>
            </a>
            <a
              href="#pricing"
              className="smooth-transition group relative text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Pricing
              <span className="smooth-transition absolute -bottom-1 left-0 h-0.5 w-0 bg-gray-900 group-hover:w-full"></span>
            </a>
            <a
              href="#about"
              className="smooth-transition group relative text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              About
            </a>
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
                <button className="smooth-transition cursor-pointer rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-lg hover:scale-105 hover:bg-gray-800 hover:shadow-xl">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "size-9 rounded-full ring-2 ring-gray-300/50 hover:ring-gray-400/70 smooth-transition hover:scale-105",
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
