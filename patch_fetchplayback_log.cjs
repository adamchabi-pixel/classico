const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  '    const fetchPlayback = async () => {',
  '    console.log("fetchPlayback triggered", {movieId, forceTranscode, playbackAttempts, isLowQuality, forceJellyfin});\n    const fetchPlayback = async () => {'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched fetchPlayback with logging");
