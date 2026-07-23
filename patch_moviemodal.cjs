const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

code = code.replace(
  '{movie.director} &bull; {movie.year}',
  '{movie.director ? movie.director : "Unknown Director"} &bull; {movie.year}'
);

code = code.replace(
  '<span className="text-white font-semibold font-display text-base">{movie.director}</span>',
  '<span className="text-white font-semibold font-display text-base">{movie.director || "Unknown Director"}</span>'
);

code = code.replace(
  '{movie.genre.map((g, idx) => (',
  '{(Array.isArray(movie.genre) ? movie.genre : []).map((g, idx) => ('
);

fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched MovieModal.tsx");
