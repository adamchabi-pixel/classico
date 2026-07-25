const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `function isAnimeOrAdult(m) {
  if (m.adult) return true;
  if (m.genre_ids && m.genre_ids.includes(16)) {
    if (m.origin_country && m.origin_country.includes('JP')) return true;
    if (m.original_language === 'ja') return true;
  }
  return false;
}`;

const replacement = `function isAnimeOrAdult(m) {
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

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
console.log('done');
