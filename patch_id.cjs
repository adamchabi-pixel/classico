const fs = require('fs');
let code = fs.readFileSync('src/data/imported_movies.ts', 'utf-8');
// Only replace the ID for Shadows in Paradise
code = code.replace(
  /"id": "3f786303c08f1b396d482558b930a45c",\s*"tmdbId": "3",/g,
  '"id": "shadows_in_paradise",\n    "tmdbId": "3",'
);
fs.writeFileSync('src/data/imported_movies.ts', code, 'utf-8');
console.log("Patched Shadows in Paradise ID");
