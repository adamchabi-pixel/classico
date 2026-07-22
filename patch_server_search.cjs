const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const searchRoute = `
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, results: [] });

    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    const searchUrl = \`https://api.themoviedb.org/3/search/movie?query=\${encodeURIComponent(query)}&language=en-US&page=1\`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    
    if (!searchRes.ok) throw new Error("TMDB search failed");
    const searchData = await searchRes.json();
    
    const results = searchData.results.map((m) => ({
      id: String(m.id),
      tmdbId: String(m.id),
      title: m.title,
      originalTitle: m.original_title,
      description: m.overview,
      posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
      backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
      year: m.release_date ? parseInt(m.release_date.substring(0, 4)) : new Date().getFullYear(),
      voteAverage: m.vote_average,
      isIframeEmbed: true,
      iframeSrc: \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
    }));

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
`;

code = code.replace('app.post("/api/admin/collections/modify"', searchRoute + '\napp.post("/api/admin/collections/modify"');
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with search");
