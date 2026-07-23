const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /React\.useEffect\(\(\) => \{(\s+)fetch/g,
  'React.useEffect(() => {$1console.log("Fetching TMDB data for movie ID:", movie.id, "TMDB ID:", movie.tmdbId, "ProviderIds:", movie.providerIds);$1fetch'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched movie detail 2");
