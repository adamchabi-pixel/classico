import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove Jellyfin routes entirely and replace with simple imported movies
api_movies_replacement = '''app.get("/api/movies", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  let importedMovies = getGlobalImportedMovies();
  res.json({ success: true, movies: importedMovies });
});'''
content = re.sub(r'app\.get\("/api/movies"[\s\S]*?\n\}\);', api_movies_replacement, content, count=1)

api_hero_replacement = '''app.get("/api/hero", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  let importedMovies = getGlobalImportedMovies();
  const allHeroes = [...importedMovies].reverse().slice(0, 5);
  res.json({ success: true, heroes: allHeroes, hero: allHeroes[0] });
});'''
content = re.sub(r'app\.get\("/api/hero"[\s\S]*?\n\}\);', api_hero_replacement, content, count=1)

with open('server.ts', 'w') as f:
    f.write(content)
