const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Re-add import
if (!content.includes('import { heroMoviesData } from "./data/hero_movies";')) {
  content = content.replace('import { importedMoviesData } from "./data/imported_movies";', 'import { importedMoviesData } from "./data/imported_movies";\nimport { heroMoviesData } from "./data/hero_movies";');
}

// Fix variables
content = content.replace(/const jellyfinHeroMovies: any\[\] = \[\];/g, "const jellyfinHeroMovies = heroMoviesData.heroes;");
content = content.replace(/jellyfinHeroMovie/g, "heroMovie");
content = content.replace(/jellyfinHeroMovies/g, "heroMovies");
content = content.replace(/useTextTitleForJellyfinHero/g, "useTextTitleForHero");
content = content.replace(/setUseTextTitleForJellyfinHero/g, "setUseTextTitleForHero");

fs.writeFileSync('src/App.tsx', content);
console.log('done hero');
