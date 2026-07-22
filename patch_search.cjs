const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const searchImpl = `app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, results: [] });
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    const searchUrl = \`https://api.themoviedb.org/3/search/movie?query=\${encodeURIComponent(query as string)}&language=en-US&page=1\`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
    });
    
    if (!searchRes.ok) throw new Error("TMDB search failed");
    const searchData = await searchRes.json();
    
    // Fetch details (including credits) for up to 10 results to get the director
    const topResults = searchData.results.slice(0, 12);
    const enrichedResults = await Promise.all(topResults.map(async (m: any) => {
      let director = "Unknown";
      let cast = [];
      try {
        const detailUrl = \`https://api.themoviedb.org/3/movie/\${m.id}?append_to_response=credits\`;
        const detailRes = await fetch(detailUrl, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
        });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          director = detailData.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
          cast = detailData.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
        }
      } catch (e) {
        console.warn("Failed to fetch details for search result", m.id);
      }
      
      return {
        id: String(m.id),
        tmdbId: String(m.id),
        title: m.title,
        originalTitle: m.original_title,
        description: m.overview,
        posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
        backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
        year: m.release_date ? parseInt(m.release_date.substring(0, 4)) : new Date().getFullYear(),
        voteAverage: m.vote_average,
        director,
        cast,
        isIframeEmbed: true,
        iframeSrc: \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
      };
    }));
    
    res.json({ success: true, results: enrichedResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;

const regex = /app\.get\("\/api\/search", async \(req, res\) => \{[\s\S]*?\}\);/m;
code = code.replace(regex, searchImpl);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched search API.");
