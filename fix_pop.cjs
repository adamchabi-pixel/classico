const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The popularity sort should just use m.tmdbId? Actually, in TMDB we can't sort without popularity data.
// But some movies have voteAverage.
// "sur library affiche des film connu ou en tendance, la taffiche du nimporte quoi"
// Let's filter out movies without a poster, and movies without a good rating if they are very old?
// Or we can just sort by year desc + voteAverage!

const sortTarget = `    // Sort
    return [...filtered].sort((a, b) => {
      if (librarySort === "popularity") {
        // Mock popularity via vote average & year
        const popA = (a.voteAverage || 0) * (a.year || 2000);
        const popB = (b.voteAverage || 0) * (b.year || 2000);
        return popB - popA;
      } else if (librarySort === "rating") {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      } else if (librarySort === "year") {
        return (b.year || 0) - (a.year || 0);
      } else if (librarySort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [allMovies, librarySearch, libraryGenre, libraryYear, libraryType, librarySort]);`;
  
const sortReplacement = `    // Filter out movies without posters to clean up the library
    filtered = filtered.filter(m => m.posterUrl && m.posterUrl.trim() !== "");

    // Sort
    return [...filtered].sort((a, b) => {
      if (librarySort === "popularity") {
        // Better mock popularity: prioritize trending/curated movies, then vote average
        const isCuratedA = mappedCollections.some(c => c.movies.some(cm => cm.id === a.id)) ? 1000 : 0;
        const isCuratedB = mappedCollections.some(c => c.movies.some(cm => cm.id === b.id)) ? 1000 : 0;
        
        const popA = isCuratedA + (a.voteAverage || 0) * 10 + ((a.year && a.year > 2015) ? (a.year - 2015) * 2 : 0);
        const popB = isCuratedB + (b.voteAverage || 0) * 10 + ((b.year && b.year > 2015) ? (b.year - 2015) * 2 : 0);
        return popB - popA;
      } else if (librarySort === "rating") {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      } else if (librarySort === "year") {
        return (b.year || 0) - (a.year || 0);
      } else if (librarySort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [allMoviesBase, mappedCollections, librarySearch, libraryGenre, libraryYear, libraryType, librarySort]);`;

content = content.replace(sortTarget, sortReplacement);
fs.writeFileSync('src/App.tsx', content);
console.log('done pop');
