import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookify",
  description: "Bookify is a platform for seamlessly scheduling meetings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-blue-50 antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
