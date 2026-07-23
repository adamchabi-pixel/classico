const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove jellyfinMovies declaration
code = code.replace(/const jellyfinMovies: any\[\] = \[\];\n/g, '');

// Replace all usages with allMovies
code = code.replace(/jellyfinMovies/g, 'allMovies');

// Clean up isJellyfin from the mappedCollections
code = code.replace(/isJellyfin: true/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Replaced jellyfinMovies with allMovies");
