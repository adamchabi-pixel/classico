const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = "    if (targetMovieId && (!activeMovie || !activeMovie.director || activeMovie.tagline === undefined || (activeMovie.isTv && !activeMovie.seasons))) {";
const replacement = "    if (targetMovieId && (!activeMovie || !activeMovie.director || activeMovie.tagline === undefined || !activeMovie.castDetails || (activeMovie.isTv && !activeMovie.seasons))) {";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code, 'utf-8');
  console.log("Patched successfully!");
} else {
  console.log("Target not found!");
}
