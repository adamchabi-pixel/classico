const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Undo the first bad replace
code = code.replace(
  /const releaseDate = isTv \? m\.first_air_date : m\.release_date;\s*const logos = m\.images\?\.logos \|\| \[\];\s*const bestLogo = logos\.find\(\(l: any\) => l\.iso_639_1 === 'en'\) \|\| logos\[0\];\s*const logoUrl = bestLogo \? `https:\/\/image\.tmdb\.org\/t\/p\/w500\$\{bestLogo\.file_path\}` : "";/g,
  'const releaseDate = isTv ? m.first_air_date : m.release_date;'
);

// Now properly replace inside /api/movie/:id
code = code.replace(
  /const cast = m\.credits\?\.cast\?\.slice\(0, 4\)\.map\(\(c: any\) => c\.name\) \|\| \[\];\s*const releaseDate = isTv \? m\.first_air_date : m\.release_date;/,
  `const cast = m.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [];
    const releaseDate = isTv ? m.first_air_date : m.release_date;
    const logos = m.images?.logos || [];
    const bestLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0];
    const logoUrl = bestLogo ? \`https://image.tmdb.org/t/p/w500\${bestLogo.file_path}\` : "";`
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts 2");
