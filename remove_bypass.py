import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
'''          if (collection.id === "trending-now" || collection.id === "comedy-gold" || collection.id === "mind-bending-mysteries" || collection.id === "mafia-movies") {
            return movie;
          }''',
''
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
