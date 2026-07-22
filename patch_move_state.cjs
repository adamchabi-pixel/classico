const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove collectionMods from where it is
code = code.replace(
  /const \[collectionMods, setCollectionMods\] = useState\(\{ deletedCollections: \[\], addedMovies: \{\}, removedMovies: \{\} \}\);\n/,
  ''
);

// Add it before mappedCollections
code = code.replace(
  /\/\/ Dynamically map movies into collections/,
  `const [collectionMods, setCollectionMods] = useState({ deletedCollections: [], addedMovies: {}, removedMovies: {} });\n\n  // Dynamically map movies into collections`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Moved collectionMods state");
