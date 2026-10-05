"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F2F4F4] flex flex-col items-center justify-center p-6 text-center text-[#002325]">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-[#5D6770] mb-4">A critical error occurred.</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#45DB61] hover:bg-[#26c744] text-[#002325] font-bold text-sm rounded-[4px] transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
