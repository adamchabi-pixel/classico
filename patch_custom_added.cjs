const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'let customAdded = (mods.addedMovies[col.id] || []).map(id => jellyfinMovies.find(m => String(m.id) === String(id))).filter(Boolean);',
  'let customAdded = (mods.addedMovies[col.id] || []).map(id => jellyfinMovies.find(m => String(m.id) === String(id)) || tmdbCache.find(m => String(m.id) === String(id))).filter(Boolean);'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched custom added movies.");
