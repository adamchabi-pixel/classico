const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<MovieModal\s*movie=\{selectedMovie\}\s*onPlay=\{\(id\) => navigateTo\("\/player\/" \+ id\)\}/,
  `<MovieModal
        movie={selectedMovie}
        onPlay={(id) => navigateTo("/player/" + id)}
        onSimilarClick={(id) => { setSelectedMovie(null); navigateTo("/movie/" + id); }}`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx with onSimilarClick");
