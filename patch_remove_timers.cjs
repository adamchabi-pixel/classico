const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Remove the FAIL-SAFE LOADER CLEAR effect entirely
const failsafeEffectRegex = /\/\/ FAIL-SAFE LOADER CLEAR[\s\S]*?}, \[movieId\]\);\n/g;
code = code.replace(failsafeEffectRegex, '');

// Remove the setTimeout inside fetchPlayback
code = code.replace(
  /setTimeout\(\(\) => \{\n\s*setIsIframeLoading\(false\);\n\s*\}, \d+\);/g,
  ''
);

// Ensure the iframe still has onLoad and opacity handling is simple
// Actually I removed opacity-0 earlier, let's keep it visible immediately or keep opacity classes?
// The user said remove the loading screen when the player is ready, so we keep onLoad.

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Removed artificial timeouts");
