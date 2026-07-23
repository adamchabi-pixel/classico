const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update URL
code = code.replace(
  /const url = isTv\s*\?\s*`https:\/\/api\.themoviedb\.org\/3\/tv\/\$\{tmdbId\}\?append_to_response=credits,images&include_image_language=en,null&language=fr-FR`\s*:\s*`https:\/\/api\.themoviedb\.org\/3\/movie\/\$\{tmdbId\}\?append_to_response=credits,images&include_image_language=en,null&language=fr-FR`;/,
  `const url = isTv 
      ? \`https://api.themoviedb.org/3/tv/\${tmdbId}?append_to_response=credits,images,similar&include_image_language=en,null&language=fr-FR\`
      : \`https://api.themoviedb.org/3/movie/\${tmdbId}?append_to_response=credits,images,similar&include_image_language=en,null&language=fr-FR\`;`
);

// Add castDetails and similar parsing
const insertionRegex = /const cast = m\.credits\?\.cast\?\.slice\(0, 3\)\.map\(\(c: any\) => c\.name\) \|\| \[\];/;
const additionalDataCode = `const cast = m.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
    const castDetails = m.credits?.cast?.slice(0, 10).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      role: c.character,
      imageUrl: c.profile_path ? \`https://image.tmdb.org/t/p/w185\${c.profile_path}\` : null
    })) || [];
    
    const similar = m.similar?.results?.slice(0, 10).map((s: any) => ({
      id: isTv ? \`\${s.id}-tv\` : String(s.id),
      tmdbId: String(s.id),
      title: isTv ? s.name : s.title,
      posterUrl: s.poster_path ? \`https://image.tmdb.org/t/p/w500\${s.poster_path}\` : "",
      year: (isTv ? s.first_air_date : s.release_date) ? parseInt((isTv ? s.first_air_date : s.release_date).substring(0, 4)) : 0,
      isTv
    })) || [];`;

code = code.replace(insertionRegex, additionalDataCode);

// Add to movieData
const movieDataRegex = /cast: cast,/;
code = code.replace(movieDataRegex, `cast: cast,
      castDetails: castDetails,
      similar: similar,`);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with castDetails and similar");
