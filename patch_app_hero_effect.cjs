const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `  // Load Jellyfin Hero whenever config status updates
  useEffect(() => {
    if (jellyfinConfig?.configured) {
      loadJellyfinHeroMovie();
    } else {
      setJellyfinHeroMovies([]);
    }
  }, [jellyfinConfig?.configured]);`;

code = code.replace(target, '// Load Jellyfin Hero effect removed');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched out Jellyfin Hero clearing effect");
