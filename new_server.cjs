const fs = require('fs');
const content = `
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

app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, results: [] });
    
    const searchUrl = \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=1\`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    
    if (!searchRes.ok) throw new Error("TMDB search failed");
    const searchData = await searchRes.json();
    
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
          ? \`https://api.themoviedb.org/3/tv/\${m.id}?append_to_response=credits&language=en-US\`
          : \`https://api.themoviedb.org/3/movie/\${m.id}?append_to_response=credits&language=en-US\`;
        const detailRes = await fetch(detailUrl, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
        });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          genres = detailData.genres ? detailData.genres.map((g: any) => g.name) : [];
          if (isTv) {
            director = detailData.created_by?.[0]?.name || detailData.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name || "Unknown";
          } else {
            director = detailData.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
          }
          cast = detailData.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
        }
      } catch (e) {
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
        posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
        backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
        year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
        voteAverage: m.vote_average,
        director,
        cast,
        genre: genres,
        isIframeEmbed: true,
        iframeSrc: isTv ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
      };
    }));
    
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
      ? \`https://api.themoviedb.org/3/tv/\${actualId}?append_to_response=credits,videos,similar&language=en-US\`
      : \`https://api.themoviedb.org/3/movie/\${actualId}?append_to_response=credits,videos,similar&language=en-US\`;
      
    const response = await fetch(url, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
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
        poster_path: s.poster_path ? \`https://image.tmdb.org/t/p/w500\${s.poster_path}\` : "",
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
      posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
      backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/original\${m.backdrop_path}\` : "",
      year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
      duration: isTv ? (m.episode_run_time?.[0] || 45) : (m.runtime || 120),
      director: director,
      cast: cast,
      genre: m.genres ? m.genres.map((g: any) => g.name) : (isTv ? ["TV Series"] : ["Movie"]),
      voteAverage: m.vote_average,
      isIframeEmbed: true,
      seasons: seasons,
      iframeSrc: isTv ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
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
        const tsCode = \`export const importedMoviesData = \${JSON.stringify(data, null, 2)};\\n\`;
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
    const url = \`https://api.themoviedb.org/3/tv/\${cleanId}/season/\${season_number}?language=en-US\`;
    const response = await fetch(url, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("TMDB fetch failed");
    const seasonData = await response.json();
    
    const episodes = seasonData.episodes.map((ep: any) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillUrl: ep.still_path ? \`https://image.tmdb.org/t/p/w500\${ep.still_path}\` : "",
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
`;
fs.writeFileSync('server.ts', content, 'utf-8');
console.log("Rewrote server.ts from scratch!");
