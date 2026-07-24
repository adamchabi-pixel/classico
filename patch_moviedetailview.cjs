const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(/const \[fullMovie, setFullMovie\] = React\.useState<Movie>\(movie\);/,
`const [fullMovie, setFullMovie] = React.useState<Movie>(movie);
  React.useEffect(() => {
    setFullMovie(movie);
  }, [movie]);`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView");
