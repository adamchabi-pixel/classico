const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(/\{movie\.genre\.join\(\", \"\)\}/g, `{movie.genre?.join(", ")}`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView genre join.");
