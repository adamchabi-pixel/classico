const fs = require('fs');

function updateFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/https:\/\/autoembed\.co\/movie\/(imdb|tmdb)\//g, 'https://vidsrc.sbs/embed/movie/');
    code = code.replace(/https:\/\/autoembed\.co\/movie\/\$\{/g, 'https://vidsrc.sbs/embed/movie/${');
    fs.writeFileSync(file, code);
}
updateFile('src/components/CinemaPlayerView.tsx');
updateFile('server.ts');
