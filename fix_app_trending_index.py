import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace <MovieCard movie={movie} ... /> with the trendingIndex prop in the main collections view
old_call = """                                <MovieCard
                                  movie={movie}
                                  onSelect={(m) => handleOpenMovie(m, false)}
                                  onPlay={(m) => handleOpenMovie(m, true)}
                                />"""
new_call = """                                <MovieCard
                                  movie={movie}
                                  onSelect={(m) => handleOpenMovie(m, false)}
                                  onPlay={(m) => handleOpenMovie(m, true)}
                                  trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                                />"""
text = text.replace(old_call, new_call, 1) # Only the first one which is inside the collections loop

with open('src/App.tsx', 'w') as f:
    f.write(text)
