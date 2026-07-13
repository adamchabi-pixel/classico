import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace <MovieCard movie={movie} ... /> with the trendingIndex prop in the main collections loop
# I will use regex to find the right MovieCard call under collection.movies.map

pattern = r"(collection\.movies\.map\(\(movie, idx\) => \(\s*<LazyVirtualCard key=\{`\$\{collection\.id\}-\$\{movie\.id\}`\}>\s*)<MovieCard\s*movie=\{movie\}\s*onSelect=\{\(m\) => handleOpenMovie\(m, false\)\}\s*onPlay=\{\(m\) => handleOpenMovie\(m, true\)\}\s*/>"

new_call = r"\1<MovieCard\n                                  movie={movie}\n                                  onSelect={(m) => handleOpenMovie(m, false)}\n                                  onPlay={(m) => handleOpenMovie(m, true)}\n                                  trendingIndex={collection.id === 'trending-now' ? idx + 1 : undefined}\n                                />"

text = re.sub(pattern, new_call, text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
