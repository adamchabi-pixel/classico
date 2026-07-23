const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Inside /api/movie/:id, right before res.json({ success: true, movie: movieData });
const insertStr = `
    // AUTOMATICALLY SAVE TO CODEBASE SO IT IS INCLUDED IN DEPLOYMENT
    try {
      const DB_PATH = path.join(process.cwd(), "imported_movies.json");
      let data = [];
      if (fs.existsSync(DB_PATH)) {
        try {
          data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        } catch(e) {}
      }
      if (!data.some((existing: any) => existing.id === movieData.id)) {
        data.push(movieData);
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
        const tsCode = \`export const importedMoviesData = \${JSON.stringify(data, null, 2)};\\n\`;
        fs.writeFileSync(path.join(process.cwd(), "src/data/imported_movies.ts"), tsCode, "utf-8");
        console.log("Automatically saved movie to codebase for deployment:", movieData.title);
      }
    } catch(err) {
      console.error("Auto-save failed", err);
    }
`;

code = code.replace(
  /(\s*)(res\.json\(\{ success: true, movie: movieData \}\);)/,
  `$1${insertStr}$1$2`
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Added auto-save to server.ts");
