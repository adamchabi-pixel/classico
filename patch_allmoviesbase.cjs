const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/  const allMoviesBase = React\.useMemo\(\(\) => \{\n    const map = new Map\(\);\n    \[\.\.\.allMoviesData, \.\.\.importedMoviesData\]\.forEach\(m => map\.set\(m\.id, m\)\);\n    tmdbCache\.forEach\(m => \{\n      if \(\!map\.has\(m\.id\)\) map\.set\(m\.id, m\);\n    \}\);\n    return Array\.from\(map\.values\(\)\);\n  \}, \[tmdbCache\]\);/,
"  const allMoviesBase = React.useMemo(() => {\n    const map = new Map();\n    [...allMoviesData, ...importedMoviesData].forEach(m => map.set(m.id, m));\n    return Array.from(map.values());\n  }, []);");

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched allMoviesBase");
