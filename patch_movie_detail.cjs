const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /const \[fullMovie, setFullMovie\] = React\.useState<Movie>\(movie\);/,
  `const [fullMovie, setFullMovie] = React.useState<Movie>(movie);\n  console.log("MovieDetailView render", fullMovie.id, "hasLogo:", fullMovie.hasLogo, "castDetails:", fullMovie.castDetails?.length, "similar:", fullMovie.similar?.length);`
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView logs");
