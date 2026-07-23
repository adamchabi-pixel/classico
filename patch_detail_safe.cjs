const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(/\{movie\.genre\?\.join\(\", \"\)\}/g, `{Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}`);
code = code.replace(/\{movie\.cast\.map/g, `{movie.cast && movie.cast.map`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView safety.");
