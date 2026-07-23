const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/return filteredCollections\.map\(\(col\) => \{/g, `
    const ids = new Set();
    filteredCollections.forEach(c => {
      if (ids.has(c.id)) {
        console.warn("DUPLICATE ID FOUND IN FINAL COLLECTIONS:", c.id);
      }
      ids.add(c.id);
    });
    return filteredCollections.map((col) => {`);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
