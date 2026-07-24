const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const replacement = `app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isTv = id.endsWith('-tv');
    let actualId = isTv ? id.replace('-tv', '') : id;
    
    // Look up tmdbId if the id is a jellyfin hash
    if (actualId.length > 20) {
      const match = allMovies.find(m => m.id === actualId);
      if (match && (match.tmdbId || (match.providerIds && match.providerIds.Tmdb))) {
        actualId = match.tmdbId || match.providerIds.Tmdb;
      }
    }
`;

code = code.replace(
  /app\.get\("\/api\/movie\/:id", async \(req, res\) => \{\s*try \{\s*const \{ id \} = req\.params;\s*const isTv = id\.endsWith\('-tv'\);\s*const actualId = isTv \? id\.replace\('-tv', ''\) : id;/,
  replacement
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server API");
