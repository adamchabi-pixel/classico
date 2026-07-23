const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add importedMoviesData
code = code.replace(
  /import \{ allMoviesData \} from "\.\/data\/all_movies";/,
  'import { allMoviesData } from "./data/all_movies";\nimport { importedMoviesData } from "./data/imported_movies";'
);

// We need to merge them.
code = code.replace(
  /const allMovies = allMoviesData;/,
  'const allMovies = [...allMoviesData, ...importedMoviesData];'
);

// 2. Remove Jellyfin state
code = code.replace(/const \[jellyfinHeroMovies, setJellyfinHeroMovies\] = useState<any\[\]>\(heroMoviesData.heroes as any\);\n/g, 'const jellyfinHeroMovies = heroMoviesData.heroes as any;\n');
code = code.replace(/const jellyfinHeroMovie = jellyfinHeroMovies\[currentHeroIndex\] \|\| null;\n/g, 'const jellyfinHeroMovie = jellyfinHeroMovies[currentHeroIndex] || null;\n');
code = code.replace(/const \[isJellyfinHeroLoading, setIsJellyfinHeroLoading\] = useState\(false\);\n/g, '');
code = code.replace(/const \[useTextTitleForJellyfinHero, setUseTextTitleForJellyfinHero\] = useState\(false\);\n/g, 'const [useTextTitleForJellyfinHero, setUseTextTitleForJellyfinHero] = useState(false);\n');
code = code.replace(/const \[jellyfinConfig, setJellyfinConfig\] = useState<\{ configured: boolean; url: string \} \| null>\(null\);\n/g, '');

code = code.replace(/const \[jellyfinMovies, setJellyfinMovies\] = useState<Movie\[\]>\(allMoviesData as any\);\n/g, 'const jellyfinMovies: any[] = [];\n');
code = code.replace(/const \[jellyfinSearchQuery, setJellyfinSearchQuery\] = useState\(""\);\n/g, '');
code = code.replace(/const \[isJellyfinLoading, setIsJellyfinLoading\] = useState\(false\);\n/g, '');
code = code.replace(/const \[isJellyfinError, setIsJellyfinError\] = useState\(""\);\n/g, '');
code = code.replace(/const \[jellyfinInputUrl, setJellyfinInputUrl\] = useState\(""\);\n/g, '');
code = code.replace(/const \[jellyfinInputApiKey, setJellyfinInputApiKey\] = useState\(""\);\n/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Replaced jellyfin states in App.tsx");
