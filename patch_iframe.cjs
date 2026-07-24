const fs = require('fs');

function replaceFile(path) {
    if (!fs.existsSync(path)) return;
    let code = fs.readFileSync(path, 'utf-8');
    
    // Replace videasy with 111movies
    code = code.replace(/https:\/\/player\.videasy\.net\/tv\/\$\{cleanId\}\/\$\{season\}\/\$\{episode\}\?color=FFD700&overlay=true/g, "https://111movies.net/tv/${cleanId}/${season}/${episode}");
    code = code.replace(/https:\/\/player\.videasy\.net\/movie\/\$\{cleanId\}\?color=FFD700&overlay=true/g, "https://111movies.net/movie/${cleanId}");
    code = code.replace(/https:\/\/player\.videasy\.net\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}\?color=FFD700&overlay=true/g, "https://111movies.net/movie/${itemData.ProviderIds.Tmdb}");
    code = code.replace(/https:\/\/player\.videasy\.net\/movie\/1368337\?color=FFD700&overlay=true/g, "https://111movies.net/movie/1368337");
    
    code = code.replace(/https:\/\/player\.videasy\.net\/movie\/\$\{m\.id\}\?color=FFD700&overlay=true/g, "https://111movies.net/movie/${m.id}");

    fs.writeFileSync(path, code, 'utf-8');
    console.log("Patched", path);
}

replaceFile('src/components/CinemaPlayerView.tsx');
replaceFile('server.ts');
replaceFile('src/main.tsx');
