const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Import allMoviesData at the top
if (!code.includes('import { allMoviesData }')) {
  code = code.replace(
    'import React, { useState, useEffect, useRef, useCallback } from "react";',
    'import React, { useState, useEffect, useRef, useCallback } from "react";\nimport { allMoviesData } from "../data/all_movies";'
  );
}

// Modify the check around line 750
const target = `const isNumeric = /^\\d+$/.test(movieId);
          if (!forceJellyfin && (movieId.startsWith("tt") || isNumeric)) {`;

const replacement = `const isNumeric = /^\\d+$/.test(movieId);
          
          // Look up the movie in allMoviesData to get its tmdbId or imdbId
          let actualTmdbId = movieId;
          const matchedMovie = allMoviesData.find(m => m.id === movieId);
          if (matchedMovie) {
            actualTmdbId = matchedMovie.tmdbId || matchedMovie.imdbId || (matchedMovie.providerIds?.Tmdb) || (matchedMovie.providerIds?.Imdb) || movieId;
          }
          
          if (!forceJellyfin) {
            // ALWAYS use videasy now, even for jellyfin uuids, by using the looked up tmdbId
            const iframeResult = {
              id: movieId,
              streamUrl: \`https://player.videasy.net/movie/\${actualTmdbId}?color=FFD700&overlay=true\`,
              duration: 0,
              container: "iframe",
              title: "Film (Embed)",
              isDirect: true,
              isIframeEmbed: true,
              iframeSrc: \`https://player.videasy.net/movie/\${actualTmdbId}?color=FFD700&overlay=true\`,
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            return;
          }
          
          if (!forceJellyfin && (movieId.startsWith("tt") || isNumeric)) {`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched CinemaPlayerView to ALWAYS use Videasy via allMoviesData lookup");
