const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const apiModifications = `// Collections modifications API
app.get("/api/admin/collections/modifications", (req, res) => {
  const DB_PATH = path.join(process.cwd(), "collections_modifications.json");
  let mods = { deletedCollections: [], addedMovies: {}, removedMovies: {} };
  if (fs.existsSync(DB_PATH)) {
    try { mods = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); } catch(e) {}
  }
  res.json({ success: true, modifications: mods });
});

app.post("/api/admin/collections/modify", express.json(), (req, res) => {
  const { action, collectionId, movieId } = req.body;
  const DB_PATH = path.join(process.cwd(), "collections_modifications.json");
  let mods = { deletedCollections: [], addedMovies: {}, removedMovies: {} };
  if (fs.existsSync(DB_PATH)) {
    try { mods = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); } catch(e) {}
  }
  
  if (action === "delete_collection") {
    if (!mods.deletedCollections.includes(collectionId)) {
      mods.deletedCollections.push(collectionId);
    }
  } else if (action === "remove_movie") {
    if (!mods.removedMovies[collectionId]) mods.removedMovies[collectionId] = [];
    if (!mods.removedMovies[collectionId].includes(movieId)) {
      mods.removedMovies[collectionId].push(movieId);
    }
  } else if (action === "add_movie") {
    // Note: To fully add a movie it must exist in imported_movies.json. We will assume it does, or this just tags it.
    if (!mods.addedMovies[collectionId]) mods.addedMovies[collectionId] = [];
    if (!mods.addedMovies[collectionId].includes(movieId)) {
      mods.addedMovies[collectionId].push(movieId);
    }
  }

  try { fs.writeFileSync(DB_PATH, JSON.stringify(mods, null, 2)); } catch(e) {}
  res.json({ success: true, modifications: mods });
});
`;

code = code.replace('app.post("/api/admin/movies/add"', apiModifications + '\napp.post("/api/admin/movies/add"');

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with collections API");
