const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const mappedCollections = React.useMemo(() => {`;

const replacement1 = `  const mappedCollections = React.useMemo(() => {
    const isAnimeOrAdult = (m: Movie) => {
      const hasBannedGenre = m.genre?.some(g => {
        const lower = g.toLowerCase();
        return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
      });
      // also check if title contains anime or hentai
      const lowerTitle = m.title?.toLowerCase() || '';
      const hasBannedTitle = lowerTitle.includes('hentai');
      
      // we can also check if TMDB genre array has 16 and origin is JP
      const hasTmdbAnime = m.providerIds?.Tmdb && (m as any).originalLanguage === 'ja' && m.genre?.includes('Animation');
      
      return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
    };
`;

const target2 = `    return initialCollections.map(c => ({
      ...c,
      movies: c.movies.map(m => enrichDynamicMovie(m, c.id))
    }));`;

const replacement2 = `    return initialCollections.map(c => ({
      ...c,
      movies: c.movies.filter(m => !isAnimeOrAdult(m)).map(m => enrichDynamicMovie(m, c.id))
    })).filter(c => c.movies.length > 0);`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

const target3 = `  const allMovies = React.useMemo(() => {`;
const replacement3 = `  const allMovies = React.useMemo(() => {
    const isAnimeOrAdult = (m: Movie) => {
      const hasBannedGenre = m.genre?.some(g => {
        const lower = g.toLowerCase();
        return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult');
      });
      const lowerTitle = m.title?.toLowerCase() || '';
      const hasBannedTitle = lowerTitle.includes('hentai');
      return hasBannedGenre || hasBannedTitle;
    };
`;
const target4 = `    mappedCollections.forEach(c => {
      c.movies.forEach(m => {
        if (!map.has(m.id)) {
          map.set(m.id, { ...m});
        }
      });
    });`;
const replacement4 = `    mappedCollections.forEach(c => {
      c.movies.forEach(m => {
        if (!isAnimeOrAdult(m) && !map.has(m.id)) {
          map.set(m.id, { ...m});
        }
      });
    });`;
const target5 = `    allMoviesBase.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m});
      }
    });`;
const replacement5 = `    allMoviesBase.forEach(m => {
      if (!isAnimeOrAdult(m) && !map.has(m.id)) {
        map.set(m.id, { ...m});
      }
    });`;

content = content.replace(target3, replacement3);
content = content.replace(target4, replacement4);
content = content.replace(target5, replacement5);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
