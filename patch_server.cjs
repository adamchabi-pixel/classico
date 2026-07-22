const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'const { ids } = req.body;',
  'const { ids, categoryId, isHero } = req.body;'
);

const oldFiche = `        const newFiche = {
          hasLogo: !!logoObj,
          logoUrl: logoObj ? \`https://image.tmdb.org/t/p/w500\${logoObj.file_path}\` : null,
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? \`https://image.tmdb.org/t/p/w500\${movieData.poster_path}\` : "",
          backdropUrl: movieData.backdrop_path ? \`https://image.tmdb.org/t/p/original\${movieData.backdrop_path}\` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime ? \`\${movieData.runtime} min\` : "0 min",
          voteAverage: movieData.vote_average,
          rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
          language: movieData.original_language,
          status: movieData.status,
          genre: genres,
          director: director,
          cast: cast,
          isIframeEmbed: true,
          iframeSrc: imdbId ? \`https://player.videasy.net/movie/\${imdbId}?color=FFD700&overlay=true\` : \`https://player.videasy.net/movie/\${tmdbId}?color=FFD700&overlay=true\`
        };`;

const newFiche = `        const newFiche = {
          hasLogo: !!logoObj,
          logoUrl: logoObj ? \`https://image.tmdb.org/t/p/w500\${logoObj.file_path}\` : null,
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? \`https://image.tmdb.org/t/p/w500\${movieData.poster_path}\` : "",
          backdropUrl: movieData.backdrop_path ? \`https://image.tmdb.org/t/p/original\${movieData.backdrop_path}\` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime ? \`\${movieData.runtime} min\` : "0 min",
          voteAverage: movieData.vote_average,
          rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
          language: movieData.original_language,
          status: movieData.status,
          genre: genres,
          director: director,
          cast: cast,
          isIframeEmbed: true,
          customCategory: categoryId || "none",
          isHero: !!isHero,
          iframeSrc: imdbId ? \`https://player.videasy.net/movie/\${imdbId}?color=FFD700&overlay=true\` : \`https://player.videasy.net/movie/\${tmdbId}?color=FFD700&overlay=true\`
        };`;

code = code.replace(oldFiche, newFiche);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts");
