const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /app\.post\("\/api\/admin\/movies\/add", express\.json\(\), async \(req, res\) => \{/,
  `app.post("/api/admin/save-to-code", async (req, res) => {
  try {
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let data = "[]";
    if (fs.existsSync(DB_PATH)) {
      data = fs.readFileSync(DB_PATH, "utf-8");
    }
    const tsCode = \`export const importedMoviesData = \${data};\n\`;
    fs.writeFileSync(path.join(process.cwd(), "src/data/imported_movies.ts"), tsCode, "utf-8");
    return res.json({ success: true });
  } catch(e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/movies/add", express.json(), async (req, res) => {`
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Added save to code");
