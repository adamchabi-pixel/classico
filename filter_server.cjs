const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const filterFunc = `
function isAnimeOrAdult(m) {
  if (m.adult) return true;
  if (m.genre_ids && m.genre_ids.includes(16)) {
    if (m.origin_country && m.origin_country.includes('JP')) return true;
    if (m.original_language === 'ja') return true;
  }
  return false;
}
`;

content = content.replace('const app = express();', filterFunc + '\nconst app = express();');

const target1 = `const validResults = combinedResults.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");`;
const replacement1 = `const validResults = combinedResults.filter((m: any) => (m.media_type === "movie" || m.media_type === "tv") && !isAnimeOrAdult(m));`;

// replace all occurrences of target1
content = content.split(target1).join(replacement1);

fs.writeFileSync('server.ts', content);
console.log('done');
