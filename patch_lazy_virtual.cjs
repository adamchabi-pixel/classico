const fs = require('fs');
let code = fs.readFileSync('src/components/LazyVirtualCard.tsx', 'utf-8');

const newCode = `import React, { useState, useEffect, useRef } from "react";

// Singleton observer to share across all cards for massive performance gain
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, (isIntersecting: boolean) => void>();

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = callbacks.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      },
      {
        rootMargin: "600px", // Preload slightly more
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
}

interface LazyVirtualCardProps {
  children: React.ReactNode;
  key?: string;
  className?: string;
}

export default function LazyVirtualCard({ children, className }: LazyVirtualCardProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    callbacks.set(el, setIsIntersecting);
    const observer = getObserver();
    if (observer) {
      observer.observe(el);
    }
    
    return () => {
      if (observer && el) {
        observer.unobserve(el);
      }
      callbacks.delete(el);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={\`shrink-0 \${className || "w-[140px] min-[400px]:w-[160px] sm:w-[210px] aspect-[2/3]"}\`}
      style={{ containIntrinsicSize: "170px 255px" }}
    >
      {isIntersecting ? (
        children
      ) : (
        <div className="w-full h-full rounded-xl bg-neutral-900 border border-neutral-800/40 opacity-30" />
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/LazyVirtualCard.tsx', newCode, 'utf-8');
console.log("Patched LazyVirtualCard for singleton observer");
