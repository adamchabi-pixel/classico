const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(/id: "bond-goldfinger",\s*title: "Goldfinger",\s*year: 1964,/g, 
'id: "bond-goldfinger",\n        title: "Goldfinger",\n        tmdbId: "10611",\n        posterUrl: "https://image.tmdb.org/t/p/w500/wsFqXqL6P5ZpX2n56hN0nOaVf8U.jpg",\n        year: 1964,');

code = code.replace(/id: "bond-dr-no",\s*title: "James Bond contre Dr No",\s*year: 1962,/g, 
'id: "bond-dr-no",\n        title: "James Bond contre Dr No",\n        tmdbId: "646",\n        posterUrl: "https://image.tmdb.org/t/p/w500/xY3qXyX1y3jK7lW9p8aC5hT0sY2.jpg",\n        year: 1962,');

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log("Patched data.ts posters");
