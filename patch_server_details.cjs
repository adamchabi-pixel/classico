const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    // Determine if it's IMDB or TMDB ID
    let tmdbId = id;
    if (id.startsWith('tt')) {
      const findUrl = \`https://api.themoviedb.org/3/find/\${id}?external_source=imdb_id\`;
      const findRes = await fetch(findUrl, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
      if (findRes.ok) {
        const findData = await findRes.json();
        if (findData.movie_results && findData.movie_results.length > 0) {
          tmdbId = String(findData.movie_results[0].id);
        }
      }
    }
    
    const movieUrl = \`https://api.themoviedb.org/3/movie/\${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US\`;
    const movieRes = await fetch(movieUrl, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
    
    if (!movieRes.ok) throw new Error("TMDB details failed");
    const m = await movieRes.json();
    
    const director = m.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
    const cast = m.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
    let logoUrl = "";
    if (m.images?.logos && m.images.logos.length > 0) {
      const bestLogo = m.images.logos.find((l: any) => l.iso_639_1 === "en") || m.images.logos[0];
      logoUrl = \`https://image.tmdb.org/t/p/w500\${bestLogo.file_path}\`;
    }
    
    const movieData = {
      hasLogo: !!logoUrl,
      logoUrl: logoUrl,
      id: String(m.id),
      tmdbId: String(m.id),
      imdbId: m.imdb_id || String(m.id),
      title: m.title,
      originalTitle: m.original_title,
      description: m.overview,
      posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
      backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/original\${m.backdrop_path}\` : "",
      year: m.release_date ? parseInt(m.release_date.substring(0, 4)) : new Date().getFullYear(),
      duration: m.runtime || 120,
      director: director,
      cast: cast,
      genre: m.genres ? m.genres.map((g: any) => g.name) : ["Movie"],
      voteAverage: m.vote_average,
      isIframeEmbed: true,
      iframeSrc: \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
    };
    
    res.json({ success: true, movie: movieData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
`;

code = code.replace('app.get("/api/search", async (req, res) => {', newEndpoint + '\\n\\napp.get("/api/search", async (req, res) => {');
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server details");
