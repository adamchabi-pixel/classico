const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `        if (!data) {
          const needsTranscodeParam = forceTranscode || playbackAttempts > 0 || isLowQuality;`;

const replacement = `        if (!data) {
          const isNumeric = /^\\d+$/.test(movieId);
          if (movieId.startsWith("tt") || isNumeric) {
            const iframeResult = {
              id: movieId,
              streamUrl: \`https://vidsrc.sbs/embed/movie/\${movieId}\`,
              duration: 0,
              container: "iframe",
              title: "Film (Embed)",
              isDirect: true,
              isIframeEmbed: true,
              iframeSrc: \`https://vidsrc.sbs/embed/movie/\${movieId}\`,
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            return;
          }

          const needsTranscodeParam = forceTranscode || playbackAttempts > 0 || isLowQuality;`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
