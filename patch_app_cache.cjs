const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /map\.set\(targetMovieId, \{ \.\.\.activeMovie, \.\.\.data\.movie \}\);/,
  `map.set(targetMovieId, { ...activeMovie, ...data.movie, id: targetMovieId });`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx cache logic");
