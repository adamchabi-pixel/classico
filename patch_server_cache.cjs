const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `// 4. List library movies from connected Jellyfin with persistent file and memory cache (SWR model)
let cachedMergedMovies = null;
let lastImportedMtime = 0;

app.get("/api/jellyfin/movies", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=3600");
  res.setHeader("Vary", "Accept-Encoding");
  
  try {
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let currentMtime = 0;
    if (fs.existsSync(DB_PATH)) {
      currentMtime = fs.statSync(DB_PATH).mtimeMs;
    }
    
    if (!cachedMergedMovies || currentMtime > lastImportedMtime) {
      let mergedMovies = [...allMoviesData];
      if (currentMtime > 0) {
        const imported = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        mergedMovies = [...imported, ...mergedMovies];
      }
      
      const map = new Map();
      for (const m of mergedMovies) {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        }
      }
      cachedMergedMovies = Array.from(map.values());
      lastImportedMtime = currentMtime;
    }
    
    res.json({ success: true, movies: cachedMergedMovies });
  } catch(e) {
    console.error("Error generating movies:", e);
    res.json({ success: true, movies: allMoviesData });
  }
});`;

code = code.replace(/app\.get\("\/api\/jellyfin\/movies", \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, movies: mergedMovies \}\);\n\}\);/, newEndpoint);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server API caching");
