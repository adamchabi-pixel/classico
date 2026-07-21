const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  /iframeSrc: `https:\/\/player\.videasy\.to\/movie\/\$\{actualTmdbId\}`/g,
  'iframeSrc: `https://player.videasy.net/movie/${actualTmdbId}?color=FFD700&overlay=true`'
);
code = code.replace(
  /streamUrl: `https:\/\/player\.videasy\.to\/movie\/\$\{actualTmdbId\}`/g,
  'streamUrl: `https://player.videasy.net/movie/${actualTmdbId}?color=FFD700&overlay=true`'
);
code = code.replace(
  /iframeSrc = `https:\/\/player\.videasy\.to\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}`/g,
  'iframeSrc = `https://player.videasy.net/movie/${itemData.ProviderIds.Tmdb}?color=FFD700&overlay=true`'
);
code = code.replace(
  /iframeSrc = `https:\/\/player\.videasy\.to\/movie\/\$\{itemData\.ProviderIds\.Imdb\}`/g,
  'iframeSrc = `https://player.videasy.net/movie/${itemData.ProviderIds.Imdb}?color=FFD700&overlay=true`'
);
code = code.replace(
  /iframeSrc = "https:\/\/player\.videasy\.to\/movie\/1368337"/g,
  'iframeSrc = "https://player.videasy.net/movie/1368337?color=FFD700&overlay=true"'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched iframe sources");
