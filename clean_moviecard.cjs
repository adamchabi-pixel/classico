const fs = require('fs');
let code = fs.readFileSync('src/components/MovieCard.tsx', 'utf-8');
code = code.replace(/referrerPolicy="no-referrer"\s*decoding="async"\s*referrerPolicy="no-referrer"/g, 'decoding="async" referrerPolicy="no-referrer"');
fs.writeFileSync('src/components/MovieCard.tsx', code, 'utf-8');
