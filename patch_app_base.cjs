const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/\[\.\.\.allMoviesData, \.\.\.importedMoviesData\]/g, '[...importedMoviesData, ...allMoviesData]');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx base order");
