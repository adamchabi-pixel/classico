const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldCode = `    return jellyfinMovies.filter(m => {
      if (inCollections.has(m.id)) return false;`;

const newCode = `    return allMovies.filter(m => {
      if (inCollections.has(m.id)) return false;`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched unmatchedMovies to use allMovies");
