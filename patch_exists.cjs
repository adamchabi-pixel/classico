const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const existsLocal = merged\.some\(m => String\(m\.tmdbId\) === String\(tmdbMovie\.tmdbId\) \|\| String\(m\.id\) === String\(tmdbMovie\.id\) \|\| String\(m\.imdbId\) === String\(tmdbMovie\.tmdbId\) \|\| \(m\.providerIds && m\.providerIds\.Tmdb && String\(m\.providerIds\.Tmdb\) === String\(tmdbMovie\.tmdbId\)\)\);/, 
"const existsLocal = merged.some(m => String(m.tmdbId) === String(tmdbMovie.tmdbId) || String(m.id) === String(tmdbMovie.id) || String(m.imdbId) === String(tmdbMovie.tmdbId) || (m.providerIds && m.providerIds.Tmdb && String(m.providerIds.Tmdb) === String(tmdbMovie.tmdbId)) || (m.title && tmdbMovie.title && m.title.toLowerCase() === tmdbMovie.title.toLowerCase() && m.year === tmdbMovie.year));");

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched duplicate check");
