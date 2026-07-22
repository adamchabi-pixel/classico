const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ Filter out people, keep only movie and tv[\s\S]*?cast = detailData\.credits\?\.cast\?\.slice\(0, 3\)\.map\(\(c: any\) => c\.name\) \|\| \[\];/m;

const replacement = `// Filter out people, keep only movie and tv
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
          ? \`https://api.themoviedb.org/3/tv/\${m.id}?append_to_response=credits&language=fr-FR\`
          : \`https://api.themoviedb.org/3/movie/\${m.id}?append_to_response=credits&language=fr-FR\`;
        const detailRes = await fetch(detailUrl, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
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
          cast = detailData.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];`;

code = code.replace(regex, replacement);

const returnRegex = /id: String\(m\.id\) \+ \(isTv \? "-tv" : ""\),[\s\S]*?cast,[\s\S]*?isIframeEmbed: true,/m;
const returnReplacement = `id: String(m.id) + (isTv ? "-tv" : ""),
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
        genre: genres.length > 0 ? genres : (isTv ? ["TV Series"] : ["Movie"]),
        isIframeEmbed: true,`;

code = code.replace(returnRegex, returnReplacement);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts search logic.");
