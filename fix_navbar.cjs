const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /className="max-w-\[2000px\] mx-auto px-4 sm:px-8 py-1\.5 md:py-2\.5 flex flex-row items-center justify-between gap-2\.5 md:gap-4 font-sans w-full"/g,
  'className="max-w-[2000px] mx-auto px-4 sm:px-8 py-1 md:py-1.5 flex flex-row items-center justify-between gap-2.5 md:gap-4 font-sans w-full"'
);

code = code.replace(
  /className="font-cinzel font-bold text-xl sm:text-2\.5xl md:text-3xl tracking-\[0\.22em\] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102"/g,
  'className="font-cinzel font-bold text-lg sm:text-xl md:text-2xl tracking-[0.22em] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102"'
);

code = code.replace(
  /className="block font-signature text-\[13px\] sm:text-\[17px\] md:text-\[20px\] text-\[#f4ecd8\] leading-none mt-\[-2px\] sm:mt-\[-1px\] select-none text-center translate-x-\[-3px\] filter drop-shadow-\[0_0_4px_rgba\(244,236,216,0\.2\)\] font-signature"/g,
  'className="block font-signature text-[11px] sm:text-[14px] md:text-[16px] text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-1px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature"'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Navbar fixed");
