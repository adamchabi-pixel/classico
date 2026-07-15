import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_filter = """    const finalUnmatchedMovies = jellyfinMovies.filter((m) => {
      if (matchedServersMovieIds.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      if (t.includes("21 jump street") || t.includes("22 jump street") || t.includes("superbad") || t.includes("grown ups") || t.includes("white chicks")) return false;
      if (t.includes("memories of murder")) return false;
      return true;
    });"""

new_filter = """    const finalUnmatchedMovies = jellyfinMovies.filter((m) => {
      return !matchedServersMovieIds.has(m.id);
    });"""

content = content.replace(old_filter, new_filter)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
