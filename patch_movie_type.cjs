const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(
  'isJellyfin?: boolean;',
  'isJellyfin?: boolean;\n  customCategory?: string;\n  tmdbId?: string;\n  imdbId?: string;'
);

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log("Patched Movie type");
