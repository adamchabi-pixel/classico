const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');

serverCode = serverCode.replace(
  /let mergedMovies = \[\.\.\.allMoviesData\];/,
  'let mergedMovies = [...importedMoviesData, ...allMoviesData];'
);

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Fixed movies merge");
