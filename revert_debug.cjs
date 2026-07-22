const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const result = Array\.from\(map\.values\(\)\);\n\s*const ids = result\.map\(m => m\.id\);\n\s*const duplicates = ids\.filter\(\(item, index\) => ids\.indexOf\(item\) !== index\);\n\s*if \(duplicates\.length > 0\) console\.log\("DUPLICATES IN allMovies:", duplicates\);\n\s*return result;/g,
  'return Array.from(map.values());'
);

code = code.replace(
  /const result = allMovies\.filter\(m => !inCollections\.has\(m\.id\)\);\n\s*const ids = result\.map\(m => m\.id\);\n\s*const duplicates = ids\.filter\(\(item, index\) => ids\.indexOf\(item\) !== index\);\n\s*if \(duplicates\.length > 0\) console\.log\("DUPLICATES IN unmatchedMovies:", duplicates\);\n\s*return result;/g,
  'return allMovies.filter(m => !inCollections.has(m.id));'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Reverted debug");
