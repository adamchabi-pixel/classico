const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update URL
code = code.replace(
  /\?append_to_response=credits,images,similar&include_image_language=en,null&language=fr-FR`/g,
  `?append_to_response=credits,images,similar,videos&include_image_language=en,null&language=fr-FR\``
);

// Extract trailer
const trailerRegex = /const movieData = \{/;
const extractionCode = `
    let trailerUrl = null;
    if (m.videos && m.videos.results) {
      const trailer = m.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || m.videos.results.find((v: any) => v.site === "YouTube");
      if (trailer) {
        trailerUrl = \`https://www.youtube.com/embed/\${trailer.key}?autoplay=1\`;
      }
    }
    const movieData = {`;

code = code.replace(trailerRegex, extractionCode);

// Add trailerUrl to movieData
code = code.replace(
  /iframeSrc: isTv \? "" : \`https:\/\/player\.videasy\.net\/movie\/\$\{m\.id\}\?color=FFD700&overlay=true\`/g,
  `iframeSrc: isTv ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`,
      trailerUrl: trailerUrl`
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with videos");
