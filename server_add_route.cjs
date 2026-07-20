const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routeCode = `
app.post("/api/admin/movies/add", express.json(), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, error: "Paramètre ids manquant." });
    }

    const TMDB_API_KEY = "a46ab41a292facadfd7e85f0ff213109";
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

    const idList = ids.split(",").map(id => id.trim()).filter(id => id.length > 0);
    const addedMovies = [];

    for (const rawId of idList) {
      let tmdbId = rawId;
      let imdbId = "";

      // Si c'est un IMDb ID, on cherche le TMDb ID d'abord
      if (rawId.startsWith("tt")) {
        imdbId = rawId;
        const findUrl = \`https://api.themoviedb.org/3/find/\${imdbId}?external_source=imdb_id\`;
        const findRes = await fetch(findUrl, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
        });
        if (findRes.ok) {
          const findData = await findRes.json();
          if (findData.movie_results && findData.movie_results.length > 0) {
            tmdbId = findData.movie_results[0].id;
          }
        }
      }

      // Fetch movie details from TMDb
      const movieUrl = \`https://api.themoviedb.org/3/movie/\${tmdbId}?append_to_response=credits&language=fr-FR\`;
      const movieRes = await fetch(movieUrl, {
        headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
      });
      
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        
        // Si on n'avait pas l'imdb_id, on le récupère maintenant
        if (!imdbId && movieData.imdb_id) {
          imdbId = movieData.imdb_id;
        }

        const directorObj = movieData.credits?.crew?.find(c => c.job === 'Director');
        const director = directorObj ? directorObj.name : "Inconnu";
        const cast = movieData.credits?.cast?.slice(0, 10).map(c => c.name) || [];
        const genres = movieData.genres?.map(g => g.name) || [];
        
        const finalId = imdbId || String(tmdbId); // Prefer IMDb for iframe

        const newFiche = {
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? \`https://image.tmdb.org/t/p/w500\${movieData.poster_path}\` : "",
          backdropUrl: movieData.backdrop_path ? \`https://image.tmdb.org/t/p/original\${movieData.backdrop_path}\` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime || 0,
          voteAverage: movieData.vote_average,
          language: movieData.original_language,
          status: movieData.status,
          genre: genres,
          director: director,
          cast: cast,
          isIframeEmbed: true,
          iframeSrc: imdbId ? \`https://vidapi.xyz/embed/movie/\${imdbId}\` : \`https://vidapi.xyz/embed/movie/\${tmdbId}\`
        };

        addedMovies.push(newFiche);
      }
    }

    // Sauvegarde dans imported_movies.json
    const DB_PATH = require('path').join(process.cwd(), "imported_movies.json");
    let existingMovies = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        existingMovies = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      } catch (e) {}
    }

    // Filter out duplicates before merging
    for (const newM of addedMovies) {
      existingMovies = existingMovies.filter(m => m.id !== newM.id);
      existingMovies.unshift(newM);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(existingMovies, null, 2));
    
    // Clear the memory cache so the next GET /api/jellyfin/movies will reload
    setCached("movies-list", null, 0);

    return res.json({ success: true, count: addedMovies.length, added: addedMovies });
  } catch (err) {
    console.error("Erreur bulk import:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
`;

code = code.replace(
  'app.get("/api/admin/movies/test-odyssey"',
  routeCode + '\napp.get("/api/admin/movies/test-odyssey"'
);

fs.writeFileSync('server.ts', code);
