const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /fetch\(\`\/api\/movie\/\$\{targetMovieId\}\`\)/,
  `fetch(\`/api/movie/\${activeMovie?.providerIds?.Tmdb ? (activeMovie.isTv ? activeMovie.providerIds.Tmdb + "-tv" : activeMovie.providerIds.Tmdb) : targetMovieId}\`)`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx fetch logic");
