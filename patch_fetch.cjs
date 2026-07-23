const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /fetch\(\`\/api\/movie\/\$\{movie\.id\}\`\)/,
  'fetch(`/api/movie/${movie.providerIds?.Tmdb ? (movie.isTv ? movie.providerIds.Tmdb + "-tv" : movie.providerIds.Tmdb) : movie.id}`)'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched fetch");
