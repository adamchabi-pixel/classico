const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove tmdbCache state from current position
const tmdbCacheStateCode = `  const [tmdbSearchResults, setTmdbSearchResults] = useState<Movie[]>([]);
  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem("classico_tmdb_cache");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });`;

code = code.replace(tmdbCacheStateCode, '');

// 2. Insert tmdbCache before allMovies
const allMoviesStart = `  const allMovies = React.useMemo(() => {`;
code = code.replace(allMoviesStart, tmdbCacheStateCode + '\\n\\n' + allMoviesStart);

// 3. Add tmdbCache to allMovies logic
const oldAllMoviesEnd = `    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m, isJellyfin: true });
      }
    });

    return Array.from(map.values());
  }, [mappedCollections, jellyfinMovies]);`;

const newAllMoviesEnd = `    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m, isJellyfin: true });
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

code = code.replace(oldAllMoviesEnd, newAllMoviesEnd);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched tmdbCache position and allMovies");
