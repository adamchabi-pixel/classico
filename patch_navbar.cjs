const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Header padding reduction
code = code.replace(
  /<header className=\{`fixed top-0 left-0 right-0 z-\[9999\] pt-\[env\(safe-area-inset-top\)\] transition-all duration-300 ease-in-out border-b \$\{isScrolled \? "bg-black border-white\/5" : "bg-black border-transparent"\}\`\}>\n\s*<div className="max-w-\[2000px\] mx-auto px-4 sm:px-8 py-2 md:py-3\.5 flex flex-row items-center justify-between gap-2\.5 md:gap-4 font-sans w-full">/,
  `<header className={\`fixed top-0 left-0 right-0 z-[9999] pt-[env(safe-area-inset-top)] transition-all duration-300 ease-in-out border-b \${isScrolled ? "bg-black border-white/5" : "bg-black border-transparent"}\`}>
        <div className="max-w-[2000px] mx-auto px-4 sm:px-8 py-1.5 md:py-2.5 flex flex-row items-center justify-between gap-2.5 md:gap-4 font-sans w-full">`
);

// Spacer height reduction
code = code.replace(
  /<div className="h-\[80px\] md:h-\[72px\]" \/>/g,
  '<div className="h-[64px] md:h-[60px]" />'
);

// Desktop Nav style update
const desktopNavBlockOld = `className={\`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-250 font-sans \${
                      isActive
                        ? "gold-button scale-102"
                        : "text-zinc-400 hover:text-white hover:bg-neutral-900/50"
                    }\`}`;
const desktopNavBlockNew = `className={\`relative flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-none text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-250 font-sans \${
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-white"
                    }\`}`;

code = code.replace(desktopNavBlockOld, desktopNavBlockNew);

// Add the golden underline for desktop
code = code.replace(
  /\{tab\.id === "profil" && watchlist\.length > 0 && \([\s\S]*?\}\)[\s\S]*?<\/button>/g,
  match => match.replace('</button>', `  {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}\n                  </button>`)
);

// Mobile Nav style update
const mobileNavBlockOld = `className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 w-full text-left \${
                        isActive
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }\`}`;
const mobileNavBlockNew = `className={\`relative flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium tracking-wide transition-all duration-300 w-full text-left \${
                        isActive
                          ? "text-white"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }\`}`;

code = code.replace(mobileNavBlockOld, mobileNavBlockNew);

// Add the golden underline for mobile (but it's vertical on the left or horizontal at bottom)
// Usually in a drawer, it's a left border, but the user asked for a line like classic. Let's make it bottom or left.
// "tu le souligne avec une barre dore un peu comme quand on clique sur le titre classico" -> this implies bottom underline.
code = code.replace(
  /\{tab\.label\}\n\s*<\/button>/g,
  `{tab.label}\n                      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}\n                    </button>`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx navbar styles");
