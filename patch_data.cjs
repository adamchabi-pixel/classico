const fs = require('fs');
let am = fs.readFileSync('src/data/all_movies.ts', 'utf8');
am = am.replace(/https:\/\/player\.videasy\.net\/[^"]+/g, 'https://player.videasy.net/tv/tt0944947?color=FF9900&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true');
fs.writeFileSync('src/data/all_movies.ts', am);

let im = fs.readFileSync('src/data/imported_movies.ts', 'utf8');
im = im.replace(/https:\/\/player\.videasy\.net\/movie\/([^?"]+)\?color=FFD700&overlay=true/g, 'https://player.videasy.net/movie/$1?color=FF9900&overlay=true');
fs.writeFileSync('src/data/imported_movies.ts', im);
