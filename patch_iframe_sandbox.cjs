const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(/allowFullScreen=\{true\}/g, `allowFullScreen={true}\n            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', file);
