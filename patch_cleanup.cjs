const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'const match = allMovies.find(m => m.id === targetMovieId); console.log("DEBUG activeMovie:", targetMovieId, match); return match || null;',
  'return allMovies.find(m => m.id === targetMovieId) || null;'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Cleanup done.");
