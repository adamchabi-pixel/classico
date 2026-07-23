const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

// Find the start of the component to insert allMoviesBase
let componentStartIdx = lines.findIndex(l => l.includes('export default function App() {'));
if (componentStartIdx !== -1) {
  lines.splice(componentStartIdx + 1, 0, '  const allMoviesBase = React.useMemo(() => [...allMoviesData, ...getGlobalImportedMovies()], []);');
}

// Replace allMovies with allMoviesBase from line 700 to 1200
for (let i = 700; i < 1200; i++) {
  if (lines[i]) {
    lines[i] = lines[i].replace(/allMovies/g, 'allMoviesBase');
  }
}

// Now find the line 1224 (allMovies.forEach inside allMovies useMemo)
for (let i = 1200; i < 1240; i++) {
  if (lines[i] && lines[i].includes('allMovies.forEach(m => {')) {
    lines[i] = lines[i].replace('allMovies.forEach', 'allMoviesBase.forEach');
  }
}

// Fix dependency array of allMovies useMemo
for (let i = 1235; i < 1255; i++) {
  if (lines[i] && lines[i].includes('}, [mappedCollections, allMovies, tmdbCache]);')) {
    lines[i] = lines[i].replace('allMovies', 'allMoviesBase');
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf-8');
console.log("Fixed allMoviesBase");
