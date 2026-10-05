"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-[#002325] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#5D6770] mb-4">An error occurred while loading this page.</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-[4px] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
