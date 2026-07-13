import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace the trending-now width
old_w = 'className={collection.id === "trending-now" ? "w-[170px] min-[400px]:w-[200px] sm:w-[250px] aspect-[2/3] mr-8 sm:mr-16" : undefined}'
new_w = 'className={collection.id === "trending-now" ? "w-[200px] min-[400px]:w-[240px] sm:w-[300px] aspect-[2/3] mr-12 sm:mr-20" : undefined}'

text = text.replace(old_w, new_w)

with open('src/App.tsx', 'w') as f:
    f.write(text)
