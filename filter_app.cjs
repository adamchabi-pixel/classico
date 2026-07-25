const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  useEffect(() => {
    if (!searchQuery.trim()) {
      setTmdbSearchResults([]);
      return;
    }`;

const replacement1 = `  const isAnimeOrAdultKeyword = (q: string) => {
    const term = q.toLowerCase();
    const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi'];
    return banned.some(b => term.includes(b));
  };

  useEffect(() => {
    if (!searchQuery.trim() || isAnimeOrAdultKeyword(searchQuery)) {
      setTmdbSearchResults([]);
      return;
    }`;

const target2 = `    const localMatches = allMovies.filter(
      (m) =>
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    );`;

const replacement2 = `    const localMatches = isAnimeOrAdultKeyword(searchQuery) ? [] : allMovies.filter(
      (m) =>
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    ).filter(m => {
      // Exclude if genre has animation and country is JP or original language is ja (if we have that info)
      // Usually local movies don't have origin_country easily, but we can filter by genre "Animation" + origin.
      // We'll just exclude if it has 'Anime' or 'Hentai' in genres
      const hasBannedGenre = m.genre?.some(g => {
        const lower = g.toLowerCase();
        return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult');
      });
      return !hasBannedGenre;
    });`;

const target3 = `        if (res.ok) {
          const m = await res.json();
          if (m.results) {
            const formatted = m.results.map((r: any) => {`;

const replacement3 = `        if (res.ok) {
          const m = await res.json();
          if (m.results) {
            const isAnimeOrAdult = (r: any) => {
              if (r.adult) return true;
              if (r.genre_ids && r.genre_ids.includes(16)) {
                if (r.origin_country && r.origin_country.includes('JP')) return true;
                if (r.original_language === 'ja') return true;
              }
              return false;
            };
            const validResults = m.results.filter((r: any) => !isAnimeOrAdult(r));
            const formatted = validResults.map((r: any) => {`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);
fs.writeFileSync('src/App.tsx', content);
console.log('done');
