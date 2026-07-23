const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const trendingRouteMultiPage = `
app.get("/api/trending", async (req, res) => {
  try {
    const pages = [1, 2, 3];
    const fetchPage = async (page) => {
      const url = \`https://api.themoviedb.org/3/trending/all/day?language=en-US&page=\${page}\`;
      const response = await fetch(url, {
        headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    };

    const resultsByPage = await Promise.all(pages.map(fetchPage));
    const combinedResults = resultsByPage.flat();
    const validResults = combinedResults.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
    
    const enrichedResults = await Promise.all(validResults.slice(0, 60).map(async (m: any) => {
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
          cast = detailData.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [];
        }
      } catch (e) {
        console.error("Error fetching details for", m.id, e);
      }
      
      const title = m.title || m.name || m.original_title || m.original_name;
      return {
        id: isTv ? \`\${m.id}-tv\` : String(m.id),
        tmdbId: String(m.id),
        isTv,
        title,
        originalTitle: m.original_title || m.original_name,
        description: m.overview || "",
        posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : null,
        backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : null,
        year: parseInt((m.release_date || m.first_air_date || "0").split("-")[0]) || 0,
        voteAverage: m.vote_average,
        director,
        cast,
        genre: genres,
        isIframeEmbed: true,
        iframeSrc: ""
      };
    }));
    
    res.json({ success: true, results: enrichedResults });
  } catch (error) {
    console.error("TMDB Trending API Error:", error);
    res.status(500).json({ success: false, error: "TMDB trending failed" });
  }
});
`;

code = code.replace(/app\.get\("\/api\/trending",[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: "TMDB trending failed" \}\);\n  \}\n\}\);/, trendingRouteMultiPage);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Updated trending route for multiple pages");
