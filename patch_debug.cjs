const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldAllMovies = `return Array.from(map.values());
  }, [mappedCollections, jellyfinMovies, tmdbCache]);`;

const newAllMovies = `const result = Array.from(map.values());
    const ids = result.map(m => m.id);
    const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
    if (duplicates.length > 0) console.log("DUPLICATES IN allMovies:", duplicates);
    return result;
  }, [mappedCollections, jellyfinMovies, tmdbCache]);`;

code = code.replace(oldAllMovies, newAllMovies);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched debug");
