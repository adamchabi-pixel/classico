const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Replace movie with fullMovie in the rest of the component
// Since I already added `fullMovie` in the previous step, let's just make sure it's there.
// If it's there, we can redefine movie = fullMovie at the top of the render, but wait!
// In React, we can't redefine a prop variable easily without shadowing, which might be confusing.
// Better: const m = fullMovie; and replace movie. with m.

// Remove translate-y
code = code.replace(
  /translate-y-8 sm:translate-y-16/g,
  ''
);

// We want to replace 'movie.' with 'fullMovie.' 
// But only after the hooks.
// Let's replace 'movie.' with 'fullMovie.' globally, then fix the function signature.
code = code.replace(/movie\./g, 'fullMovie.');
code = code.replace(/movie:\s*fullMovie/g, 'movie: fullMovie');
// Fix the signature back:
code = code.replace(/fullMovie: Movie/g, 'movie: Movie');
// Fix the initial state
code = code.replace(/const \[fullMovie, setFullMovie\] = React\.useState<Movie>\(fullMovie\);/g, 'const [fullMovie, setFullMovie] = React.useState<Movie>(movie);');
code = code.replace(/fullMovie\.seasons && fullMovie\.seasons\.length > 0 \? fullMovie\.seasons\[0\]\.season_number : 1/g, 'movie.seasons && movie.seasons.length > 0 ? movie.seasons[0].season_number : 1');
code = code.replace(/fetch\(\`\/api\/movie\/\$\{fullMovie\.id\}\`\)/g, 'fetch(`/api/movie/${movie.id}`)');
code = code.replace(/movie\.seasons/g, 'fullMovie.seasons'); // wait, the above line fixed it for the initial state.
code = code.replace(/\[fullMovie\.id\]/g, '[movie.id]');

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched fullMovie");
