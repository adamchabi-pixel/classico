const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const jellyfinHeroMovies: any\[\] = \[\];/g, 'const jellyfinHeroMovies = heroMoviesData.heroes;');
code = code.replace(/const jellyfinHeroMovie: any = null;/g, 'const jellyfinHeroMovie = jellyfinHeroMovies[currentHeroIndex] || null;');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed hero initialization");
