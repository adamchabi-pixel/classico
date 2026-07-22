const fs = require('fs');

const file = 'src/components/CinemaPlayerView.tsx';
let code = fs.readFileSync(file, 'utf-8');

const oldCode = `                if (!forceJellyfin && itemData.ProviderIds) {
                  if (itemData.ProviderIds.Tmdb) {
                    data.isIframeEmbed = true;
                    const srvs = [
                      { name: "Videasy (Premium)", url: \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}?color=FFD700&overlay=true\` },
                      { name: "Vidsrc (Backup)", url: \`https://vidsrc.to/embed/movie/\${itemData.ProviderIds.Tmdb}\` }
                    ];
                    setAvailableServers(srvs);
                    data.iframeSrc = srvs[activeServerIndex]?.url || srvs[0].url;
                  } else if (itemData.ProviderIds.Imdb) {
                    data.isIframeEmbed = true;
                    const srvs = [
                      { name: "Videasy (Premium)", url: \`https://player.videasy.net/movie/\${itemData.ProviderIds.Imdb}?color=FFD700&overlay=true\` },
                      { name: "Vidsrc (Backup)", url: \`https://vidsrc.to/embed/movie/\${itemData.ProviderIds.Imdb}\` }
                    ];
                    setAvailableServers(srvs);
                    data.iframeSrc = srvs[activeServerIndex]?.url || srvs[0].url;
                  }
                }`;

const newCode = `                if (!forceJellyfin && itemData.ProviderIds) {
                  if (itemData.ProviderIds.Tmdb) {
                    data.isIframeEmbed = true;
                    const srvs = [
                      { name: "Videasy (Premium)", url: \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}?color=FFD700&overlay=true\` }
                    ];
                    setAvailableServers(srvs);
                    data.iframeSrc = srvs[activeServerIndex]?.url || srvs[0].url;
                  }
                }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code, 'utf-8');
console.log("Patched Jellyfin Providers");
