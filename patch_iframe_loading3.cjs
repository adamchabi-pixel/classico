const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Remove onLoad from iframe
code = code.replace('onLoad={() => setIsIframeLoading(false)}', '');

// Set timeout to 3500ms
code = code.replace(
  'setTimeout(() => {\n              setIsIframeLoading(false);\n            }, 3000);',
  'setTimeout(() => {\n              setIsIframeLoading(false);\n            }, 3500);'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched iframe loader to use 3.5s timeout instead of onLoad");
