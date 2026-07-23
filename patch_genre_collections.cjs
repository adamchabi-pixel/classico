const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const finalCollections = \[\s*\.\.\.curatedSagaCollections,\s*\.\.\.dynamicFranchiseCollections,\s*\.\.\.dynamicDirectorCollections\s*\];/,
  `const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections,
      ...genreCollections
    ];`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched finalCollections");
