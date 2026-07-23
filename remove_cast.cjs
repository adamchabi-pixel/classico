const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  /<button[\s\S]*?onClick=\{\(\) => \{\n\s*alert\("Pour partager l'écran[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Cast button removed");
