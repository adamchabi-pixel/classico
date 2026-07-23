const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

const regex = /const \[selectedSeason, setSelectedSeason\] = React\.useState\(movie\.seasons && movie\.seasons\.length > 0 \? movie\.seasons\[0\]\.season_number : 1\);/;

const replacement = `const [selectedSeason, setSelectedSeason] = React.useState(movie.seasons && movie.seasons.length > 0 ? movie.seasons[0].season_number : 1);
  React.useEffect(() => {
    if (movie.seasons && movie.seasons.length > 0 && !movie.seasons.find((s: any) => s.season_number === selectedSeason)) {
      setSelectedSeason(movie.seasons[0].season_number);
    }
  }, [movie.seasons]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView season selector.");
