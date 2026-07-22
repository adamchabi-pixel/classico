const fs = require('fs');

const file = 'src/components/CinemaPlayerView.tsx';
let code = fs.readFileSync(file, 'utf-8');

// Replace the actualTmdbId extraction
code = code.replace(
  'actualTmdbId = matchedMovie.tmdbId || matchedMovie.imdbId || (matchedMovie.providerIds?.Tmdb) || (matchedMovie.providerIds?.Imdb) || movieId;',
  'actualTmdbId = matchedMovie.tmdbId || (matchedMovie.providerIds?.Tmdb) || movieId;'
);

code = code.replace(
  `            const newServers = [
              { name: "Videasy (Premium)", url: \`https://player.videasy.net/movie/\${actualTmdbId}?color=FFD700&overlay=true\` },
              { name: "Vidsrc (Backup)", url: \`https://vidsrc.to/embed/movie/\${actualTmdbId}\` }
            ];`,
  `            let finalTmdbId = actualTmdbId;
            if (finalTmdbId.startsWith('tt') && matchedMovie?.tmdbId) {
                finalTmdbId = matchedMovie.tmdbId;
            }
            const newServers = [
              { name: "Videasy (Premium)", url: \`https://player.videasy.net/movie/\${finalTmdbId}?color=FFD700&overlay=true\` }
            ];`
);

fs.writeFileSync(file, code, 'utf-8');
console.log("Patched CinemaPlayerView servers");
