const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /if \(targetMovieId && \(!activeMovie \|\| !activeMovie\.director \|\| \(activeMovie\.isTv && !activeMovie\.seasons\)\)\) \{/,
  "if (targetMovieId && (!activeMovie || !activeMovie.director || activeMovie.tagline === undefined || (activeMovie.isTv && !activeMovie.seasons))) {"
);

// We should also do it for MovieModal (the quick view)
code = code.replace(
  /if \(movie && \(!movie\.director \|\| \(movie\.isTv && !movie\.seasons\)\)\) \{/,
  "if (movie && (!movie.director || movie.tagline === undefined || (movie.isTv && !movie.seasons))) {"
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx for tagline fetching.");
