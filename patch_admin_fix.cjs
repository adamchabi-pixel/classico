const fs = require('fs');

let code = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');
code = code.replace(
  /collectionId: modCollection.toLowerCase\(\).replace\(\/\\\\s\+\/g, '-'\)/g,
  'collectionId: modCollection'
);
fs.writeFileSync('src/components/AdminWishlist.tsx', code, 'utf-8');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(
  'let filteredCollections = finalCollections.filter(c => !mods.deletedCollections.includes(c.id) && !mods.deletedCollections.includes(c.title));',
  'let filteredCollections = finalCollections.filter(c => !mods.deletedCollections.some(d => d === c.id || d === c.title || d === c.title.toLowerCase().replace(/\\s+/g, "-")));'
);
fs.writeFileSync('src/App.tsx', appCode, 'utf-8');

console.log("Patched AdminWishlist and App.tsx");
