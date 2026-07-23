    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/movies/test-odyssey", async (req, res) => {
  try {
    const TMDB_API_KEY = "a46ab41a292facadfd7e85f0ff213109";
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    const imdbId = "tt33764258";

    // 1. Interroger TMDb /find pour récupérer le tmdbId
    const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`;
    const findRes = await fetch(findUrl, {
      headers: {
        "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!findRes.ok) {
      return res.status(500).json({ success: false, error: "Error during TMDB search find" });
    }

    const findData = await findRes.json();
    if (!findData.movie_results || findData.movie_results.length === 0) {
      return res.status(404).json({ success: false, error: "Film non trouvé sur TMDb" });
    }

    const tmdbId = findData.movie_results[0].id;

    // 2. Interroger TMDb /movie pour récupérer les détails
    const movieUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`;
    const movieRes = await fetch(movieUrl, {
      headers: {
        "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!movieRes.ok) {
      return res.status(500).json({ success: false, error: "Error fetching TMDB details" });
    }

    const movieData = await movieRes.json();

    // 3. Extraire et structurer les données
    const directorObj = movieData.credits?.crew?.find((c: any) => c.job === 'Director');
    const director = directorObj ? directorObj.name : "Unknown";
    const cast = movieData.credits?.cast?.slice(0, 10).map((c: any) => c.name) || [];
    const genres = movieData.genres?.map((g: any) => g.name) || [];

    const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

    const newFiche = {
      hasLogo: !!logoObj,
      logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
      id: imdbId, // On utilise l'imdbId comme ID unique
      tmdbId: tmdbId,
      imdbId: imdbId,
      title: movieData.title,
      originalTitle: movieData.original_title,
      description: movieData.overview,
      posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
      backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
      year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
      releaseDate: movieData.release_date,
      duration: movieData.runtime ? `${movieData.runtime} min` : "0 min",
      voteAverage: movieData.vote_average,
      rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
      language: movieData.original_language,
      status: movieData.status,
      genre: genres,
      director: director,
      cast: cast,
      isIframeEmbed: true,
      iframeSrc: `https://player.videasy.net/movie/${imdbId}?color=FFD700&overlay=true`
    };

    // 4. Sauvegarder dans le cache pour que le frontend puisse l'afficher
    // On met à jour MOVIES_CACHE_PATH et le cache mémoire "movies-list"
    const cacheKey = "movies-list";
    let cachedMovies = getCached(cacheKey) || [];
    
    if (cachedMovies.length === 0 && fs.existsSync(MOVIES_CACHE_PATH)) {
      try {
        cachedMovies = JSON.parse(fs.readFileSync(MOVIES_CACHE_PATH, "utf-8"));
      } catch (e) {}
    }

    // Retirer s'il existe déjà
    cachedMovies = cachedMovies.filter((m: any) => m.id !== imdbId);
    
    // L'ajouter au début
    cachedMovies.unshift(newFiche);

    // Mettre à jour les caches
    setCached(cacheKey, cachedMovies, 3600000);
    try {
      try { fs.writeFileSync(MOVIES_CACHE_PATH, JSON.stringify(cachedMovies));
     } catch (e) { console.warn("Could not write cache:", e.message); }} catch (e) {}
