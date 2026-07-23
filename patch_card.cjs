const fs = require('fs');
let code = fs.readFileSync('src/components/MovieCard.tsx', 'utf-8');

code = code.replace(/\{movie\.director \? movie\.director\.split\(' '\)\.pop\(\) : \(movie\.year \|\| 'Film'\)\}/g, `{movie.director && movie.director !== "Unknown" ? movie.director.split(' ').pop() : (movie.year || 'Film')}`);

fs.writeFileSync('src/components/MovieCard.tsx', code, 'utf-8');
console.log("Patched MovieCard.tsx director logic.");
