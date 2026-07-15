import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'aspect-[16/9] sm:aspect-auto sm:min-h-[220px]',
    'min-h-[200px] sm:min-h-[220px]'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
