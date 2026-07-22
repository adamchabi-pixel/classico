const fs = require('fs');

const file = 'src/components/AdminWishlist.tsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  'if (!tmdbId.trim()) return;',
  'if (!tmdbId.trim()) return;\n    if (tmdbId.trim().toLowerCase().startsWith("tt")) {\n      alert("Veuillez utiliser un ID TMDb uniquement (les IDs IMDb commençant par \\"tt\\" ne sont plus supportés).");\n      return;\n    }'
);

fs.writeFileSync(file, code, 'utf-8');
console.log("Patched AdminWishlist 3");
