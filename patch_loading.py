import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "if (jellyfinConfig === null || isJellyfinLoading) {",
    "if (jellyfinConfig === null || (isJellyfinLoading && jellyfinMovies.length === 0)) {"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
