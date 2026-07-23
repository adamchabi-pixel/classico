const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetCache = `  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem("classico_tmdb_cache");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });`;

code = code.replace(targetCache, '');

const insertBefore = `  const allMoviesBase = React.useMemo(() => {`;
code = code.replace(insertBefore, targetCache + '\n' + insertBefore);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Moved tmdbCache definition");
