const fs = require('fs');
let code = fs.readFileSync('src/data/imported_movies.ts', 'utf-8');

const replacement = `"id": "83219aef79eeec58a306aac526257953",
    "tmdbId": "12153",
    "imdbId": "tt0381707",
    "isTv": false,
    "tagline": "They're going deep undercover.",
    "title": "White Chicks",
    "originalTitle": "White Chicks",
    "originalLanguage": "en",
    "description": "Two black FBI agents, Marcus and Kevin Copeland, are assigned to protect two socialite heiresses, the Vandergeld sisters, from a kidnapping plot. When the sisters suffer minor facial injuries, they refuse to attend a high-profile weekend in the Hamptons. To save their jobs, the agents decide to go undercover, disguised as the white sisters themselves.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/vXvU2wB5T7u2i6E5F8M4b0u4Q5Q.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w780/kH10E6R20V3rR8W3Jj6lR8k5o3Y.jpg",
    "year": 2004,
    "duration": 109,
    "director": "Keenen Ivory Wayans",
    "cast": [
      "Shawn Wayans",
      "Marlon Wayans",
      "Jaime King",
      "Frankie Faison"
    ],
    "similar": [],
    "genre": [
      "Comedy",
      "Crime"
    ],
    "voteAverage": 6.3,
    "isIframeEmbed": true,
    "seasons": [],
    "iframeSrc": "https://111movies.net/movie/12153"`;

code = code.replace(
  /"id": "83219aef79eeec58a306aac526257953",\s*"tmdbId": "83219",[\s\S]*?"title": "When Nature Calls",[\s\S]*?"iframeSrc": "https:\/\/111movies\.net\/movie\/83219"/,
  replacement
);

fs.writeFileSync('src/data/imported_movies.ts', code, 'utf-8');
console.log("Patched White Chicks");
