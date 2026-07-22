const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const result = jellyfinMovies\.filter\(m => \{\n\s*if \(inCollections\.has\(m\.id\)\) return false;[\s\S]*?return true;\n\s*\}\);\n\s*const ids = result\.map\(m => m\.id\);\n\s*const duplicates = ids\.filter\(\(item, index\) => ids\.indexOf\(item\) !== index\);\n\s*if \(duplicates\.length > 0\) console\.log\("DUPLICATES IN unmatchedMovies:", duplicates\);\n\s*return result;/g,
  `return jellyfinMovies.filter(m => {
      if (inCollections.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      if (t.includes("21 jump street") || t.includes("22 jump street") || t.includes("superbad") || t.includes("grown ups") || t.includes("white chicks")) return false;
      if (t.includes("memories of murder")) return false;
      return true;
    });`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Reverted unmatchedMovies debug");
