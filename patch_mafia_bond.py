import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update style spread order in renderer so style can override masks
pattern_render = re.compile(r'(backgroundImage: `url\(\'\$\{COLLECTION_BANNERS\[c\.id\]\.url\}\'\)`,\s*)\.\.\.\(COLLECTION_BANNERS\[c\.id\]\.style \|\| \{\}\),(\s*mixBlendMode: \'lighten\',\s*WebkitMaskImage: [^\n]+,\s*maskImage: [^\n]+)')
content = pattern_render.sub(r'\1\2,\n                            ...(COLLECTION_BANNERS[c.id].style || {})', content)

# 2. Update COLLECTION_BANNERS for james-bond and mafia-movies to have square aspect ratio
content = content.replace(
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundSize: "auto 90%", backgroundPosition: "right 20%" } }',
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { width: "auto", aspectRatio: "1/1", right: "-10%", backgroundPosition: "right 20%" } }'
)

content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundSize: "auto 90%", backgroundPosition: "right top" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { width: "auto", aspectRatio: "1/1", right: "-10%", backgroundPosition: "right top" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
