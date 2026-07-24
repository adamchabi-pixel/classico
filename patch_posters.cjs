const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(/https:\/\/image\.tmdb\.org\/t\/p\/w500\/wsFqXqL6P5ZpX2n56hN0nOaVf8U\.jpg/g, "https://image.tmdb.org/t/p/w500/aKNFzaqQgPzsGXnsMc4kJH5hFIV.jpg");
code = code.replace(/https:\/\/image\.tmdb\.org\/t\/p\/w500\/xY3qXyX1y3jK7lW9p8aC5hT0sY2\.jpg/g, "https://image.tmdb.org/t/p/w500/f9HsemSsBEHN5eoMble1bj6fDxs.jpg");

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log("Patched 007 posters");
