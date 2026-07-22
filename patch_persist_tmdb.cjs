const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update useState to initialize from localStorage
code = code.replace(
  'const [tmdbCache, setTmdbCache] = useState<Movie[]>([]);',
  `const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem("classico_tmdb_cache");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });`
);

// Add useEffect to save to localStorage
const oldFetch = `        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              data.results.forEach((m: Movie) => map.set(m.id, m));
              return Array.from(map.values());
            });
          }
        })`;
        
const newFetch = `        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              data.results.forEach((m: Movie) => map.set(m.id, m));
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          }
        })`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Persisted tmdbCache to localStorage");
