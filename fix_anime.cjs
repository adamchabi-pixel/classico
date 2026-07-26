const fs = require('fs');

// 1. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');
const targetServerAnime = `function isAnimeOrAdult(m) {
  if (m.adult) return true;
  if (m.original_language === 'ja' || m.original_language === 'ko' || m.original_language === 'zh') return true;
  if (m.origin_country && (m.origin_country.includes('JP') || m.origin_country.includes('KR') || m.origin_country.includes('CN'))) return true;
  
  const title = (m.title || m.name || m.original_title || m.original_name || '').toLowerCase();
  if (title.includes('naruto') || title.includes('boruto') || title.includes('dragon ball') || title.includes('one piece') || title.includes('bleach') || title.includes('attack on titan')) return true;
  if (m.genre_ids && m.genre_ids.includes(16)) {
    if (m.origin_country && m.origin_country.includes('JP')) return true;
    if (m.original_language === 'ja') return true;
  }
  return false;
}`;
const replacementServerAnime = `function isAnimeOrAdult(m) {
  if (m.adult) return true;
  if (m.original_language === 'ja' || m.original_language === 'ko' || m.original_language === 'zh') return true;
  if (m.origin_country && (m.origin_country.includes('JP') || m.origin_country.includes('KR') || m.origin_country.includes('CN'))) return true;
  
  const title = (m.title || m.name || m.original_title || m.original_name || '').toLowerCase();
  const bannedWords = ['anime', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'death note', 'hunter x hunter', 'jujutsu kaisen', 'demon slayer', 'my hero academia', 'fullmetal alchemist', 'tokyo ghoul'];
  if (bannedWords.some(w => title.includes(w))) return true;
  
  if (m.genre_ids && m.genre_ids.includes(16)) {
    if (m.origin_country && m.origin_country.includes('JP')) return true;
    if (m.original_language === 'ja') return true;
  }
  return false;
}`;
serverContent = serverContent.replace(targetServerAnime, replacementServerAnime);
fs.writeFileSync('server.ts', serverContent);


// 2. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const targetAppAnime = `const isAnimeOrAdult = (m: any) => {
  if (m.adult) return true;
  const hasBannedGenre = m.genre?.some((g: string) => {
    const lower = g.toLowerCase();
    return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
  });
  const lowerTitle = (m.title || '').toLowerCase();
  const hasBannedTitle = lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach') || lowerTitle.includes('attack on titan') || lowerTitle.includes('jujutsu kaisen') || lowerTitle.includes('demon slayer') || lowerTitle.includes('my hero academia');
  const hasTmdbAnime = m.providerIds?.Tmdb && m.originalLanguage === 'ja' && m.genre?.includes('Animation');
  return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
};
const isAnimeOrAdultKeyword = (q: string) => {
  const term = q.toLowerCase();
  const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia'];
  return banned.some(b => term.includes(b));
};`;
const replacementAppAnime = `const isAnimeOrAdult = (m: any) => {
  if (m.adult) return true;
  const hasBannedGenre = m.genre?.some((g: string) => {
    const lower = g.toLowerCase();
    return lower.includes('anime') || lower.includes('hentai') || lower.includes('adult') || lower.includes('japanimation');
  });
  const lowerTitle = (m.title || '').toLowerCase();
  const bannedWords = ['hentai', 'anime', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia', 'death note', 'hunter x hunter', 'fullmetal alchemist', 'tokyo ghoul'];
  const hasBannedTitle = bannedWords.some(w => lowerTitle.includes(w));
  const hasTmdbAnime = m.providerIds?.Tmdb && m.originalLanguage === 'ja' && m.genre?.includes('Animation');
  return hasBannedGenre || hasBannedTitle || hasTmdbAnime;
};
const isAnimeOrAdultKeyword = (q: string) => {
  const term = q.toLowerCase();
  const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia', 'death note', 'hunter x hunter'];
  return banned.some(b => term.includes(b));
};`;
appContent = appContent.replace(targetAppAnime, replacementAppAnime);
fs.writeFileSync('src/App.tsx', appContent);
