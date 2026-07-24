const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

// Find the index of "return (" which starts the render
const returnIdx = code.indexOf('return (');
if (returnIdx !== -1) {
  let before = code.slice(0, returnIdx);
  let after = code.slice(returnIdx);
  
  // Replace all instances of `movie.` with `displayMovie.` in the return block,
  // except for things that might need to remain unchanged (none seem problematic).
  // Wait, `movie.` could be `movie.id`, `movie.backdropUrl`, `movie.title`, etc.
  after = after.replace(/movie\./g, 'displayMovie.');
  
  // Re-assemble
  code = before + after;
  fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
  console.log("Patched JSX in MovieModal.tsx");
} else {
  console.log("Could not find 'return ('");
}
