const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /import \{ movies \} from "\.\/src\/data";\n/,
  ''
);

code = code.replace(
  /const all = \[\.\.\.movies, \.\.\.importedMoviesData\];\n      const match = all\.find\(m => m\.id === actualId\);/,
  'const match = importedMoviesData.find(m => m.id === actualId);'
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server allMovies again");
