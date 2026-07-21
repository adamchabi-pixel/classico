const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

// Add imports
appTsx = appTsx.replace(
  'import { COLLECTIONS as RAW_COLLECTIONS, Movie, Collection } from "./data";',
  'import { COLLECTIONS as RAW_COLLECTIONS, Movie, Collection } from "./data";\nimport { allMoviesData } from "./data/all_movies";\nimport { heroMoviesData } from "./data/hero_movies";'
);

// Replace state initialization
appTsx = appTsx.replace(
  'const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>([]);',
  'const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>(allMoviesData as any);'
);

appTsx = appTsx.replace(
  'const [jellyfinHeroMovies, setJellyfinHeroMovies] = useState<any[]>([]);',
  'const [jellyfinHeroMovies, setJellyfinHeroMovies] = useState<any[]>(heroMoviesData.heroes as any);'
);

appTsx = appTsx.replace(
  'const [isJellyfinLoading, setIsJellyfinLoading] = useState(true);',
  'const [isJellyfinLoading, setIsJellyfinLoading] = useState(false);'
);

appTsx = appTsx.replace(
  'const [isJellyfinHeroLoading, setIsJellyfinHeroLoading] = useState(true);',
  'const [isJellyfinHeroLoading, setIsJellyfinHeroLoading] = useState(false);'
);

// Remove the tryFetch block that tests jellyfin connection
appTsx = appTsx.replace(
  /const tryFetch = async \(\) => \{[\s\S]*?setIsJellyfinHeroLoading\(false\);\n\s*\}\n\s*\}\n\s*\};\n\s*tryFetch\(\);/,
  '// tryFetch removed: Using static Videasy data\n      setJellyfinConfig({ configured: true, url: "https://videasy.net" });'
);

// Also remove loadJellyfinLibrary implementation since it's now static
appTsx = appTsx.replace(
  /const loadJellyfinLibrary = async \(\) => \{[\s\S]*?finally \{\n\s*setIsJellyfinLoading\(false\);\n\s*\}\n\s*\};/,
  'const loadJellyfinLibrary = async () => {}; // Removed: Using static data'
);

// Remove hero fetch
appTsx = appTsx.replace(
  /const fetchHero = async \(\) => \{[\s\S]*?finally \{\n\s*setIsJellyfinHeroLoading\(false\);\n\s*\}\n\s*\};/,
  'const fetchHero = async () => {}; // Removed: Using static hero data'
);

// Remove the periodic revalidation effect
appTsx = appTsx.replace(
  /useEffect\(\(\) => \{\n\s*let interval: any;\n\s*if \(jellyfinConfig\.configured && !isJellyfinLoading\) \{[\s\S]*?return \(\) => clearInterval\(interval\);\n\s*\}, \[jellyfinConfig\.configured, isJellyfinLoading\]\);/,
  ''
);

fs.writeFileSync('src/App.tsx', appTsx, 'utf-8');
console.log("App.tsx patched");
