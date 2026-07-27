const fs = require('fs');
let libraryTs = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const newFetch = `
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let params = new URLSearchParams();
        if (type) params.append('type', type);
        if (page) params.append('page', String(page));
        if (activePlatform !== null) params.append('activePlatform', String(activePlatform));
        if (activeGenre !== null) params.append('activeGenre', String(activeGenre));
        if (activeLanguage !== null) params.append('activeLanguage', String(activeLanguage));
        if (activeYear !== null) params.append('activeYear', String(activeYear));
        
        const res = await fetch(\`/api/discover?\${params.toString()}\`);
        if (res.ok) {
           const json = await res.json();
           if (json.success && json.data && json.data.results) {
               const mapped = json.data.results.filter((r: any) => !r.adult).map((r: any) => {
                   return {
                       id: String(r.id),
                       tmdbId: String(r.id),
                       title: r.title || r.name,
                       originalTitle: r.original_title || r.original_name,
                       description: r.overview,
                       posterUrl: r.poster_path ? \`https://image.tmdb.org/t/p/w500\${r.poster_path}\` : "",
                       backdropUrl: r.backdrop_path ? \`https://image.tmdb.org/t/p/original\${r.backdrop_path}\` : "",
                       year: r.release_date ? parseInt(r.release_date.split("-")[0]) : (r.first_air_date ? parseInt(r.first_air_date.split("-")[0]) : 0),
                       releaseDate: r.release_date || r.first_air_date,
                       voteAverage: r.vote_average,
                       rating: r.vote_average ? r.vote_average.toFixed(1) : "?",
                       language: r.original_language,
                       isTv: type === "tv",
                       duration: "Unknown",
                       director: "Unknown",
                       cast: [],
                       genre: []
                   };
               });
               setMovies(prev => page === 1 ? mapped : [...prev, ...mapped]);
               setHasMore(json.data.page < json.data.total_pages);
           }
        }
      } catch (err) {
        console.error("Error fetching library:", err);
      } finally {
        setLoading(false);
      }
    };
`;

libraryTs = libraryTs.replace(/const fetchMovies = async \(\) => \{[\s\S]*?setLoading\(false\);\s*\}\s*\};\s*\};/m, newFetch.trim());

fs.writeFileSync('src/components/LibraryView.tsx', libraryTs);
