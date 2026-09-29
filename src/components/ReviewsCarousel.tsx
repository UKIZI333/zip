"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    quote:
      "Northfield made the search way faster and easier and told me when companies would view my applications. Eventually I got a call for the position I wanted with a great company close to where I live!",
    author: "Kyle Mouallem",
    role: "Candidate in Dublin",
  },
  {
    id: 2,
    quote:
      "Northfield got me my first real job after I graduated from college. Thanks to them, I am now able to be in this world as a functional, working adult. Hooray for salary! No more clocking in!",
    author: "Ryan Gordon",
    role: "Software Engineer",
  },
  {
    id: 3,
    quote:
      "I was able to get a great full time position even before finishing my last semester of college. I couldn't have asked for a better entry level position and I love my job. Thank you Northfield!",
    author: "Juhi Rathod",
    role: "Product Operations",
  },
];

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % REVIEWS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#f6f7f8] py-20 px-6 border-y border-[#DEE1E3] relative overflow-hidden">
      <div className="max-w-[960px] mx-auto text-center relative">
        {/* Large Decorative Quote Marks in background */}
        <Quote className="w-16 h-16 text-[#DEE1E3] absolute -top-8 left-0 opacity-60 pointer-events-none" />
        <Quote className="w-16 h-16 text-[#DEE1E3] absolute -bottom-8 right-0 rotate-180 opacity-60 pointer-events-none" />

        {/* Carousel Content */}
        <div className="min-h-[160px] sm:min-h-[140px] flex flex-col items-center justify-center px-4 md:px-16">
          <p className="text-xl sm:text-2xl md:text-[26px] leading-relaxed text-[#5D6770] font-normal transition-opacity duration-500 italic">
            &ldquo;{REVIEWS[current].quote}&rdquo;
          </p>
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[#002325] font-semibold text-base sm:text-lg">
              – {REVIEWS[current].author}
            </span>
            <span className="text-xs text-[#5D6770] mt-0.5">
              {REVIEWS[current].role}
            </span>
          </div>
        </div>

        {/* Carousel Indicators / Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === idx
                  ? "w-8 bg-[#45DB61]"
                  : "w-2.5 bg-[#DEE1E3] hover:bg-[#5D6770]"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
