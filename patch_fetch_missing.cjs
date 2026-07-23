const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldMemo = `  const activeMovie = React.useMemo(() => {
    let targetId = "";
    if (routePath.startsWith("/movie/")) {
      targetId = routePath.slice("/movie/".length);
    } else if (routePath.startsWith("/player/")) {
      targetId = routePath.slice("/player/".length);
    }
    if (!targetId) return null;
    return allMovies.find(m => m.id === targetId) || null;
  }, [routePath, allMovies]);`;

const newMemo = `  const targetMovieId = React.useMemo(() => {
    let targetId = "";
    if (routePath.startsWith("/movie/")) {
      targetId = routePath.slice("/movie/".length);
    } else if (routePath.startsWith("/player/")) {
      targetId = routePath.slice("/player/".length);
    }
    return targetId;
  }, [routePath]);

  const activeMovie = React.useMemo(() => {
    if (!targetMovieId) return null;
    return allMovies.find(m => m.id === targetMovieId) || null;
  }, [targetMovieId, allMovies]);

  // Fetch missing movie data if navigated directly
  useEffect(() => {
    if (targetMovieId && !activeMovie) {
      fetch(\`/api/movie/\${targetMovieId}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.movie) {
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              map.set(data.movie.id, data.movie);
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          }
        })
        .catch(err => console.error("Error fetching missing movie data:", err));
    }
  }, [targetMovieId, activeMovie]);`;

code = code.replace(oldMemo, newMemo);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched missing movie fetch in App.tsx");
