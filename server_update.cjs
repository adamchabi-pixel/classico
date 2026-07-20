const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Append movies logic to get movies
code = code.replace(
  'res.json({\n      success: true,\n      movies: cachedMovies\n    });',
  `
    let importedMovies = [];
    try {
      if (fs.existsSync(path.join(process.cwd(), "imported_movies.json"))) {
        importedMovies = JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8"));
      }
    } catch (e) {}
    res.json({
      success: true,
      movies: [...importedMovies, ...cachedMovies]
    });
`
);

// Append movies logic to fast fetch response
code = code.replace(
  'res.json({\n      success: true,\n      movies: fastMovies\n    });',
  `
    let importedMovies = [];
    try {
      if (fs.existsSync(path.join(process.cwd(), "imported_movies.json"))) {
        importedMovies = JSON.parse(fs.readFileSync(path.join(process.cwd(), "imported_movies.json"), "utf-8"));
      }
    } catch (e) {}
    res.json({
      success: true,
      movies: [...importedMovies, ...fastMovies]
    });
`
);

fs.writeFileSync('server.ts', code);
