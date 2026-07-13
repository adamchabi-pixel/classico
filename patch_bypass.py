import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_bypass = '''          if (collection.id === "trending-now") {
            return movie;
          }'''

new_bypass = '''          if (collection.id === "trending-now" || collection.id === "comedy-gold" || collection.id === "mind-bending-mysteries" || collection.id === "mafia-movies") {
            return movie;
          }'''

text = text.replace(old_bypass, new_bypass)

with open('src/App.tsx', 'w') as f:
    f.write(text)
