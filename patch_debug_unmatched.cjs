const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldUnmatched = `return allMovies.filter(m => !inCollections.has(m.id));
  }, [allMovies, mappedCollections, jellyfinMovies]);`;

const newUnmatched = `const result = allMovies.filter(m => !inCollections.has(m.id));
    const ids = result.map(m => m.id);
    const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
    if (duplicates.length > 0) console.log("DUPLICATES IN unmatchedMovies:", duplicates);
    return result;
  }, [allMovies, mappedCollections, jellyfinMovies]);`;

code = code.replace(oldUnmatched, newUnmatched);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched debug unmatched");
