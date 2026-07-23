const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'return allMovies.find(m => m.id === targetMovieId) || null;',
  'const match = allMovies.find(m => m.id === targetMovieId); console.log("DEBUG activeMovie:", targetMovieId, match); return match || null;'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched debug");
