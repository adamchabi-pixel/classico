const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Replace opacity-0 with nothing, keep iframe visible
code = code.replace(
  "className={`absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}",
  'className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center"'
);

// Reduce timeout to 2.5s
code = code.replace(
  'setTimeout(() => {\n              setIsIframeLoading(false);\n            }, 3500);',
  'setTimeout(() => {\n              setIsIframeLoading(false);\n            }, 2500);'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched iframe opacity and timeout");
