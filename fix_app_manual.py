import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# I will find this specific block:
old_block = """                          {collection.movies.map((movie) => (
                            <LazyVirtualCard key={`${collection.id}-${movie.id}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />"""

new_block = """                          {collection.movies.map((movie, idx) => (
                            <LazyVirtualCard key={`${collection.id}-${movie.id}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                              />"""

text = text.replace(old_block, new_block)

with open('src/App.tsx', 'w') as f:
    f.write(text)
