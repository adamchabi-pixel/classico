const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newApi = `app.get("/api/tv/:id/season/:season_number", async (req, res) => {
  try {
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    const { id, season_number } = req.params;
    const cleanId = id.replace("-tv", "");
    const url = \`https://api.themoviedb.org/3/tv/\${cleanId}/season/\${season_number}?language=fr-FR\`;
    const response = await fetch(url, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("TMDB fetch failed");
    const data = await response.json();
    
    const episodes = (data.episodes || []).map((ep: any) => ({
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillUrl: ep.still_path ? \`https://image.tmdb.org/t/p/w500\${ep.still_path}\` : "",
      runtime: ep.runtime
    }));
    
    res.json({ success: true, episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/search", async (req, res) => {`;

code = code.replace(/app\.get\("\/api\/search", async \(req, res\) => \{/, newApi);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with season API.");
