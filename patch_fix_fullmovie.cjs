const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /const \[selectedSeason, setSelectedSeason\] = React\.useState\(fullMovie\.seasons/,
  `const [fullMovie, setFullMovie] = React.useState<Movie>(movie);
  const [selectedSeason, setSelectedSeason] = React.useState(fullMovie.seasons`
);

// We should also ensure the `useEffect` fetching the movie data is there.
// If it's missing, let's add it.
if (!code.includes('fetch(`/api/movie/${movie.id}`)')) {
  code = code.replace(
    /const \[isSeasonDropdownOpen, setIsSeasonDropdownOpen\] = React\.useState\(false\);/,
    `const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = React.useState(false);
    
  React.useEffect(() => {
    fetch(\`/api/movie/\${movie.id}\`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.movie) {
          setFullMovie(prev => ({...prev, ...data.movie}));
        }
      })
      .catch(console.error);
  }, [movie.id]);`
  );
}

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched fullMovie");
