import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'setJellyfinMovies(libData.movies || []);\\n                try { localStorage.setItem("classico_movies_cache", JSON.stringify(libData.movies || [])); } catch(e) {}',
    'setJellyfinMovies(libData.movies || []);\n                try { localStorage.setItem("classico_movies_cache", JSON.stringify(libData.movies || [])); } catch(e) {}'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
