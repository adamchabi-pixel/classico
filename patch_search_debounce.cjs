const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /    setIsSearchingTmdb\(true\);\s*fetch\(\`\/api\/search\?query=\$\{encodeURIComponent\(searchQuery\)\}\`\)\s*\.then\(res => res\.json\(\)\)\s*\.then\(data => \{\s*if \(data\.success\) \{\s*setTmdbSearchResults\(data\.results\);\s*setTmdbCache\(prev => \{\s*const map = new Map\(prev\.map\(m => \[m\.id, m\]\)\);\s*data\.results\.forEach\(\(m: Movie\) => map\.set\(m\.id, m\)\);\s*const newCache = Array\.from\(map\.values\(\)\);\s*localStorage\.setItem\("classico_tmdb_cache", JSON\.stringify\(newCache\)\);\s*return newCache;\s*\}\);\s*\}\s*\}\)\s*\.finally\(\(\) => setIsSearchingTmdb\(false\)\);\s*\}, \[searchQuery\]\);/m;

const replacement = `    setIsSearchingTmdb(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(\`/api/search?query=\${encodeURIComponent(searchQuery)}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTmdbSearchResults(data.results);
            setTmdbCache(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              data.results.forEach((m: Movie) => map.set(m.id, m));
              const newCache = Array.from(map.values());
              localStorage.setItem("classico_tmdb_cache", JSON.stringify(newCache));
              return newCache;
            });
          }
        })
        .finally(() => setIsSearchingTmdb(false));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', code, 'utf-8');
  console.log("Patched search debounce successfully!");
} else {
  console.log("Regex not matched.");
}
