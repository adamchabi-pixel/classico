
import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(compression());
const PORT = process.env.PORT || 3000;
app.use(express.json());

const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";



app.get("/api/trending", async (req, res) => {
  try {
    const pages = [1, 2, 3];
    const fetchPage = async (page) => {
      const url = `https://api.themoviedb.org/3/trending/all/day?language=en-US&page=${page}`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    };

    const resultsByPage = await Promise.all(pages.map(fetchPage));
    const combinedResults = resultsByPage.flat();
    const validResults = combinedResults.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
    
    const enrichedResults = validResults.slice(0, 60).map((m: any) => {
      const title = m.title || m.name || m.original_title || m.original_name;
      const isTv = m.media_type === "tv";
      return {
        id: isTv ? `${m.id}-tv` : String(m.id),
        tmdbId: String(m.id),
        isTv,
        title,
        originalTitle: m.original_title || m.original_name,
        description: m.overview || "",
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        year: parseInt((m.release_date || m.first_air_date || "0").split("-")[0]) || 0,
        voteAverage: m.vote_average,
        director: "Unknown",
        cast: [],
        genre: [],
        isIframeEmbed: true,
        iframeSrc: ""
      };
    });
    
    res.json({ success: true, results: enrichedResults });
  } catch (error) {
    console.error("TMDB Trending API Error:", error);
    res.status(500).json({ success: false, error: "TMDB trending failed" });
  }
});


app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, results: [] });
    
    
    const searchUrl1 = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`;
    const searchUrl2 = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=2`;
    const [searchRes1, searchRes2] = await Promise.all([
      fetch(searchUrl1, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" } }),
      fetch(searchUrl2, { headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" } })
    ]);
    
    if (!searchRes1.ok) throw new Error("TMDB search failed");
    const searchData1 = await searchRes1.json();
    const searchData2 = searchRes2.ok ? await searchRes2.json() : { results: [] };
    
    const combinedResults = [...(searchData1.results || []), ...(searchData2.results || [])];
    const validResults = combinedResults.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");

    
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
    
    const topResults = validResults.slice(0, 40);
    
    const enrichedResults = topResults.map((m: any) => {
      const isTv = m.media_type === "tv";
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
        director: "Unknown",
        cast: [],
        genre: [],
        isIframeEmbed: true,
        iframeSrc: isTv ? "" : `https://player.videasy.net/movie/${m.id}?color=FFD700&overlay=true`
      };
    });
    
    res.json({ success: true, results: enrichedResults });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isTv = id.endsWith('-tv');
    const actualId = isTv ? id.replace('-tv', '') : id;
    
    const url = isTv 
      ? `https://api.themoviedb.org/3/tv/${actualId}?append_to_response=credits,videos,similar&language=en-US`
      : `https://api.themoviedb.org/3/movie/${actualId}?append_to_response=credits,videos,similar&language=en-US`;
      
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
    });
    
    if (!response.ok) throw new Error("TMDB fetch failed");
    
    const m = await response.json();
    let director = "Unknown";
    if (isTv) {
      director = m.created_by?.[0]?.name || m.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name || "Unknown";
    } else {
      director = m.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
    }
    const cast = m.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [];
    
    const releaseDate = isTv ? m.first_air_date : m.release_date;
    
    let seasons = [];
    if (isTv && m.seasons) {
      seasons = m.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        air_date: s.air_date,
        poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
        episodes: []
      }));
    }
    
    const movieData = {
      id: id,
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
      castDetails: m.credits?.cast?.slice(0, 8).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        role: c.character,
        imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : undefined
      })) || [],
      similar: m.similar?.results?.slice(0, 8).map((sm: any) => ({
        id: String(sm.id) + (isTv ? "-tv" : ""),
        tmdbId: String(sm.id),
        isTv,
        title: isTv ? sm.name : sm.title,
        description: sm.overview,
        posterUrl: sm.poster_path ? `https://image.tmdb.org/t/p/w500${sm.poster_path}` : "",
        backdropUrl: sm.backdrop_path ? `https://image.tmdb.org/t/p/w780${sm.backdrop_path}` : "",
        year: (isTv ? sm.first_air_date : sm.release_date) ? parseInt((isTv ? sm.first_air_date : sm.release_date).substring(0, 4)) : new Date().getFullYear(),
      })) || [],
      genre: m.genres ? m.genres.map((g: any) => g.name) : (isTv ? ["TV Series"] : ["Movie"]),
      voteAverage: m.vote_average,
      isIframeEmbed: true,
      seasons: seasons,
      iframeSrc: isTv ? "" : `https://player.videasy.net/movie/${m.id}?color=FFD700&overlay=true`
    };
    
    // Auto-save logic
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
    const { id, season_number } = req.params;
    const cleanId = id.replace("-tv", "");
    const url = `https://api.themoviedb.org/3/tv/${cleanId}/season/${season_number}?language=en-US`;
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("TMDB fetch failed");
    const seasonData = await response.json();
    
    const episodes = seasonData.episodes.map((ep: any) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : "",
      air_date: ep.air_date,
      runtime: ep.runtime
    }));
    
    res.json({ success: true, episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');
    
    app.use('/assets', express.static(assetsPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, p) => {
        if (p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.woff2') || p.endsWith('.png') || p.endsWith('.jpg')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
}

startServer();
