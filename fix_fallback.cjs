const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/res\.json\(\{ success: true, movies: allMoviesData \}\);/g, 'res.json({ success: true, movies: [...importedMoviesData, ...allMoviesData] });');
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Fallback fixed");
