const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove searchedMovies calculation
const oldSearch = `  const searchedMovies = searchQuery.trim() === ""
    ? []
    : allMovies.filter(m => 
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
      );`;

const newSearch = `  const [tmdbSearchResults, setTmdbSearchResults] = useState<Movie[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTmdbSearchResults([]);
      return;
    }
    
    setIsSearchingTmdb(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(\`/api/search?query=\${encodeURIComponent(searchQuery)}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
          }
        })
        .finally(() => setIsSearchingTmdb(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchedMovies = React.useMemo(() => {
    if (searchQuery.trim() === "") return [];
    
    const localMatches = allMovies.filter(m => 
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    
    // Merge local and TMDB, avoiding duplicates by id
    const merged = [...localMatches];
    const localIds = new Set(localMatches.map(m => String(m.id)));
    
    tmdbSearchResults.forEach(tmdbMovie => {
      // Check if we already have this TMDB id in local (local might use imdbId as id, but tmdbMovie has tmdbId)
      // We check both id and tmdbId
      const existsLocal = merged.some(m => String(m.tmdbId) === String(tmdbMovie.tmdbId) || String(m.id) === String(tmdbMovie.id) || String(m.imdbId) === String(tmdbMovie.tmdbId));
      if (!existsLocal) {
        merged.push(tmdbMovie);
      }
    });
    
    return merged;
  }, [searchQuery, allMovies, tmdbSearchResults]);`;

code = code.replace(oldSearch, newSearch);

// 2. Remove Wishlist tab from activeTab state
code = code.replace(
  `const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player" | "wishlist">("accueil");`,
  `const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player">("accueil");`
);

// 3. Remove wishlist route logic
code = code.replace(
  `} else if (routePath === "/wishlist") {
      setActiveTab("wishlist");
      setSelectedCollectionId(null);
    `,
  ``
);

// 4. Remove wishlist from navigation (desktop)
code = code.replace(
  `{ id: "wishlist", label: "Wishlist", icon: BookmarkCheck },`,
  ``
);

// 5. Remove wishlist from navigation (mobile)
code = code.replace(
  `{ id: "wishlist", label: "Wishlist", icon: BookmarkCheck },`,
  ``
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx with search and removed wishlist routes");
