const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Change pb-4 sm:pb-6 to pb-12 sm:pb-16
code = code.replace(
  /pb-4 sm:pb-6/g,
  'pb-12 sm:pb-16'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched hero padding!");
