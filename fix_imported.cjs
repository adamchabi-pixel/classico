const fs = require('fs');

let imported = fs.readFileSync('src/data/imported_movies.ts', 'utf-8');
const gotStr = `
  {
    "hasLogo": true,
    "logoUrl": "https://image.tmdb.org/t/p/w500/6pObznbCoxVpY1lPQwJxETd7Phe.png",
    "id": "tt0944947-tv",
    "tmdbId": "1399",
    "imdbId": "tt0944947-tv",
    "title": "Game of Thrones",
    "originalTitle": "Game of Thrones",
    "description": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    "year": 2011,
    "releaseDate": "2011-04-17",
    "duration": "0 min",
    "voteAverage": 8.467,
    "rating": "8.5",
    "language": "en",
    "status": "Ended",
    "genre": [
      "Sci-Fi & Fantasy",
      "Drama",
      "Action & Adventure"
    ],
    "director": "David Benioff",
    "cast": [
      "Peter Dinklage",
      "Kit Harington",
      "Nikolaj Coster-Waldau"
    ],
    "isTv": true,
    "isIframeEmbed": true,
    "iframeSrc": ""
  },`;

imported = imported.replace(/export const importedMoviesData = \[/, 'export const importedMoviesData = [' + gotStr);
fs.writeFileSync('src/data/imported_movies.ts', imported, 'utf-8');
console.log("Added Game of Thrones to imported movies");
