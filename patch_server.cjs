const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/director: director,\s*cast: cast,/g, `director: director,
      cast: cast,
      castDetails: m.credits?.cast?.slice(0, 8).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        role: c.character,
        imageUrl: c.profile_path ? \`https://image.tmdb.org/t/p/w200\${c.profile_path}\` : undefined
      })) || [],
      similar: m.similar?.results?.slice(0, 8).map((sm: any) => ({
        id: String(sm.id) + (isTv ? "-tv" : ""),
        tmdbId: String(sm.id),
        isTv,
        title: isTv ? sm.name : sm.title,
        description: sm.overview,
        posterUrl: sm.poster_path ? \`https://image.tmdb.org/t/p/w500\${sm.poster_path}\` : "",
        backdropUrl: sm.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${sm.backdrop_path}\` : "",
        year: (isTv ? sm.first_air_date : sm.release_date) ? parseInt((isTv ? sm.first_air_date : sm.release_date).substring(0, 4)) : new Date().getFullYear(),
      })) || [],`);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts");
