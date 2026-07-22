const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '{collection.movies.map((movie, idx) => (',
  '{collection.movies.slice(0, 40).map((movie, idx) => ('
);

code = code.replace(
  '{unmatchedMovies.map((movie) => (',
  '{unmatchedMovies.slice(0, 40).map((movie) => ('
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx slices.");
