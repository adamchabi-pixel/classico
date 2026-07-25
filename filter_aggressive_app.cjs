const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const isAnimeOrAdultKeyword = (q: string) => {
    const term = q.toLowerCase();
    const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi'];
    return banned.some(b => term.includes(b));
  };`;

const replacement1 = `  const isAnimeOrAdultKeyword = (q: string) => {
    const term = q.toLowerCase();
    const banned = ['anime', 'animé', 'hentai', 'manga', 'japanimation', 'ecchi', 'naruto', 'boruto', 'dragon ball', 'one piece', 'bleach', 'attack on titan', 'jujutsu kaisen', 'demon slayer', 'my hero academia'];
    return banned.some(b => term.includes(b));
  };`;

content = content.replace(target1, replacement1);

const target2 = `const hasBannedTitle = lowerTitle.includes('hentai');`;
const replacement2 = `const hasBannedTitle = lowerTitle.includes('hentai') || lowerTitle.includes('naruto') || lowerTitle.includes('boruto') || lowerTitle.includes('dragon ball') || lowerTitle.includes('one piece') || lowerTitle.includes('bleach');`;

content = content.split(target2).join(replacement2);

const target3 = `            const isAnimeOrAdult = (r: any) => {
              if (r.adult) return true;
              if (r.genre_ids && r.genre_ids.includes(16)) {
                if (r.origin_country && r.origin_country.includes('JP')) return true;
                if (r.original_language === 'ja') return true;
              }
              return false;
            };`;

const replacement3 = `            const isAnimeOrAdult = (r: any) => {
              if (r.adult) return true;
              if (r.original_language === 'ja' || r.original_language === 'ko' || r.original_language === 'zh') return true;
              if (r.origin_country && (r.origin_country.includes('JP') || r.origin_country.includes('KR') || r.origin_country.includes('CN'))) return true;
              
              const title = (r.title || r.name || r.original_title || r.original_name || '').toLowerCase();
              if (title.includes('naruto') || title.includes('boruto') || title.includes('dragon ball') || title.includes('one piece') || title.includes('bleach') || title.includes('attack on titan')) return true;
              
              if (r.genre_ids && r.genre_ids.includes(16)) {
                if (r.origin_country && r.origin_country.includes('JP')) return true;
                if (r.original_language === 'ja') return true;
              }
              return false;
            };`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
