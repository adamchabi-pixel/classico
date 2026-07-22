const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /return merged;\s*\}, \[searchQuery, allMovies, tmdbSearchResults\]\);/m;

const replacement = `
    const lowerQuery = searchQuery.toLowerCase().trim();
    merged.sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aExact = aTitle === lowerQuery;
      const bExact = bTitle === lowerQuery;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStarts = aTitle.startsWith(lowerQuery);
      const bStarts = bTitle.startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0; // preserve original order (tmdb is already popularity sorted)
    });

    return merged;
  }, [searchQuery, allMovies, tmdbSearchResults]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx search sorting.");
