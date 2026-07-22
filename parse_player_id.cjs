const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<CinemaPlayerView\s*movieId=\{pId\}\s*movieTitle=\{activeMovie\?\.title \|\| "Cult Classic"\}\s*movieDuration=\{activeMovie\?\.duration\}\s*moviePoster=\{activeMovie\?\.posterUrl \|\| \(activeMovie as any\)\?\.poster\}\s*movieBackdrop=\{activeMovie\?\.backdropUrl \|\| \(activeMovie as any\)\?\.backdrop\}\s*onClose=\{.*?\}\s*\/>/m;

const replacement = `{(() => {
          let actualId = pId;
          let season, episode;
          const tvMatch = pId.match(/^(.*-tv)-S(\\d+)E(\\d+)$/);
          if (tvMatch) {
            actualId = tvMatch[1];
            season = parseInt(tvMatch[2]);
            episode = parseInt(tvMatch[3]);
          }
          return (
            <CinemaPlayerView
              movieId={actualId}
              isTv={!!tvMatch}
              season={season}
              episode={episode}
              movieTitle={activeMovie?.title || "Cult Classic"}
              movieDuration={activeMovie?.duration}
              moviePoster={activeMovie?.posterUrl || (activeMovie as any)?.poster}
              movieBackdrop={activeMovie?.backdropUrl || (activeMovie as any)?.backdrop}
              onClose={() => navigateTo("/movie/" + actualId)}
            />
          );
        })()}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx to parse SxE format.");
