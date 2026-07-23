const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update mappedCollections to NOT drop movies!
const target = `    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));
          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...movie,
              id: match.id, // Use server id to play correctly
              streamUrl: match.streamUrl,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              director: match.director || movie.director,
              cast: match.cast && match.cast.length > 0 ? match.cast : movie.cast,
              voteAverage: match.voteAverage || movie.voteAverage,
              isTv: match.isTv,
              seasons: match.seasons
            };
          }
          return null;
        })
        .filter(Boolean) as Movie[];
      return { ...collection, movies: enrichedMovies };
    }).filter(c => c.movies.length > 0);`;

const replacement = `    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = allMoviesBase.find((jf) => isMovieMatch(movie.title, jf.title));
          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...movie,
              id: match.id, // Use server id to play correctly
              streamUrl: match.streamUrl,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              director: match.director || movie.director,
              cast: match.cast && match.cast.length > 0 ? match.cast : movie.cast,
              voteAverage: match.voteAverage || movie.voteAverage,
              isTv: match.isTv,
              seasons: match.seasons
            };
          }
          // If not in local data, KEEP it as a TMDB/embeddable movie!
          return {
            ...movie,
            isIframeEmbed: true,
            iframeSrc: ""
          };
        })
        .filter(Boolean) as Movie[];
      return { ...collection, movies: enrichedMovies };
    }).filter(c => c.movies.length > 0);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Updated mappedCollections to keep all movies");
