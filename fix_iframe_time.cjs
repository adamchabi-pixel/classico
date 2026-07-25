const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `            let iframeUrl111 = "";
            let iframeUrlPeach = "";
            let iframeUrlVideasy = "";
            let cleanId = finalTmdbId;
            if (cleanId.endsWith('-tv')) cleanId = cleanId.replace('-tv', '');
            if (isTv && season && episode) {
              iframeUrl111 = \`https://111movies.net/tv/\${cleanId}/\${season}/\${episode}\`;
              iframeUrlPeach = \`https://peachify.pro/embed/tv/\${cleanId}/\${season}/\${episode}\`;
              iframeUrlVideasy = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}\`;
            } else {
              iframeUrl111 = \`https://111movies.net/movie/\${cleanId}\`;
              iframeUrlPeach = \`https://peachify.pro/embed/movie/\${cleanId}\`;
              iframeUrlVideasy = \`https://player.videasy.net/movie/\${cleanId}\`;
            }`;

const replacement1 = `            let iframeUrl111 = "";
            let iframeUrlPeach = "";
            let iframeUrlVideasy = "";
            let cleanId = finalTmdbId;
            if (cleanId.endsWith('-tv')) cleanId = cleanId.replace('-tv', '');
            const timeParam = savedRestoreTimeRef.current > 0 ? \`?t=\${Math.floor(savedRestoreTimeRef.current)}\` : "";
            
            if (isTv && season && episode) {
              iframeUrl111 = \`https://111movies.net/tv/\${cleanId}/\${season}/\${episode}\${timeParam}\`;
              iframeUrlPeach = \`https://peachify.pro/embed/tv/\${cleanId}/\${season}/\${episode}\${timeParam}\`;
              iframeUrlVideasy = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}\${timeParam}\`;
            } else {
              iframeUrl111 = \`https://111movies.net/movie/\${cleanId}\${timeParam}\`;
              iframeUrlPeach = \`https://peachify.pro/embed/movie/\${cleanId}\${timeParam}\`;
              iframeUrlVideasy = \`https://player.videasy.net/movie/\${cleanId}\${timeParam}\`;
            }`;

content = content.replace(target1, replacement1);

const target2 = `                    let u1 = "", u2 = "", u3 = "";
                    if (itemData.Type === "Episode" && itemData.ParentIndexNumber && itemData.IndexNumber) {
                        u1 = \`https://peachify.pro/embed/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\`;
                        u2 = \`https://111movies.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\`;
                        u3 = \`https://player.videasy.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\`;
                    } else {
                        u1 = \`https://peachify.pro/embed/movie/\${itemData.ProviderIds.Tmdb}\`;
                        u2 = \`https://111movies.net/movie/\${itemData.ProviderIds.Tmdb}\`;
                        u3 = \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}\`;
                    }`;

const replacement2 = `                    let u1 = "", u2 = "", u3 = "";
                    const timeParam = savedRestoreTimeRef.current > 0 ? \`?t=\${Math.floor(savedRestoreTimeRef.current)}\` : "";
                    if (itemData.Type === "Episode" && itemData.ParentIndexNumber && itemData.IndexNumber) {
                        u1 = \`https://peachify.pro/embed/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\${timeParam}\`;
                        u2 = \`https://111movies.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\${timeParam}\`;
                        u3 = \`https://player.videasy.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}\${timeParam}\`;
                    } else {
                        u1 = \`https://peachify.pro/embed/movie/\${itemData.ProviderIds.Tmdb}\${timeParam}\`;
                        u2 = \`https://111movies.net/movie/\${itemData.ProviderIds.Tmdb}\${timeParam}\`;
                        u3 = \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}\${timeParam}\`;
                    }`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);

console.log('done iframe time');
