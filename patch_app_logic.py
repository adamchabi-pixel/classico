import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => { if (a.id === "trending-now") return -1; if (b.id === "trending-now") return 1; return a.title.localeCompare(b.title); });',
    'const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => a.title.localeCompare(b.title));'
)

content = content.replace('|| collection.id === "trending-now"', '')
content = content.replace('collection.id === "trending-now" || ', '')

content = content.replace(
    'className={collection.id === "trending-now" ? "w-[200px] min-[400px]:w-[240px] sm:w-[300px] aspect-[2/3] mr-12 sm:mr-20" : undefined}',
    ''
)
content = content.replace(
    'trendingIndex={collection.id === "trending-now" ? idx + 1 : undefined}',
    ''
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
