import React, { useState, useEffect, useRef } from "react";

interface LazyVirtualCardProps {
  children: React.ReactNode;
  key?: string;
}

export default function LazyVirtualCard({ children }: LazyVirtualCardProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Once it has loaded, we can unobserve if we want to keep it or keep observing if we want true memory-unloading virtualization.
          // True memory-unloading virtualization (dynamic mounts/unmounts) is best for infinite rows of hundreds of movies to reach 95+ Lighthouse score!
        } else {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin: "400px", // Preload items 400px (approx 2 cards) before they scroll into view
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-[170px] sm:w-[210px] aspect-[2/3] shrink-0"
      style={{ contentVisibility: "auto", containIntrinsicSize: "170px 255px" }}
    >
      {isIntersecting ? (
        children
      ) : (
        // Highly optimized, lightweight placeholder skeleton that matches the exact visual dimensions
        <div className="w-full h-full rounded-xl bg-neutral-900 border border-neutral-800/40 opacity-30 animate-pulse" />
      )}
    </div>
  );
}
