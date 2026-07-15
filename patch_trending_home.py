import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Restore Collections sorting
content = content.replace(
    'const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => a.title.localeCompare(b.title));',
    'const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => { if (a.id === "trending-now") return -1; if (b.id === "trending-now") return 1; return a.title.localeCompare(b.title); });'
)

# 2. Add to bypass condition
content = content.replace(
    'if (collection.id === "comedy-gold" || collection.id === "mind-bending-mysteries" || collection.id === "mafia-movies")',
    'if (collection.id === "trending-now" || collection.id === "comedy-gold" || collection.id === "mind-bending-mysteries" || collection.id === "mafia-movies")'
)

# 3. Filter from library
content = content.replace(
    '                {mappedCollections.map((c, i) => {',
    '                {mappedCollections.filter(c => c.id !== "trending-now").map((c, i) => {'
)

# 4. Restore gap
content = content.replace(
    'className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10"',
    'className={`flex overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10 ${collection.id === "trending-now" ? "gap-6 sm:gap-10" : "gap-4 sm:gap-8"}`}'
)

# 5. Restore LazyVirtualCard styling and MovieCard trendingIndex
lazy_card_target = r"""                            <LazyVirtualCard 
                              key={`${collection.id}-${movie.id}`}
                              
                            >
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                
                              />
                            </LazyVirtualCard>"""

lazy_card_replacement = r"""                            <LazyVirtualCard 
                              key={`${collection.id}-${movie.id}`}
                              className={collection.id === "trending-now" ? "w-[200px] min-[400px]:w-[240px] sm:w-[300px] aspect-[2/3] mr-12 sm:mr-20" : undefined}
                            >
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}
                              />
                            </LazyVirtualCard>"""

content = content.replace(lazy_card_target, lazy_card_replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patched successfully!")
