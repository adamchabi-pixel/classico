const fs = require('fs');

let movieCard = fs.readFileSync('src/components/MovieCard.tsx', 'utf-8');
movieCard = movieCard.replace(
  /className="w-full h-full object-cover"/g,
  'className="w-full h-full object-cover"\n              loading="lazy"\n              decoding="async"'
);
fs.writeFileSync('src/components/MovieCard.tsx', movieCard, 'utf-8');

console.log("Restored lazy loading");
