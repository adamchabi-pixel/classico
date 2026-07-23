const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/if \(targetMovieId && \(\!activeMovie \|\| \!activeMovie\.director\)\) \{/, `if (targetMovieId && (!activeMovie || !activeMovie.director || (activeMovie.isTv && !activeMovie.seasons))) {`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx fetch logic.");
