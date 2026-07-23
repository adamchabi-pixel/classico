const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const trendingCode = `
  useEffect(() => {
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.results) {
          setTmdbCache(prev => {
            const map = new Map(prev.map(m => [m.id, m]));
            data.results.forEach((m) => map.set(m.id, m));
            const newCache = Array.from(map.values());
            localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
            return newCache;
          });
        }
      })
      .catch(e => console.error("Trending error:", e));
  }, []);
`;

if (!code.includes('/api/trending')) {
  // insert after useEffect for initial load
  const target = `const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);`;
  code = code.replace(target, target + '\n' + trendingCode);
  fs.writeFileSync('src/App.tsx', code, 'utf-8');
}
console.log("Added fetch trending");
