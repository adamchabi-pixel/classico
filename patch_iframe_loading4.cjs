const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

const target = `          if (!forceJellyfin && (movieId.startsWith("tt") || isNumeric)) {
            const iframeResult = {
              id: movieId,
              streamUrl: \`https://player.videasy.net/movie/\${movieId}?color=FFD700&overlay=true\`,
              duration: 0,
              container: "iframe",
              title: "Film (Embed)",
              isDirect: true,
              isIframeEmbed: true,
              iframeSrc: \`https://player.videasy.net/movie/\${movieId}?color=FFD700&overlay=true\`,
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            return;
          }`;

code = code.replace(target, '// Unreachable iframe fallback removed');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Cleaned up unreachable code");
