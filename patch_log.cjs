const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  '            const iframeResult = {',
  '            console.log("Videasy ID resolution", {movieId, actualTmdbId, matchedMovie});\n            const iframeResult = {'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched log");
