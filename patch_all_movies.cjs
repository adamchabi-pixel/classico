const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add tmdbCache state
code = code.replace(
  'const [tmdbSearchResults, setTmdbSearchResults] = useState<Movie[]>([]);',
  'const [tmdbSearchResults, setTmdbSearchResults] = useState<Movie[]>([]);\n  const [tmdbCache, setTmdbCache] = useState<Movie[]>([]);'
);

// 2. Update the fetch to append to tmdbCache
const oldFetch = `        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
          }
        })`;
const newFetch = `        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              data.results.forEach((m: Movie) => map.set(m.id, m));
              return Array.from(map.values());
            });
          }
        })`;
code = code.replace(oldFetch, newFetch);

// 3. Update allMovies to include tmdbCache
const oldAllMovies = `    // Add remaining jellyfin movies
    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values());
  }, [mappedCollections, jellyfinMovies]);`;

const newAllMovies = `    // Add remaining jellyfin movies
    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    });
    
    // Add TMDB cache movies
    tmdbCache.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values());
  }, [mappedCollections, jellyfinMovies, tmdbCache]);`;

code = code.replace(oldAllMovies, newAllMovies);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched tmdbCache in App.tsx");
