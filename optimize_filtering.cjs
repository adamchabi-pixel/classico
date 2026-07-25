const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const isAnimeOrAdultFn = `const isAnimeOrAdult = (m: Movie) => {
  const hasBannedGenre = m.genre?.some(g => {
    const lower = g.toLowerCase();
    return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
  });
  const lowerTitle = m.title?.toLowerCase() || '';
  const hasBannedTitle = lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach') || lowerTitle.includes('attack on titan') || lowerTitle.includes('jujutsu kaisen') || lowerTitle.includes('demon slayer') || lowerTitle.includes('my hero academia');
  const hasTmdbAnime = m.providerIds?.Tmdb && (m as any).originalLanguage === 'ja' && m.genre?.includes('Animation');
  return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
};

const isAnimeOrAdultKeyword = (q: string) => {
  const term = q.toLowerCase();
  const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia'];
  return banned.some(b => term.includes(b));
};
`;

// Insert the functions before the App component
content = content.replace('export default function App() {', isAnimeOrAdultFn + '\nexport default function App() {');

// Remove the local isAnimeOrAdultKeyword inside App
const keywordTarget = `  const isAnimeOrAdultKeyword = (q: string) => {
    const term = q.toLowerCase();
    const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia'];
    return banned.some(b => term.includes(b));
  };`;
content = content.replace(keywordTarget, "");

// In allMoviesBase, filter combined
const allMoviesBaseTarget = `  const allMoviesBase = React.useMemo(() => {
    const combined = [...importedMoviesData, ...allMoviesData];`;
const allMoviesBaseReplacement = `  const allMoviesBase = React.useMemo(() => {
    const combined = [...importedMoviesData, ...allMoviesData].filter(m => !isAnimeOrAdult(m as unknown as Movie));`;
content = content.replace(allMoviesBaseTarget, allMoviesBaseReplacement);

// Remove local isAnimeOrAdult in mappedCollections
const mappedCollectionsTarget = `  const mappedCollections = React.useMemo(() => {
    const isAnimeOrAdult = (m: Movie) => {
      const hasBannedGenre = m.genre?.some(g => {
        const lower = g.toLowerCase();
        return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
      });
      // also check if title contains anime or hentai
      const lowerTitle = m.title?.toLowerCase() || '';
      const hasBannedTitle = lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach');
      
      // we can also check if TMDB genre array has 16 and origin is JP
      const hasTmdbAnime = m.providerIds?.Tmdb && (m as any).originalLanguage === 'ja' && m.genre?.includes('Animation');
      
      return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
    };`;
content = content.replace(mappedCollectionsTarget, `  const mappedCollections = React.useMemo(() => {`);

// Remove local isAnimeOrAdult in allMovies
const allMoviesTarget = `  const allMovies = React.useMemo(() => {
    const isAnimeOrAdult = (m: Movie) => {
      const hasBannedGenre = m.genre?.some(g => {
        const lower = g.toLowerCase();
        return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult');
      });
      const lowerTitle = m.title?.toLowerCase() || '';
      const hasBannedTitle = lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach');
      return hasBannedGenre || hasBannedTitle;
    };`;
content = content.replace(allMoviesTarget, `  const allMovies = React.useMemo(() => {`);

// In allMovies, replace the redundant checks since we've already filtered allMoviesBase
const filterTarget = `    // Add Jellyfin-only library movies that did not match any of the hand-crafted collections
    allMoviesBase.forEach(m => {
      if (!isAnimeOrAdult(m) && !map.has(m.id)) {
        map.set(m.id, { ...m});
      }
    });`;
const filterReplacement = `    // Add Jellyfin-only library movies that did not match any of the hand-crafted collections
    allMoviesBase.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m});
      }
    });`;
content = content.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
