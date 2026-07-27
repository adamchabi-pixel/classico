const fs = require('fs');
let content = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

// Replace timeParam to start with & instead of ?
content = content.replace(/const timeParam = savedRestoreTimeRef\.current > 0 \? \`\?t=\\$\\{Math\.floor\(savedRestoreTimeRef\.current\)\\}\` : "";/g, 'const timeParam = savedRestoreTimeRef.current > 0 ? `&t=${Math.floor(savedRestoreTimeRef.current)}` : "";');

// First block
content = content.replace(
/iframeUrlPeach = \`https:\/\/peachify\.pro\/embed\/tv\/\$\{cleanId\}\/\$\{season\}\/\$\{episode\}\$\{timeParam\}\`;\n\s*iframeUrlVideasy = \`https:\/\/player\.videasy\.net\/tv\/\$\{cleanId\}\/\$\{season\}\/\$\{episode\}\$\{timeParam\}\`;/g,
`iframeUrlPeach = \`https://peachify.pro/embed/tv/\${cleanId}/\${season}/\${episode}?accent=FF9900&servers=hide\${timeParam}\`;
              iframeUrlVideasy = \`https://player.videasy.net/tv/\${cleanId}/\${season}/\${episode}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;`
);

content = content.replace(
/iframeUrlPeach = \`https:\/\/peachify\.pro\/embed\/movie\/\$\{cleanId\}\$\{timeParam\}\`;\n\s*iframeUrlVideasy = \`https:\/\/player\.videasy\.net\/movie\/\$\{cleanId\}\$\{timeParam\}\`;/g,
`iframeUrlPeach = \`https://peachify.pro/embed/movie/\${cleanId}?accent=FF9900&servers=hide\${timeParam}\`;
              iframeUrlVideasy = \`https://player.videasy.net/movie/\${cleanId}?color=FF9900&overlay=true\${timeParam}\`;`
);

// Second block
content = content.replace(
/u1 = \`https:\/\/peachify\.pro\/embed\/tv\/\$\{itemData\.ProviderIds\.Tmdb\}\/\$\{itemData\.ParentIndexNumber\}\/\$\{itemData\.IndexNumber\}\$\{timeParam\}\`;\n\s*u2 = \`https:\/\/111movies\.net\/tv\/\$\{itemData\.ProviderIds\.Tmdb\}\/\$\{itemData\.ParentIndexNumber\}\/\$\{itemData\.IndexNumber\}\$\{timeParam\}\`;\n\s*u3 = \`https:\/\/player\.videasy\.net\/tv\/\$\{itemData\.ProviderIds\.Tmdb\}\/\$\{itemData\.ParentIndexNumber\}\/\$\{itemData\.IndexNumber\}\$\{timeParam\}\`;/g,
`u1 = \`https://peachify.pro/embed/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}?accent=FF9900&servers=hide\${timeParam}\`;
                        u2 = \`https://111movies.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}?dummy=1\${timeParam}\`; // Just in case, add ?dummy=1 for timeParam &t=
                        u3 = \`https://player.videasy.net/tv/\${itemData.ProviderIds.Tmdb}/\${itemData.ParentIndexNumber}/\${itemData.IndexNumber}?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true\${timeParam}\`;`
);

content = content.replace(
/u1 = \`https:\/\/peachify\.pro\/embed\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}\$\{timeParam\}\`;\n\s*u2 = \`https:\/\/111movies\.net\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}\$\{timeParam\}\`;\n\s*u3 = \`https:\/\/player\.videasy\.net\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}\$\{timeParam\}\`;/g,
`u1 = \`https://peachify.pro/embed/movie/\${itemData.ProviderIds.Tmdb}?accent=FF9900&servers=hide\${timeParam}\`;
                        u2 = \`https://111movies.net/movie/\${itemData.ProviderIds.Tmdb}?dummy=1\${timeParam}\`;
                        u3 = \`https://player.videasy.net/movie/\${itemData.ProviderIds.Tmdb}?color=FF9900&overlay=true\${timeParam}\`;`
);

// We need to also fix iframeUrl111 in the first block since timeParam is now &t=
content = content.replace(
/iframeUrl111 = \`https:\/\/111movies\.net\/tv\/\$\{cleanId\}\/\$\{season\}\/\$\{episode\}\$\{timeParam\}\`;/g,
`iframeUrl111 = \`https://111movies.net/tv/\${cleanId}/\${season}/\${episode}?dummy=1\${timeParam}\`;`
);
content = content.replace(
/iframeUrl111 = \`https:\/\/111movies\.net\/movie\/\$\{cleanId\}\$\{timeParam\}\`;/g,
`iframeUrl111 = \`https://111movies.net/movie/\${cleanId}?dummy=1\${timeParam}\`;`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', content);
