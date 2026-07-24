const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

const additionalState = `
  const [fullMovie, setFullMovie] = useState<Movie | null>(null);

  useEffect(() => {
    setFullMovie(movie);
    if (!movie) return;
    const movieIdToFetch = movie.providerIds?.Tmdb ? (movie.isTv ? movie.providerIds.Tmdb + "-tv" : movie.providerIds.Tmdb) : (movie.tmdbId ? (movie.isTv ? movie.tmdbId + "-tv" : movie.tmdbId) : movie.id);
    if (movieIdToFetch) {
      fetch(\`/api/movie/\${movieIdToFetch}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.movie) {
            setFullMovie(prev => prev ? {...prev, ...data.movie} : data.movie);
          }
        })
        .catch(console.error);
    }
  }, [movie]);

  const displayMovie = fullMovie || movie;
`;

code = code.replace(
  /const \[isPlaying, setIsPlaying\] = useState\(false\);/,
  `const [isPlaying, setIsPlaying] = useState(false);${additionalState}`
);

fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched state in MovieModal.tsx");
