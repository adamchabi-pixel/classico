import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# 1. Update the director regex in App.tsx
old_director_filter = 'if (!/tarantino|nolan/i.test(dName)) {'
new_director_filter = 'if (!/tarantino|nolan|avildsen|stallone|stalonne|fincher/i.test(dName)) {'
text = text.replace(old_director_filter, new_director_filter)

# 2. Update finalUnmatchedMovies filter
old_unmatched = 'const finalUnmatchedMovies = jellyfinMovies.filter((m) => !matchedServersMovieIds.has(m.id));'
new_unmatched = """const finalUnmatchedMovies = jellyfinMovies.filter((m) => {
      if (matchedServersMovieIds.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      return true;
    });"""
text = text.replace(old_unmatched, new_unmatched)

with open('src/App.tsx', 'w') as f:
    f.write(text)
