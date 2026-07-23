const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /let tmdbId = actualId;\s*if \(actualId\.startsWith\('tt'\)\) {[\s\S]*?} else if \(isNaN\(Number\(actualId\)\)\) {[\s\S]*?}/;

const replacement = `let tmdbId = actualId;
    
    // First, try to find the movie in our local database to get the real tmdbId
    let localMovie = null;
    try {
      const imported = fs.existsSync(path.join(process.cwd(), "imported_movies.json")) ? JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8")) : [];
      localMovie = [...imported, ...allMoviesData].find(m => m.id === actualId || m.imdbId === actualId);
    } catch(e) {}
    
    if (localMovie && localMovie.tmdbId && localMovie.tmdbId !== actualId) {
      tmdbId = localMovie.tmdbId;
    } else if (actualId.startsWith('tt')) {
      const findUrl = \`https://api.themoviedb.org/3/find/\${actualId}?external_source=imdb_id\`;
      const findRes = await fetch(findUrl, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
      if (findRes.ok) {
        const findData = await findRes.json();
        if (findData.movie_results && findData.movie_results.length > 0) {
          tmdbId = String(findData.movie_results[0].id);
        } else if (findData.tv_results && findData.tv_results.length > 0) {
          tmdbId = String(findData.tv_results[0].id);
        }
      }
    } else if (isNaN(Number(actualId))) {
      // It's a string slug, let's look it up
      if (localMovie) {
        const query = encodeURIComponent(localMovie.title);
        const searchUrl = isTv 
          ? \`https://api.themoviedb.org/3/search/tv?query=\${query}&first_air_date_year=\${localMovie.year}&language=en-US\`
          : \`https://api.themoviedb.org/3/search/movie?query=\${query}&year=\${localMovie.year}&language=en-US\`;
        
        const searchRes = await fetch(searchUrl, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }});
        if (searchRes.ok) {
          const data = await searchRes.json();
          if (data.results && data.results.length > 0) {
            tmdbId = String(data.results[0].id);
          }
        }
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Fixed server.ts tmdbId lookup");
