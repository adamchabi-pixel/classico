const fs = require('fs');

function updateFile(file) {
    let code = fs.readFileSync(file, 'utf8');

    // Replace vidsrc.me with autoembed.co
    // We need to differentiate imdb and tmdb
    // In server.ts:
    // iframeSrc: imdbId ? `https://vidsrc.me/embed/movie/${imdbId}` : `https://vidsrc.me/embed/movie/${tmdbId}`
    // becomes:
    // iframeSrc: imdbId ? `https://autoembed.co/movie/imdb/${imdbId}` : `https://autoembed.co/movie/tmdb/${tmdbId}`
    
    // In CinemaPlayerView.tsx:
    // iframeSrc: `https://vidsrc.me/embed/movie/${movieId}`
    // becomes `https://autoembed.co/movie/${movieId.startsWith("tt") ? "imdb" : "tmdb"}/${movieId}`

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{movieId\}/g, 
        'https://autoembed.co/movie/${movieId.startsWith("tt") ? "imdb" : "tmdb"}/${movieId}');

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{itemData\.ProviderIds\.Imdb\}/g, 
        'https://autoembed.co/movie/imdb/${itemData.ProviderIds.Imdb}');

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{itemData\.ProviderIds\.Tmdb\}/g, 
        'https://autoembed.co/movie/tmdb/${itemData.ProviderIds.Tmdb}');

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/tt33764258/g, 
        'https://autoembed.co/movie/imdb/tt33764258');

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{imdbId\}/g, 
        'https://autoembed.co/movie/imdb/${imdbId}');

    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{tmdbId\}/g, 
        'https://autoembed.co/movie/tmdb/${tmdbId}');
        
    code = code.replace(/https:\/\/vidsrc\.me\/embed\/movie\/\$\{id\}/g, 
        'https://autoembed.co/movie/${id.startsWith("tt") ? "imdb" : "tmdb"}/${id}');

    fs.writeFileSync(file, code);
}

updateFile('src/components/CinemaPlayerView.tsx');
updateFile('server.ts');
