const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /h-\[60vh\] md:h-\[80vh\] min-h-\[500px\]/g,
  'h-[75vh] md:h-[85vh] min-h-[600px] sm:min-h-[700px]'
);

code = code.replace(
  /pb-12 sm:pb-16/g,
  'pb-16 sm:pb-24'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched height and padding!");
