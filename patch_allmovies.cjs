const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\/\/ Add TMDB cache movies[\s\S]*?return Array\.from\(map\.values\(\)\);/m;

const replacement = `// Add TMDB cache movies
    tmdbCache.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      } else {
        // Merge in missing details (like seasons)
        const existing = map.get(m.id)!;
        map.set(m.id, { ...existing, ...m });
      }
    });

    return Array.from(map.values());`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched allMovies logic.");
