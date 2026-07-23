const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.get\("\/api\/movie\/:id", async \(req, res\) => \{[\s\S]*?\}\);/m;

const newImpl = `app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isTv = id.endsWith('-tv');
    const actualId = isTv ? id.replace('-tv', '') : id;
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    
    // Determine if it's IMDB or TMDB ID
    let tmdbId = actualId;
    if (actualId.startsWith('tt')) {
      const findUrl = \`https://api.themoviedb.org/3/find/\${actualId}?external_source=imdb_id\`;
      const findRes = await fetch(findUrl, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
      if (findRes.ok) {
        const findData = await findRes.json();
        if (findData.movie_results && findData.movie_results.length > 0) {
          tmdbId = String(findData.movie_results[0].id);
        } else if (findData.tv_results && findData.tv_results.length > 0) {
          tmdbId = String(findData.tv_results[0].id);
        }
      }
    }
    
    const url = isTv 
      ? \`https://api.themoviedb.org/3/tv/\${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=fr-FR\`
      : \`https://api.themoviedb.org/3/movie/\${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=fr-FR\`;
      
    const movieRes = await fetch(url, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
    
    if (!movieRes.ok) throw new Error("TMDB details failed");
    const m = await movieRes.json();
    
    let director = "Unknown";
    if (isTv) {
      director = m.created_by?.[0]?.name || m.credits?.crew?.find((c: any) => c.job === "Director" || c.job === "Executive Producer")?.name || "Unknown";
    } else {
      director = m.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
    }
    
    const cast = m.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
    let logoUrl = "";
    if (m.images?.logos && m.images.logos.length > 0) {
      const bestLogo = m.images.logos.find((l: any) => l.iso_639_1 === "en") || m.images.logos[0];
      logoUrl = \`https://image.tmdb.org/t/p/w500\${bestLogo.file_path}\`;
    }
    
    let seasons = [];
    if (isTv && m.seasons) {
      seasons = m.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        posterUrl: s.poster_path ? \`https://image.tmdb.org/t/p/w500\${s.poster_path}\` : "",
      }));
    }
    
    const releaseDate = isTv ? m.first_air_date : m.release_date;
    
    const movieData = {
      hasLogo: !!logoUrl,
      logoUrl: logoUrl,
      id: id, // Keep original requested id with -tv suffix
      tmdbId: String(m.id),
      imdbId: m.imdb_id || String(m.id),
      isTv,
      title: isTv ? m.name : m.title,
      originalTitle: isTv ? m.original_name : m.original_title,
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
    
    res.json({ success: true, movie: movieData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;

code = code.replace(regex, newImpl);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched movie API.");
