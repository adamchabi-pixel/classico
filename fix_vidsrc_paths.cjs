const fs = require('fs');

function updateFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    // Replace: https://vidsrc.sbs/embed/movie/${movieId.startsWith("tt") ? "imdb" : "tmdb"}/${movieId}
    // With: https://vidsrc.sbs/embed/movie/${movieId}
    code = code.replace(/https:\/\/vidsrc\.sbs\/embed\/movie\/\$\{movieId\.startsWith\("tt"\) \? "imdb" \: "tmdb"\}\/\$\{movieId\}/g, 
        'https://vidsrc.sbs/embed/movie/${movieId}');
        
    code = code.replace(/https:\/\/vidsrc\.sbs\/embed\/movie\/\$\{itemData\.ProviderIds\.(Imdb|Tmdb)\}/g, 
        'https://vidsrc.sbs/embed/movie/${itemData.ProviderIds.$1}');

    code = code.replace(/https:\/\/vidsrc\.sbs\/embed\/movie\/tt33764258/g, 
        'https://vidsrc.sbs/embed/movie/tt33764258');
        
    code = code.replace(/https:\/\/vidsrc\.sbs\/embed\/movie\/\$\{id\.startsWith\("tt"\) \? "imdb" \: "tmdb"\}\/\$\{id\}/g, 
        'https://vidsrc.sbs/embed/movie/${id}');

    code = code.replace(/https:\/\/vidsrc\.sbs\/embed\/movie\/\$\{id\}/g, 
        'https://vidsrc.sbs/embed/movie/${id}');

    fs.writeFileSync(file, code);
}
updateFile('src/components/CinemaPlayerView.tsx');
updateFile('server.ts');
