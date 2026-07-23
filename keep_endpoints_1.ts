app.get("/api/admin/collections/modifications", (req, res) => {
  const DB_PATH = path.join(process.cwd(), "collections_modifications.json");
  let mods = { deletedCollections: [], addedMovies: {}, removedMovies: {} };
  if (fs.existsSync(DB_PATH)) {
    try { mods = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); } catch(e) {}
  }
  res.json({ success: true, modifications: mods });
});


app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested movie details for ID:", id);
    const isTv = id.endsWith('-tv');
    const actualId = isTv ? id.replace('-tv', '') : id;
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    // Determine if it's IMDB or TMDB ID
    
    let tmdbId = actualId;
    
    // First, try to find the movie in our local database to get the real tmdbId
    let localMovie = null;
    try {
      const imported = fs.existsSync(path.join(process.cwd(), "imported_movies.json")) ? JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8")) : [];
      localMovie = [...imported, ...importedMoviesData, ...allMoviesData].find(m => m.id === actualId || m.imdbId === actualId);
    } catch(e) {}
    
    if (localMovie && localMovie.tmdbId && localMovie.tmdbId !== actualId) {
      tmdbId = localMovie.tmdbId;
    } else if (actualId.startsWith('tt')) {
      const findUrl = `https://api.themoviedb.org/3/find/${actualId}?external_source=imdb_id`;
      const findRes = await fetch(findUrl, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }});
      if (findRes.ok) {
        const findData = await findRes.json();
        if (findData.movie_results && findData.movie_results.length > 0) {
          tmdbId = String(findData.movie_results[0].id);
        } else if (findData.tv_results && findData.tv_results.length > 0) {
          tmdbId = String(findData.tv_results[0].id);
        }
      }
    } else if (isNaN(Number(actualId))) {
      // It's a string slug, let's look it up
      if (localMovie) {
        const query = encodeURIComponent(localMovie.title);
        const searchUrl = isTv 
          ? `https://api.themoviedb.org/3/search/tv?query=${query}&first_air_date_year=${localMovie.year}&language=en-US`
          : `https://api.themoviedb.org/3/search/movie?query=${query}&year=${localMovie.year}&language=en-US`;
        
        const searchRes = await fetch(searchUrl, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }});
        if (searchRes.ok) {
          const data = await searchRes.json();
          if (data.results && data.results.length > 0) {
            tmdbId = String(data.results[0].id);
          }
        }
      }
    }

    
    const url = isTv 
      ? `https://api.themoviedb.org/3/tv/${tmdbId}?append_to_response=credits,images,similar,videos&include_image_language=en,null&language=en-US`
      : `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images,similar,videos&include_image_language=en,null&language=en-US`;
      
    const movieRes = await fetch(url, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }});
    
    if (!movieRes.ok) throw new Error("TMDB details failed");
    const m = await movieRes.json();
    
    let director = "Unknown";
    if (isTv) {
      director = m.created_by?.[0]?.name || m.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name || "Unknown";
    } else {
      director = m.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
    }
    
    const cast = m.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
    const castDetails = m.credits?.cast?.slice(0, 10).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      role: c.character,
      imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
    })) || [];
    
    const similar = m.similar?.results?.slice(0, 10).map((s: any) => ({
      id: isTv ? `${s.id}-tv` : String(s.id),
      tmdbId: String(s.id),
      title: isTv ? s.name : s.title,
      posterUrl: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
      year: (isTv ? s.first_air_date : s.release_date) ? parseInt((isTv ? s.first_air_date : s.release_date).substring(0, 4)) : 0,
      isTv
    })) || [];
    let logoUrl = "";
    if (m.images?.logos && m.images.logos.length > 0) {
      const bestLogo = m.images.logos.find((l: any) => l.iso_639_1 === "en") || m.images.logos[0];
      logoUrl = `https://image.tmdb.org/t/p/w500${bestLogo.file_path}`;
    }
    
    let seasons = [];
    if (isTv && m.seasons) {
      seasons = m.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        posterUrl: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
      }));
    }
    
    const releaseDate = isTv ? m.first_air_date : m.release_date;
    
    
    let trailerUrl = null;
    if (m.videos && m.videos.results) {
      const trailer = m.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || m.videos.results.find((v: any) => v.site === "YouTube");
      if (trailer) {
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      }
    }
    const movieData = {
      hasLogo: !!logoUrl,
      logoUrl: logoUrl,
      id: id, // Keep original requested id with -tv suffix
      tmdbId: String(m.id),
      imdbId: m.imdb_id || String(m.id),
      isTv,
      tagline: m.tagline || "",
      title: isTv ? m.name : m.title,
      originalTitle: isTv ? m.original_name : m.original_title,
      originalLanguage: m.original_language || "en",
      description: m.overview,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
      year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
      duration: isTv ? (m.episode_run_time?.[0] || 45) : (m.runtime || 120),
      director: director,
      cast: cast,
      castDetails: castDetails,
      similar: similar,
      genre: m.genres ? m.genres.map((g: any) => g.name) : (isTv ? ["TV Series"] : ["Movie"]),
      voteAverage: m.vote_average,
      isIframeEmbed: true,
      seasons: seasons,
      iframeSrc: isTv ? "" : `https://player.videasy.net/movie/${m.id}?color=FFD700&overlay=true`,
      
    };
    
    
    // AUTOMATICALLY SAVE TO CODEBASE SO IT IS INCLUDED IN DEPLOYMENT
    try {
      const DB_PATH = path.join(process.cwd(), "imported_movies.json");
      let data = [];
      if (fs.existsSync(DB_PATH)) {
        try {
          data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        } catch(e) {}
      }
      if (!data.some((existing: any) => existing.id === movieData.id)) {
        data.push(movieData);
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
        const tsCode = `export const importedMoviesData = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(path.join(process.cwd(), "src/data/imported_movies.ts"), tsCode, "utf-8");
        console.log("Automatically saved movie to codebase for deployment:", movieData.title);
      }
    } catch(err) {
      console.error("Auto-save failed", err);
    }

    
    res.json({ success: true, movie: movieData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/tv/:id/season/:season_number", async (req, res) => {
  try {
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    const { id, season_number } = req.params;
    const cleanId = id.replace("-tv", "");
    const url = `https://api.themoviedb.org/3/tv/${cleanId}/season/${season_number}?language=en-US`;
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("TMDB fetch failed");
    const data = await response.json();
    
    const episodes = (data.episodes || []).map((ep: any) => ({
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : "",
      runtime: ep.runtime
    }));
    
    res.json({ success: true, episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, results: [] });
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    // Use multi search to support both movies and tv shows
    const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query as string)}&language=en-US&page=1`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
    });
    
    if (!searchRes.ok) throw new Error("TMDB search failed");
    const searchData = await searchRes.json();
    
    // Filter out people, keep only movie and tv
    const validResults = searchData.results.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
    
    const lowerQuery = (query as string).toLowerCase().trim();
    validResults.sort((a: any, b: any) => {
      const aTitle = (a.name || a.title || "").toLowerCase();
      const bTitle = (b.name || b.title || "").toLowerCase();
      const aExact = aTitle === lowerQuery;
      const bExact = bTitle === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    const topResults = validResults.slice(0, 12);
    
    const enrichedResults = await Promise.all(topResults.map(async (m: any) => {
      let director = "Unknown";
      let cast = [];
      let genres = [];
      const isTv = m.media_type === "tv";
      try {
        const detailUrl = isTv 
          ? `https://api.themoviedb.org/3/tv/${m.id}?append_to_response=credits&language=en-US`
          : `https://api.themoviedb.org/3/movie/${m.id}?append_to_response=credits&language=en-US`;
        const detailRes = await fetch(detailUrl, {
          headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
        });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          genres = detailData.genres ? detailData.genres.map((g: any) => g.name) : [];
          if (isTv) {
            // TV shows have 'created_by' instead of director in crew, but we'll use first creator or fallback to director if available
            director = detailData.created_by?.[0]?.name || detailData.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name || "Unknown";
          } else {
            director = detailData.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
          }
          cast = detailData.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
        }
      } catch (e) {
        console.warn("Failed to fetch details for search result", m.id);
      }
      
      const title = isTv ? m.name : m.title;
      const originalTitle = isTv ? m.original_name : m.original_title;
      const releaseDate = isTv ? m.first_air_date : m.release_date;
      
      return {
        id: String(m.id) + (isTv ? "-tv" : ""),
        tmdbId: String(m.id),
        isTv,
        title,
        originalTitle,
        description: m.overview,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
        year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
        voteAverage: m.vote_average,
        director,
        cast,
        genre: genres.length > 0 ? genres : (isTv ? ["TV Series"] : ["Movie"]),
        isIframeEmbed: true,
        iframeSrc: isTv ? "" : `https://player.videasy.net/movie/${m.id}?color=FFD700&overlay=true`,
      
      };
    }));
    
    res.json({ success: true, results: enrichedResults });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/admin/collections/modify", express.json(), (req, res) => {
  const { action, collectionId, movieId } = req.body;
  const DB_PATH = path.join(process.cwd(), "collections_modifications.json");
  let mods = { deletedCollections: [], addedMovies: {}, removedMovies: {} };
  if (fs.existsSync(DB_PATH)) {
    try { mods = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); } catch(e) {}
  }
  
  if (action === "delete_collection") {
    if (!mods.deletedCollections.includes(collectionId)) {
      mods.deletedCollections.push(collectionId);
    }
  } else if (action === "remove_movie") {
    if (!mods.removedMovies[collectionId]) mods.removedMovies[collectionId] = [];
    if (!mods.removedMovies[collectionId].includes(movieId)) {
      mods.removedMovies[collectionId].push(movieId);
    }
  } else if (action === "add_movie") {
    // Note: To fully add a movie it must exist in imported_movies.json. We will assume it does, or this just tags it.
    if (!mods.addedMovies[collectionId]) mods.addedMovies[collectionId] = [];
    if (!mods.addedMovies[collectionId].includes(movieId)) {
      mods.addedMovies[collectionId].push(movieId);
    }
  }

  try { fs.writeFileSync(DB_PATH, JSON.stringify(mods, null, 2)); } catch(e) {}
  res.json({ success: true, modifications: mods });
});

app.post("/api/admin/save-to-code", async (req, res) => {
  try {
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let data = "[]";
    if (fs.existsSync(DB_PATH)) {
      data = fs.readFileSync(DB_PATH, "utf-8");
    }
    const tsCode = `export const importedMoviesData = ${data};
`;
    fs.writeFileSync(path.join(process.cwd(), "src/data/imported_movies.ts"), tsCode, "utf-8");
    return res.json({ success: true });
  } catch(e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/movies/add", express.json(), async (req, res) => {
  try {
    const { ids, categoryId, isHero } = req.body;
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
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`;
        const findRes = await fetch(findUrl, {
          headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
        });
        if (findRes.ok) {
          const findData = await findRes.json();
          if (findData.movie_results && findData.movie_results.length > 0) {
            tmdbId = findData.movie_results[0].id;
          }
        }
      }

      // Fetch movie details from TMDb
      const movieUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`;
      const movieRes = await fetch(movieUrl, {
        headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
      });
      
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        
        // Si on n'avait pas l'imdb_id, on le récupère maintenant
        if (!imdbId && movieData.imdb_id) {
          imdbId = movieData.imdb_id;
        }

        const directorObj = movieData.credits?.crew?.find(c => c.job === 'Director');
        const director = directorObj ? directorObj.name : "Unknown";
        const cast = movieData.credits?.cast?.slice(0, 10).map(c => c.name) || [];
        const genres = movieData.genres?.map((g: any) => g.name) || [];
        
        const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

        const finalId = imdbId || String(tmdbId); // Prefer IMDb for iframe

        const newFiche = {
          hasLogo: !!logoObj,
          logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
          id: finalId,
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
          customCategory: categoryId || "none",
          isHero: !!isHero,
          iframeSrc: imdbId ? `https://player.videasy.net/movie/${imdbId}?color=FFD700&overlay=true` : `https://player.videasy.net/movie/${tmdbId}?color=FFD700&overlay=true`
        };

        addedMovies.push(newFiche);
      }
    }

    // Sauvegarde dans imported_movies.json
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
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

    try { fs.writeFileSync(DB_PATH, JSON.stringify(existingMovies, null, 2));
    
     } catch (e) { console.warn("Could not write cache:", e.message); }
// Clear the memory cache so the next GET /api/jellyfin/movies will reload
    setCached("movies-list", null, 0);

    return res.json({ success: true, count: addedMovies.length, added: addedMovies });
  } catch (err) {
    console.error("Bulk import error:", err);
