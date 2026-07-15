import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old = 'const match = jellyfinMovies.find((jf) => isMovieMatch(movie.title, jf.title));'
new = 'const match = jellyfinMovies.find((jf) => isMovieMatch(movie.title, jf.title));\n          if (movie.title.includes("Prada")) { console.log("Prada match:", match ? match.title : "Not found", "isMovieMatch returned", match ? true : false); }'

content = content.replace(old, new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

