const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Add props
code = code.replace(/interface CinemaPlayerViewProps \{/, `interface CinemaPlayerViewProps {
  isTv?: boolean;
  season?: number;
  episode?: number;`);
code = code.replace(/export default function CinemaPlayerView\(\{/, `export default function CinemaPlayerView({
  isTv,
  season,
  episode,`);

// Modify iframe building
code = code.replace(/const newServers = \[\s*\{\s*name: "Videasy \(Premium\)", url: \`https:\/\/player\.videasy\.net\/movie\/\$\{finalTmdbId\}\?color=FFD700&overlay=true\`\s*\}\s*\];/m, `
            let iframeUrl = "";
            let cleanId = finalTmdbId;
            if (cleanId.endsWith('-tv')) cleanId = cleanId.replace('-tv', '');
            if (isTv && season && episode) {
              iframeUrl = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}?color=FFD700&overlay=true\`;
            } else {
              iframeUrl = \`https://player.videasy.net/movie/\${cleanId}?color=FFD700&overlay=true\`;
            }
            const newServers = [
              { name: "Videasy (Premium)", url: iframeUrl }
            ];`);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched CinemaPlayerView.");
