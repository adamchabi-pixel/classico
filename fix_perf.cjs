const fs = require('fs');

// Fix LazyVirtualCard
let lazyCard = fs.readFileSync('src/components/LazyVirtualCard.tsx', 'utf-8');
lazyCard = lazyCard.replace(/rootMargin: "2500px"/g, 'rootMargin: "600px"');
fs.writeFileSync('src/components/LazyVirtualCard.tsx', lazyCard, 'utf-8');

// Fix MovieCard
let movieCard = fs.readFileSync('src/components/MovieCard.tsx', 'utf-8');
movieCard = movieCard.replace(/className="w-full h-full object-cover"/g, 'className="w-full h-full object-cover"\n              loading="lazy"\n              decoding="async"');
fs.writeFileSync('src/components/MovieCard.tsx', movieCard, 'utf-8');

// Fix Navbar
let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
// Shrink navbar slightly
appTsx = appTsx.replace(
  /className="max-w-\[2000px\] mx-auto px-4 sm:px-8 py-1 md:py-1\.5 flex flex-row items-center justify-between gap-2\.5 md:gap-4 font-sans w-full"/g,
  'className="max-w-[2000px] mx-auto px-4 sm:px-8 py-0.5 md:py-1 flex flex-row items-center justify-between gap-2.5 md:gap-4 font-sans w-full"'
);

// Shrink CLASSICO title
appTsx = appTsx.replace(
  /className="font-cinzel font-bold text-lg sm:text-xl md:text-2xl tracking-\[0\.22em\] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102"/g,
  'className="font-cinzel font-bold text-[17px] sm:text-lg md:text-xl tracking-[0.22em] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102"'
);

appTsx = appTsx.replace(
  /className="block font-signature text-\[11px\] sm:text-\[14px\] md:text-\[16px\] text-\[#f4ecd8\] leading-none mt-\[-2px\] sm:mt-\[-1px\] select-none text-center translate-x-\[-3px\] filter drop-shadow-\[0_0_4px_rgba\(244,236,216,0\.2\)\] font-signature"/g,
  'className="block font-signature text-[10px] sm:text-[12px] md:text-[14px] text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-1px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature"'
);

fs.writeFileSync('src/App.tsx', appTsx, 'utf-8');

console.log("Fixed perf and navbar");
