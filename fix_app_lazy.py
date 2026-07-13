import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace:
# <LazyVirtualCard key={`${collection.id}-${movie.id}`}>
#   <MovieCard ... />
# </LazyVirtualCard>
# 
# with the conditional className

old_block = """                          {collection.movies.map((movie, idx) => (
                            <LazyVirtualCard key={`${collection.id}-${movie.id}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                              />
                            </LazyVirtualCard>
                          ))}"""

new_block = """                          {collection.movies.map((movie, idx) => (
                            <LazyVirtualCard 
                              key={`${collection.id}-${movie.id}`}
                              className={collection.id === "trending-now" ? "w-[170px] min-[400px]:w-[200px] sm:w-[250px] aspect-[2/3] mr-12 sm:mr-20" : undefined}
                            >
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                              />
                            </LazyVirtualCard>
                          ))}"""

text = text.replace(old_block, new_block)

with open('src/App.tsx', 'w') as f:
    f.write(text)
