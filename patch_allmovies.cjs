const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetAllMovies = `    // Add TMDB cache movies
    tmdbCache.forEach(m => {
      if (true) {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        } else {
          // Merge in missing details (like seasons)
          const existing = map.get(m.id)!;
          map.set(m.id, { ...existing, ...m });
        }
      }
    });

    return Array.from(map.values()).filter(m => !isAnimeOrAdult(m));
  }, [mappedCollections, allMoviesBase, tmdbCache]);`;

const replaceAllMovies = `    // Add TMDB cache movies
    tmdbCache.forEach(m => {
      if (true) {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        } else {
          // Merge in missing details (like seasons)
          const existing = map.get(m.id)!;
          map.set(m.id, { ...existing, ...m });
        }
      }
    });
    
    // Add TMDB search results so they can be clicked immediately
    tmdbSearchResults.forEach(m => {
       if (!map.has(m.id)) {
          map.set(m.id, m);
       }
    });

    return Array.from(map.values()).filter(m => !isAnimeOrAdult(m));
  }, [mappedCollections, allMoviesBase, tmdbCache, tmdbSearchResults]);`;

file = file.replace(targetAllMovies, replaceAllMovies);

const targetFetch = `          if (data.success && data.movie) {
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              map.set(targetMovieId, { ...(activeMovie || {}), ...data.movie, id: targetMovieId });
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          } else {
            setMovieLoadError(data.error || "Failed to load movie data.");
          }
        })
        .catch(err => {
          console.error("Error fetching missing movie data:", err);
          setMovieLoadError(err.message);
        });
    }
  }, [targetMovieId, activeMovie]);`;

const replaceFetch = `          if (data.success && data.movie) {
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              map.set(targetMovieId, { ...(activeMovie || {}), ...data.movie, id: targetMovieId });
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          } else {
            if (!activeMovie) setMovieLoadError(data.error || "Failed to load movie data.");
          }
        })
        .catch(err => {
          console.error("Error fetching missing movie data:", err);
          if (!activeMovie) setMovieLoadError(err.message);
        });
    }
  }, [targetMovieId, activeMovie]);`;

file = file.replace(targetFetch, replaceFetch);

fs.writeFileSync('src/App.tsx', file);
