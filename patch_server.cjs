const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Modify URL
code = code.replace(
  /append_to_response=credits,videos,similar/g,
  'append_to_response=credits,videos,similar,images&include_image_language=en,null'
);

// Add logo extraction
code = code.replace(
  /const releaseDate = isTv \? m\.first_air_date : m\.release_date;/,
  `const releaseDate = isTv ? m.first_air_date : m.release_date;
    const logos = m.images?.logos || [];
    const bestLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0];
    const logoUrl = bestLogo ? \`https://image.tmdb.org/t/p/w500\${bestLogo.file_path}\` : "";`
);

// Add logoUrl and hasLogo to movieData
code = code.replace(
  /cast: cast,/,
  `cast: cast,
      logoUrl: logoUrl,
      hasLogo: !!logoUrl,`
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts for logos");
