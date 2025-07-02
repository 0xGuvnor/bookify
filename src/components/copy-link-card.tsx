"use client";

import { useState } from "react";

function CopyLinkCard() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    const publicProfileUrl = `${window.location.origin}/book`;
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Could add a toast notification here instead of alert
    }
  };

  return (
    <div
      className="relative cursor-pointer rounded-lg bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={handleCopyLink}
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        🔗 Share Your Link
      </h3>
      <p className="text-gray-600">
        Get your personal booking link to share with clients
      </p>

      {/* Copy success indicator - positioned absolutely to not affect layout */}
      {isCopied && (
        <div className="animate-in zoom-in absolute top-4 right-4 transition-all duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span className="text-sm text-green-600">✓</span>
          </div>
        </div>
      )}

      {/* Optional: Copy status text */}
      {isCopied && (
        <p className="animate-in fade-in mt-2 text-sm font-medium text-green-600 duration-200">
          Link copied! 📋✨
        </p>
      )}
    </div>
  );
}

export default CopyLinkCard;
