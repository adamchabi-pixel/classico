import sys

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """  const mappedCollections = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];

    const matchedServersMovieIds = new Set<string>();

    // 1. Process standard Saga Collections (Christopher Nolan, John Wick, etc.)
    // Keep ONLY movies actually found on the server, and drop empty collections
    const curatedSagaCollections = COLLECTIONS.map((collection) => {"""

end_target = """      return {
        ...collection,
        movies: sortedMovies,
      };
    }).filter(c => c.movies.length > 0);

    return curatedSagaCollections;
  }, [jellyfinMovies]);"""

start_idx = content.find(target)
end_idx = content.find(end_target) + len(end_target)

if start_idx != -1 and end_idx != -1:
    new_code = """  const mappedCollections = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];

    // Dynamically group movies by genre
    const genresMap = new Map<string, Movie[]>();
    jellyfinMovies.forEach(movie => {
      if (movie.genre && movie.genre.length > 0) {
        movie.genre.forEach(g => {
          if (!genresMap.has(g)) {
            genresMap.set(g, []);
          }
          genresMap.get(g)!.push({ ...movie, isJellyfin: true });
        });
      } else {
        if (!genresMap.has("Autres")) genresMap.set("Autres", []);
        genresMap.get("Autres")!.push({ ...movie, isJellyfin: true });
      }
    });

    const collections = Array.from(genresMap.entries()).map(([genre, movies]) => {
      return {
        id: genre.toLowerCase().replace(/\\s+/g, '-'),
        title: genre,
        description: `Collection ${genre}`,
        movies: movies.sort((a, b) => b.year - a.year)
      };
    });

    // Add a "Récents" collection at the beginning
    collections.unshift({
      id: "recent",
      title: "Récemment Ajoutés",
      description: "Les derniers films ajoutés",
      movies: [...jellyfinMovies].map(m => ({ ...m, isJellyfin: true })).reverse()
    });

    return collections;
  }, [jellyfinMovies]);"""
    
    content = content[:start_idx] + new_code + content[end_idx:]
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Not found")
