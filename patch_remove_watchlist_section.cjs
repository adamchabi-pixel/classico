const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = '{/* Watchlist Row displaying bookmarked films */}';
const endMarker = '{/* Watch History displaying viewed films */}';

let startIndex = code.indexOf(startMarker);
let endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code, 'utf-8');
  console.log("Removed Watchlist section from Profil");
} else {
  console.log("Markers not found");
}
