const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');

serverCode = serverCode.replace(
  /localMovie = \[\.\.\.imported, \.\.\.allMoviesData\]\.find/g,
  'localMovie = [...imported, ...importedMoviesData, ...allMoviesData].find'
);

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Fixed movie details merge");
