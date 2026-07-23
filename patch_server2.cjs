const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace trending map
code = code.replace(/const enrichedResults = await Promise\.all\(validResults\.slice\(0, 60\)\.map\(async \(m: any\) => \{[\s\S]*?\}\)\);/g, `const enrichedResults = validResults.slice(0, 60).map((m: any) => {
      const title = m.title || m.name || m.original_title || m.original_name;
      const isTv = m.media_type === "tv";
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
        director: "Unknown",
        cast: [],
        genre: [],
        isIframeEmbed: true,
        iframeSrc: ""
      };
    });`);

// Replace search map
code = code.replace(/const enrichedResults = await Promise\.all\(topResults\.map\(async \(m: any\) => \{[\s\S]*?\}\)\);/g, `const enrichedResults = topResults.map((m: any) => {
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
        posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
        backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
        year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
        voteAverage: m.vote_average,
        director: "Unknown",
        cast: [],
        genre: [],
        isIframeEmbed: true,
        iframeSrc: isTv ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
      };
    });`);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts maps");
