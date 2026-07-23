const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Find allMoviesBase definition
const target = `const allMoviesBase = React.useMemo(() => [...allMoviesData, ...importedMoviesData], []);`;
const replacement = `const allMoviesBase = React.useMemo(() => {
    const map = new Map();
    [...allMoviesData, ...importedMoviesData].forEach(m => map.set(m.id, m));
    tmdbCache.forEach(m => {
      if (!map.has(m.id)) map.set(m.id, m);
    });
    return Array.from(map.values());
  }, [tmdbCache]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed allMoviesBase to include tmdbCache");
