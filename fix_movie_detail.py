import re

with open('src/components/MovieDetailView.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'isJellyfin', 'isCatalog', content)

with open('src/components/MovieDetailView.tsx', 'w') as f:
    f.write(content)
