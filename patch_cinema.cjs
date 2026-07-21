const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Replace isNetlify variable initialization to ALWAYS be false
code = code.replace(/const isNetlify = typeof window !== "undefined".*?;/g, 'const isNetlify = false; // Forced false to bypass Jellyfin');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched CinemaPlayerView to disable Jellyfin fallback");
